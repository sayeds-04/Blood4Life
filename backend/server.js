const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const roleRoutes = require("./roleRoutes");
const { requireRole } = require("./middleware");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/roles', roleRoutes);

const PORT = process.env.PORT || 5000;

// Helper: Calculate days between date and today
const daysAgo = (dateStr) => {
  if (!dateStr) return 999;
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
};

const computeDonorStatus = (dateStr) => (!dateStr ? "Eligible" : daysAgo(dateStr) >= 90 ? "Eligible" : "Cooldown");
const todayISO = () => new Date().toISOString().slice(0, 10);

// =================================================================
// 1. AUTH ROUTES
// =================================================================

app.post("/api/auth/login", async (req, res) => {
  const { role, username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE role = ? AND LOWER(username) = LOWER(?)",
      [role, (username || "").trim()]
    );
    if (!rows.length) {
      return res.status(404).json({ error: `No ${role} account found for that username.` });
    }
    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }
    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        profileId: user.profile_id,
        license: user.license
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server database error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { role, username, password, name, group, gender, phone, email, city, address, license } = req.body;
  if (!name || !username || !password || password.length < 6 || !phone || !email || !city || !address) {
    return res.status(400).json({ error: "Please fill every field (password min 6 chars)." });
  }
  if (role === "hospital" && !license) {
    return res.status(400).json({ error: "Hospital license is required." });
  }
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", [username.trim()]);
    if (existing.length) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    const userId = `USR-${Date.now().toString().slice(-6)}`;
    const profileId = role === "donor" ? `D-${Math.floor(2300 + Math.random() * 900)}` : name.trim();

    await db.query(
      "INSERT INTO users (id, username, password, role, name, profile_id, license) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, username.trim(), password, role, name.trim(), profileId, license || null]
    );

    if (role === "donor") {
      await db.query(
        "INSERT INTO donors (id, user_id, name, blood_group, gender, city, address, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Eligible')",
        [profileId, userId, name.trim(), group || "O+", gender || "Male", city.trim(), address.trim(), phone.trim(), email.trim()]
      );
    } else if (role === "hospital") {
      await db.query(
        "INSERT INTO hospitals (name, license, address, city, phone, email) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE license=VALUES(license)",
        [name.trim(), license.trim(), address.trim(), city.trim(), phone.trim(), email.trim()]
      );
    }

    res.json({
      message: "Account created successfully",
      user: {
        id: userId, username: username.trim(), role, name: name.trim(),
        profileId, license, group: group || "O+", gender: gender || "Male",
        phone: phone.trim(), email: email.trim(), city: city.trim(), address: address.trim()
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server database error" });
  }
});

// =================================================================
// 2. INVENTORY ROUTES
// =================================================================

app.get("/api/inventory", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT blood_group as g, units, cap, DATE_FORMAT(expiry, '%Y-%m-%d') as expiry FROM inventory ORDER BY g ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/inventory/restock", async (req, res) => {
  const { blood_group } = req.body;
  try {
    await db.query("UPDATE inventory SET units = LEAST(cap, units + 1) WHERE blood_group = ?", [blood_group]);
    const [rows] = await db.query("SELECT blood_group as g, units, cap, DATE_FORMAT(expiry, '%Y-%m-%d') as expiry FROM inventory ORDER BY g DESC");
    res.json({ message: `Restocked ${blood_group}`, inventory: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// 3. REQUESTS ROUTES
// =================================================================

app.get("/api/requests", async (req, res) => {
  try {
    const [requests] = await db.query(
      "SELECT id, hospital, blood_group as `group`, units, urgency, status, time_ago as time, step, drone_dispatched as droneDispatched FROM requests ORDER BY created_at DESC"
    );
    const [matches] = await db.query("SELECT request_id, donor_id FROM request_matched_donors");
    const matchMap = {};
    matches.forEach(m => {
      if (!matchMap[m.request_id]) matchMap[m.request_id] = [];
      matchMap[m.request_id].push(m.donor_id);
    });

    const result = requests.map(r => ({
      ...r,
      droneDispatched: Boolean(r.droneDispatched),
      matchedDonorIds: matchMap[r.id] || []
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/requests", async (req, res) => {
  const { hospital, group, units, urgency } = req.body;
  const reqUnits = Math.max(1, Number(units) || 1);
  try {
    const [existing] = await db.query("SELECT id FROM requests");
    const reqId = `REQ-${1043 + existing.length}`;

    // Find busy donors matched to open requests
    const [busyRows] = await db.query(
      "SELECT DISTINCT donor_id FROM request_matched_donors rmd JOIN requests r ON rmd.request_id = r.id WHERE r.status IN ('Pending', 'Approved')"
    );
    const busySet = new Set(busyRows.map(b => b.donor_id));

    // Find eligible donors of matching blood group
    const [eligibleDonors] = await db.query(
      "SELECT id, name, blood_group FROM donors WHERE blood_group = ? AND status = 'Eligible'",
      [group]
    );
    const available = eligibleDonors.filter(d => !busySet.has(d.id));
    const matched = available.slice(0, reqUnits);

    await db.query(
      "INSERT INTO requests (id, hospital, blood_group, units, urgency, status, time_ago, step) VALUES (?, ?, ?, ?, ?, 'Pending', 'just now', 3)",
      [reqId, hospital, group, reqUnits]
    );

    for (const donor of matched) {
      await db.query("INSERT INTO request_matched_donors (request_id, donor_id) VALUES (?, ?)", [reqId, donor.id]);
      await db.query(
        "INSERT INTO notifications (donor_id, donor_name, blood_group, message_text, req_id, time_ago) VALUES (?, ?, ?, ?, ?, 'just now')",
        [donor.id, donor.name, group, `${group} request from ${hospital} — 1 bag needed from you`, reqId]
      );
    }

    res.json({
      message: "Request created",
      request: {
        id: reqId,
        hospital,
        group,
        units: reqUnits,
        urgency: urgency || "Normal",
        status: "Pending",
        time: "just now",
        step: 3,
        droneDispatched: false,
        matchedDonorIds: matched.map(d => d.id)
      }
    });
  } catch (err) {
    console.error("Create request error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/requests/:id/decide", async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // Approved or Rejected
  try {
    const stepVal = decision === "Approved" ? 4 : 1;
    await db.query("UPDATE requests SET status = ?, step = GREATEST(step, ?) WHERE id = ?", [decision, stepVal, id]);
    res.json({ message: `Request ${id} ${decision.toLowerCase()}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/requests/:id/complete", async (req, res) => {
  const { id } = req.params;
  try {
    const [reqRows] = await db.query("SELECT * FROM requests WHERE id = ?", [id]);
    if (!reqRows.length) return res.status(404).json({ error: "Request not found" });
    const request = reqRows[0];

    // Deduct stock
    await db.query("UPDATE inventory SET units = GREATEST(0, units - ?) WHERE blood_group = ?", [request.units, request.blood_group]);

    // Update request status
    await db.query("UPDATE requests SET status = 'Completed', step = 7 WHERE id = ?", [id]);

    // Update matched donors to cooldown
    const [matches] = await db.query("SELECT donor_id FROM request_matched_donors WHERE request_id = ?", [id]);
    const today = todayISO();
    for (const m of matches) {
      await db.query("UPDATE donors SET last_donation_date = ?, status = 'Cooldown' WHERE id = ?", [today, m.donor_id]);
      await db.query("INSERT INTO donations (donor_id, donation_date, qty, status) VALUES (?, ?, 450, 'Completed')", [m.donor_id, today]);
    }

    res.json({ message: `Request ${id} completed and inventory updated` });
  } catch (err) {
    console.error("Complete request error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/requests/:id/drone", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE requests SET drone_dispatched = 1, step = GREATEST(step, 5) WHERE id = ?", [id]);
    res.json({ message: `Drone dispatched for ${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// 4. DONOR ROUTES
// =================================================================

app.get("/api/donors", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, user_id as userId, name, blood_group as `group`, gender, city, address, phone, email, health_score as healthScore, streak, profile_pic as profilePic, DATE_FORMAT(last_donation_date, '%Y-%m-%d') as lastDonationDate, status, lat, lng FROM donors ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/donors", async (req, res) => {
  const { id, name, group, gender, city, address, phone, email, lastDonationDate, healthScore, streak, username, password } = req.body;
  const donorId = id || `D-${Math.floor(2300 + Math.random() * 900)}`;
  const status = computeDonorStatus(lastDonationDate);
  const uname = (username || name.split(" ")[0].toLowerCase() + donorId.replace(/[^0-9]/g, "")).trim();
  const pwd = password || "Donor@123";
  const userId = `USR-${donorId}`;

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE id = ? OR LOWER(username) = LOWER(?)", [userId, uname]);
    if (!existing.length) {
      await db.query(
        "INSERT INTO users (id, username, password, role, name, profile_id) VALUES (?, ?, ?, 'donor', ?, ?)",
        [userId, uname, pwd, name.trim(), donorId]
      );
    }
    await db.query(
      "INSERT INTO donors (id, user_id, name, blood_group, gender, city, address, phone, email, last_donation_date, health_score, streak, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [donorId, userId, name.trim(), group, gender || "Male", city, address, phone, email, lastDonationDate || null, healthScore || null, streak || 0, status]
    );
    res.json({ message: "Donor added", donor: { id: donorId, userId, name: name.trim(), group, gender: gender || "Male", city, address, phone, email, lastDonationDate, healthScore: healthScore || null, streak: streak || 0, status, lat: null, lng: null, username: uname, password: pwd } });
  } catch (err) {
    console.error("Add donor error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/donors/:id/location", async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  try {
    await db.query("UPDATE donors SET lat = ?, lng = ? WHERE id = ?", [lat, lng, id]);
    res.json({ message: "Location updated", id, lat, lng });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/donors/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { name, group, gender, city, address, phone, email, healthScore, streak, lastDonationDate } = req.body;
  try {
    await db.query(
      "UPDATE donors SET name = ?, blood_group = ?, gender = ?, city = ?, address = ?, phone = ?, email = ?, health_score = ?, streak = ?, last_donation_date = ? WHERE id = ?",
      [name, group, gender || "Male", city, address, phone, email, healthScore ?? null, streak ?? 0, lastDonationDate || null, id]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/donors/:id/picture", async (req, res) => {
  const { id } = req.params;
  const { profilePic } = req.body;
  if (!profilePic) return res.status(400).json({ error: "No image provided" });
  try {
    await db.query("UPDATE donors SET profile_pic = ? WHERE id = ?", [profilePic, id]);
    res.json({ message: "Profile picture updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/donors/:id/log-donation", async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const donationDate = date || todayISO();
  const status = computeDonorStatus(donationDate);
  try {
    await db.query("INSERT INTO donations (donor_id, donation_date, qty, status) VALUES (?, ?, 450, 'Completed')", [id, donationDate]);
    await db.query("UPDATE donors SET last_donation_date = ?, status = ? WHERE id = ?", [donationDate, status, id]);
    res.json({ message: "Donation logged successfully", lastDonationDate: donationDate, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/donors/:id/history", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT DATE_FORMAT(donation_date, '%Y-%m-%d') as date, qty, status FROM donations WHERE donor_id = ? ORDER BY donation_date DESC",
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// 5. NOTIFICATIONS ROUTES
// =================================================================

app.get("/api/notifications", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, donor_id as donorId, donor_name as donorName, blood_group as `group`, message_text as text, req_id as req, time_ago as time, responded FROM notifications ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notifications/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { responded } = req.body; // accepted or declined
  try {
    await db.query("UPDATE notifications SET responded = ? WHERE id = ?", [responded, id]);
    const [notifRows] = await db.query("SELECT * FROM notifications WHERE id = ?", [id]);
    if (notifRows.length && responded === "declined") {
      const notif = notifRows[0];
      if (notif.req_id && notif.req_id !== "CRISIS" && notif.req_id !== "URGENT") {
        // Remove declined donor from matched donors
        await db.query("DELETE FROM request_matched_donors WHERE request_id = ? AND donor_id = ?", [notif.req_id, notif.donor_id]);
        
        // Find replacement donor
        const [reqRows] = await db.query("SELECT * FROM requests WHERE id = ?", [notif.req_id]);
        if (reqRows.length) {
          const reqItem = reqRows[0];
          const [busyRows] = await db.query(
            "SELECT DISTINCT donor_id FROM request_matched_donors rmd JOIN requests r ON rmd.request_id = r.id WHERE r.status IN ('Pending', 'Approved')"
          );
          const busySet = new Set(busyRows.map(b => b.donor_id));
          const [candidates] = await db.query(
            "SELECT id, name FROM donors WHERE blood_group = ? AND status = 'Eligible' AND id != ?",
            [reqItem.blood_group, notif.donor_id]
          );
          const replacement = candidates.find(c => !busySet.has(c.id));
          if (replacement) {
            await db.query("INSERT INTO request_matched_donors (request_id, donor_id) VALUES (?, ?)", [reqItem.id, replacement.id]);
            await db.query(
              "INSERT INTO notifications (donor_id, donor_name, blood_group, message_text, req_id, time_ago) VALUES (?, ?, ?, ?, ?, 'just now')",
              [replacement.id, replacement.name, reqItem.blood_group, `${reqItem.blood_group} request from ${reqItem.hospital} — 1 bag needed from you`, reqItem.id]
            );
          }
        }
      }
    }
    res.json({ message: "Response recorded" });
  } catch (err) {
    console.error("Respond error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/critical-alert", async (req, res) => {
  const { groups } = req.body;
  try {
    const [eligible] = await db.query(
      "SELECT id, name, blood_group FROM donors WHERE blood_group IN (?) AND status = 'Eligible'",
      [groups]
    );
    for (const d of eligible) {
      await db.query(
        "INSERT INTO notifications (donor_id, donor_name, blood_group, message_text, req_id, time_ago) VALUES (?, ?, ?, ?, 'URGENT', 'just now')",
        [d.id, d.name, d.blood_group, `Urgent: ${d.blood_group} is critically low — can you donate today?`]
      );
    }
    res.json({ message: `Notified ${eligible.length} donors` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// 6. HOSPITAL & CRISIS ROUTES
// =================================================================

app.get("/api/hospitals/profile/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM hospitals WHERE name = ?", [name]);
    if (!rows.length) return res.status(404).json({ error: "Hospital not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/hospitals/profile", async (req, res) => {
  const { name, oldName, license, address, city, phone, email } = req.body;
  try {
    await db.query(
      "UPDATE hospitals SET name = ?, license = ?, address = ?, city = ?, phone = ?, email = ? WHERE name = ?",
      [name, license, address, city, phone, email, oldName || name]
    );
    if (oldName && oldName !== name) {
      await db.query("UPDATE requests SET hospital = ? WHERE hospital = ?", [name, oldName]);
    }
    res.json({ message: "Hospital profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/crisis", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT active FROM crisis_state WHERE id = 1");
    res.json({ active: Boolean(rows.length ? rows[0].active : 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crisis/toggle", async (req, res) => {
  const { active } = req.body;
  try {
    await db.query("UPDATE crisis_state SET active = ? WHERE id = 1", [active ? 1 : 0]);
    if (active) {
      const [eligible] = await db.query("SELECT id, name, blood_group FROM donors WHERE status = 'Eligible'");
      for (const d of eligible) {
        await db.query(
          "INSERT INTO notifications (donor_id, donor_name, blood_group, message_text, req_id, time_ago) VALUES (?, ?, ?, ?, 'CRISIS', 'just now')",
          [d.id, d.name, d.blood_group, "MASS CASUALTY ALERT — all eligible donors urgently needed at your nearest center"]
        );
      }
    }
    res.json({ message: `Crisis mode ${active ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Blood4Life API server running on http://localhost:${PORT}`);
});
