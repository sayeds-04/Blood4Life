import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import {
  Droplet, LayoutGrid, Users, Building2, Bell, ClipboardList, Activity,
  Plus, Check, X, AlertTriangle, ArrowRight, Quote, Award, Flame, HeartPulse,
  Heart, LogOut, Hospital as HospitalIcon, Radio, Sparkles, MapPin, ShieldCheck,
  TrendingUp, Timer, Truck, FlaskConical, PackageCheck, Star, Volume2, VolumeX,
  Search, Navigation, ScanLine, ChevronRight, Maximize2, Pencil, Phone, Mail,
  Brain, Thermometer, Siren, Plane, Recycle, Globe2, CalendarClock, Trophy, Route, Camera,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { api } from "./api";

/* ---------------------------------------------------------------
   Design tokens
----------------------------------------------------------------*/
const C = {
  bg: "#F5FBF7", greenDeep: "#0B3B24", greenDeep2: "#0E2A1C",
  surface: "#FFFFFF", surface2: "#EEF7F1", surface3: "#E1F0E6",
  border: "#DCEBE1", borderLight: "#C6E0D0",
  green: "#149A57", greenSoft: "#7CE8AE", greenDim: "#E1F5E9",
  red: "#E23D52", redDim: "#FCE9EC",
  amber: "#EFA23D", amberDim: "#FCF1DF",
  blue: "#3E7BFA", blueDim: "#EAF0FE",
  text: "#12241A", text2: "#4E6459", text3: "#84988C",
  teal: "#149A57", tealDim: "#E1F5E9",
};
const fontDisplay = "'Space Grotesk', 'Segoe UI', sans-serif";
const fontBody = "'Inter', 'Segoe UI', sans-serif";
const fontMono = "'IBM Plex Mono', 'Courier New', monospace";
const shadowSm = "0 1px 2px rgba(11,59,36,0.06), 0 1px 1px rgba(11,59,36,0.04)";
const shadowMd = "0 10px 30px rgba(11,59,36,0.09), 0 2px 8px rgba(11,59,36,0.05)";
const shadowLg = "0 24px 60px rgba(11,59,36,0.18), 0 6px 16px rgba(11,59,36,0.10)";
const glass = { background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(10px)" };

const IMG = {
  hero: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1400&q=80",
  doctor: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
  step1: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
  step2: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
  step3: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=600&q=80",
  banner: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80",
  maleAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  femaleAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  p1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  p2: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  p3: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  gallery: [1, 2, 3, 4, 5, 6].map((i) => `https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80`),
};

const getDonorAvatar = (gender) => (gender === "Female" ? IMG.femaleAvatar : IMG.maleAvatar);

/* ---------------------------------------------------------------
   Mock data / seeds (Used as fallback if database is starting up)
----------------------------------------------------------------*/
const INVENTORY_SEED = [
  { g: "O+", units: 42, cap: 60, expiry: "2026-08-24" }, { g: "O-", units: 9, cap: 40, expiry: "2026-08-13" },
  { g: "A+", units: 31, cap: 50, expiry: "2026-08-29" }, { g: "A-", units: 14, cap: 35, expiry: "2026-08-18" },
  { g: "B+", units: 26, cap: 45, expiry: "2026-08-27" }, { g: "B-", units: 6, cap: 30, expiry: "2026-08-12" },
  { g: "AB+", units: 18, cap: 30, expiry: "2026-08-21" }, { g: "AB-", units: 3, cap: 20, expiry: "2026-08-11" },
];

const REQUESTS_SEED = [
  { id: "REQ-1042", hospital: "Dhaka Medical College", group: "O-", units: 4, urgency: "Critical", status: "Pending", time: "6 min ago", step: 2, matchedDonorIds: ["D-2291"] },
  { id: "REQ-1041", hospital: "Square Hospital", group: "AB-", units: 2, urgency: "High", status: "Approved", time: "22 min ago", step: 4, matchedDonorIds: [] },
  { id: "REQ-1040", hospital: "United Hospital", group: "A+", units: 3, urgency: "Normal", status: "Completed", step: 7, matchedDonorIds: ["D-2251"] },
  { id: "REQ-1039", hospital: "Ibn Sina Hospital", group: "B-", units: 5, urgency: "Critical", status: "Pending", time: "1 hr ago", step: 1, matchedDonorIds: ["D-2276"] },
  { id: "REQ-1038", hospital: "Popular Diagnostic", group: "O+", units: 2, urgency: "Normal", status: "Completed", time: "3 hr ago", step: 7, matchedDonorIds: ["D-2265"] },
];

const DONORS_SEED = [
  { id: "D-2291", name: "Rafiq Ahmed", group: "O-", city: "Mirpur", address: "House 12, Road 4, Mirpur", lastDonationDate: "2026-04-18", status: "Eligible", phone: "+880-1710-000001", email: "rafiq@example.com", gender: "Male", healthScore: 94, streak: 3, lat: 23.8223, lng: 90.3654 },
  { id: "D-2288", name: "Nusrat Jahan", group: "AB-", city: "Dhanmondi", address: "Road 9A, Dhanmondi", lastDonationDate: "2026-07-05", status: "Cooldown", phone: "+880-1710-000002", email: "nusrat@example.com", gender: "Female", healthScore: 98, streak: 5, lat: 23.7461, lng: 90.3742 },
  { id: "D-2276", name: "Tanvir Hasan", group: "B-", city: "Uttara", address: "Sector 7, Uttara", lastDonationDate: "2026-01-19", status: "Eligible", phone: "+880-1710-000003", email: "tanvir@example.com", gender: "Male", healthScore: 90, streak: 2, lat: 23.8759, lng: 90.3795 },
  { id: "D-2265", name: "Farzana Akter", group: "O+", city: "Banani", address: "Road 11, Banani", lastDonationDate: "2026-05-02", status: "Eligible", phone: "+880-1710-000004", email: "farzana@example.com", gender: "Female", healthScore: 96, streak: 4, lat: 23.7937, lng: 90.4066 },
  { id: "D-2251", name: "Shakil Rahman", group: "A+", city: "Mohammadpur", address: "Nurjahan Road, Mohammadpur", lastDonationDate: "2026-07-27", status: "Cooldown", phone: "+880-1710-000005", email: "shakil@example.com", gender: "Male", healthScore: 88, streak: 1, lat: null, lng: null },
];

const NOTIFS_SEED = [
  { id: 1, donorId: "D-2291", donorName: "Rafiq Ahmed", group: "O-", text: "O- request from Dhaka Medical College — 4 units needed", req: "REQ-1042", time: "6 min ago", responded: null },
  { id: 2, donorId: "D-2276", donorName: "Tanvir Hasan", group: "B-", text: "B- request from Ibn Sina Hospital — 5 units needed", req: "REQ-1039", time: "1 hr ago", responded: null },
  { id: 3, donorId: "D-2291", donorName: "Rafiq Ahmed", group: "O-", text: "O- request from Popular Diagnostic — 2 units needed", req: "REQ-1030", time: "3 days ago", responded: "accepted" },
  { id: 4, donorId: "D-2265", donorName: "Farzana Akter", group: "O+", text: "O+ request from Popular Diagnostic — 2 units needed", req: "REQ-1038", time: "3 hr ago", responded: "accepted" },
  { id: 5, donorId: "D-2288", donorName: "Nusrat Jahan", group: "AB-", text: "AB- request from Square Hospital — 2 units needed", req: "REQ-1041", time: "22 min ago", responded: null },
  { id: 6, donorId: "D-2251", donorName: "Shakil Rahman", group: "A+", text: "A+ request from United Hospital — 3 units needed", req: "REQ-1040", time: "1 hr ago", responded: "accepted" },
];

const DONATIONS_SEED = [
  { date: "2026-04-18", qty: 450, status: "Completed" },
  { date: "2025-12-30", qty: 450, status: "Completed" },
  { date: "2025-09-14", qty: 450, status: "Completed" },
  { date: "2025-06-02", qty: 450, status: "Completed" },
  { date: "2025-02-18", qty: 450, status: "Completed" },
];

const DONOR_PROFILE_SEED = { id: "D-2291", name: "Rafiq Ahmed", group: "O-", city: "Mirpur", address: "House 12, Road 4, Mirpur", phone: "+880-1710-000001", email: "rafiq@example.com", lat: 23.8223, lng: 90.3654, lastDonationDate: "2026-04-18" };
const HOSPITAL_PROFILE_SEED = { name: "Dhaka Medical College", license: "LIC-1001", address: "Secretariat Rd, Dhaka", city: "Dhaka", phone: "+880-2-9999001", email: "contact@dmc.gov.bd" };

const USERS_SEED = {
  admin: [{ username: "admin", password: "Admin@123", name: "System Admin", id: "ADM-01" }],
  donor: [{ username: "rafiq", password: "Donor@123", name: "Rafiq Ahmed", profileId: "D-2291" }, { username: "nusrat", password: "Donor@123", name: "Nusrat Jahan", profileId: "D-2288" }],
  hospital: [{ username: "dmc", password: "Hosp@123", name: "Dhaka Medical College", profileId: "Dhaka Medical College" }],
};

const ROLE_META = {
  admin: { label: "Admin", icon: LayoutGrid, tone: C.red, blurb: "Full network oversight — inventory, requests, and donor records." },
  donor: { label: "Donor", icon: Heart, tone: C.green, blurb: "See your matched requests and donation history." },
  hospital: { label: "Hospital", icon: HospitalIcon, tone: C.amber, blurb: "Raise and track blood requests for your patients." },
};

const TIMELINE_STEPS = [
  { icon: HospitalIcon, label: "Hospital raises request" }, { icon: ShieldCheck, label: "Admin approves" },
  { icon: Radio, label: "Nearby donors notified" }, { icon: Users, label: "Donor accepts" },
  { icon: Droplet, label: "Blood collected" }, { icon: FlaskConical, label: "Tested & stored" },
  { icon: Truck, label: "Delivered to patient" },
];

const FEED_TEMPLATES = [
  { text: "New donor registered in Uttara", tone: C.green, icon: Users },
  { text: "AB- inventory updated (+1 unit)", tone: C.green, icon: PackageCheck },
  { text: "Critical O- request opened at Ibn Sina", tone: C.red, icon: AlertTriangle },
  { text: "Donation completed at Mirpur camp", tone: C.green, icon: Droplet },
  { text: "Hospital approved request REQ-1041", tone: C.blue, icon: ShieldCheck },
  { text: "Donor en route to Square Hospital", tone: C.amber, icon: Truck },
];

const TESTIMONIALS = [
  { name: "Tanvir Hasan", role: "B- donor · Uttara", img: IMG.p1, rating: 5, quote: "I got the notification, drove fifteen minutes, and donated. Two days later I heard the patient made it. That's the whole point." },
  { name: "Dr. Farhana Kabir", role: "Medical Officer · Ibn Sina Hospital", img: IMG.p2, rating: 5, quote: "Before this, we called donors one by one from a paper register. Now eligible donors are notified the second a request is raised." },
  { name: "Farzana Akter", role: "O+ donor · Banani", img: IMG.p3, rating: 4, quote: "The eligibility countdown actually keeps me on schedule — I know exactly when I can donate again." },
];

const MAP_NODES = [
  { x: 32, y: 28, type: "hospital", label: "Dhaka Medical College" }, { x: 58, y: 40, type: "hospital", label: "Square Hospital" },
  { x: 44, y: 62, type: "donor", label: "Rafiq Ahmed · O-" }, { x: 70, y: 66, type: "donor", label: "Tanvir Hasan · B-" },
  { x: 22, y: 55, type: "donor", label: "Farzana Akter · O+" }, { x: 78, y: 30, type: "bank", label: "Central Blood Bank" },
];

const UPCOMING_EVENTS_SEED = [
  { name: "Dhaka Winter Marathon", date: "2026-08-14", impact: "Historically raises O- and O+ trauma demand ~35%", groups: ["O-", "O+"], weight: 0.35 },
  { name: "Eid travel rush", date: "2026-08-19", impact: "Road-accident admissions typically spike across all groups", groups: ["O-", "A-", "B-", "AB-"], weight: 0.22 },
  { name: "University blood drive (Mirpur)", date: "2026-08-16", impact: "Expected to add new-donor supply, easing shortages", groups: ["A+", "B+", "O+"], weight: -0.18 },
];

const TRAUMA_CENTERS_SEED = [
  { name: "Dhaka Medical College", volume: "Very high", city: "Dhaka" },
  { name: "Square Hospital", volume: "High", city: "Dhaka" },
  { name: "United Hospital", volume: "High", city: "Dhaka" },
  { name: "Ibn Sina Hospital", volume: "Medium", city: "Dhaka" },
];

const REGIONAL_CHAPTERS_SEED = [
  { id: "RC-DHK", name: "Dhaka Central", city: "Dhaka", lat: 23.7808, lng: 90.3999, stock: { "O-": 14, "O+": 30, "A+": 22, "AB-": 4 } },
  { id: "RC-CTG", name: "Chattogram Chapter", city: "Chattogram", lat: 22.3569, lng: 91.7832, stock: { "O-": 26, "O+": 18, "A+": 9, "AB-": 11 } },
  { id: "RC-SYL", name: "Sylhet Chapter", city: "Sylhet", lat: 24.8949, lng: 91.8687, stock: { "O-": 5, "O+": 12, "A+": 15, "AB-": 2 } },
  { id: "RC-RAJ", name: "Rajshahi Chapter", city: "Rajshahi", lat: 24.3745, lng: 88.6042, stock: { "O-": 19, "O+": 8, "A+": 6, "AB-": 7 } },
  { id: "RC-KHL", name: "Khulna Chapter", city: "Khulna", lat: 22.8456, lng: 89.5403, stock: { "O-": 3, "O+": 21, "A+": 13, "AB-": 3 } },
];

const TRANSIT_BOXES_SEED = [
  { id: "TB-104", label: "Platelet box → Square Hospital", group: "O-", units: 3, lat: 23.7710, lng: 90.3990, temp: 4.2, status: "In transit" },
  { id: "TB-107", label: "Whole blood → Ibn Sina Hospital", group: "B-", units: 5, lat: 23.7461, lng: 90.3742, temp: 3.8, status: "In transit" },
  { id: "TB-111", label: "Plasma → United Hospital", group: "AB-", units: 2, lat: 23.7925, lng: 90.4078, temp: 5.6, status: "In transit" },
];

const DRONE_BASE = { lat: 23.8103, lng: 90.4125, label: "Central Blood Bank drone pad" };

const urgencyColor = (u) => (u === "Critical" ? C.red : u === "High" ? C.amber : C.green);
const statusColor = (s) => (s === "Pending" ? C.amber : s === "Approved" ? C.green : s === "Completed" ? C.text2 : C.red);
const daysAgo = (dateStr) => Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
const forecastRisk = (bag, events) => {
  const base = Math.max(0, Math.min(100, Math.round((1 - bag.units / bag.cap) * 100)));
  const eventAdj = events.filter((e) => e.groups.includes(bag.g)).reduce((a, e) => a + e.weight * 100, 0);
  return Math.max(0, Math.min(100, Math.round(base * 0.7 + eventAdj)));
};
const riskTone = (r) => (r >= 65 ? C.red : r >= 35 ? C.amber : C.green);
const coldChainOk = (temp) => temp >= 2 && temp <= 6;
const busyDonorIds = (reqs, excludeId) => new Set(
  reqs.filter((r) => r.id !== excludeId && (r.status === "Pending" || r.status === "Approved")).flatMap((r) => r.matchedDonorIds || [])
);
const formatLastDonation = (dateStr) => (dateStr ? `${daysAgo(dateStr)} days ago` : "Never donated");
const computeDonorStatus = (dateStr) => (!dateStr ? "Eligible" : daysAgo(dateStr) >= 90 ? "Eligible" : "Cooldown");
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------
   Audio & Countup hooks
----------------------------------------------------------------*/
let ToneMod = null;
function useChime() {
  const [enabled, setEnabled] = useState(false);
  const synthRef = useRef(null);
  useEffect(() => {
    if (enabled && !synthRef.current) {
      import("tone").then((Tone) => {
        ToneMod = Tone;
        synthRef.current = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 } }).toDestination();
        synthRef.current.volume.value = -14;
      }).catch(() => {});
    }
  }, [enabled]);
  const play = useCallback((note = "C6") => {
    if (!enabled || !synthRef.current || !ToneMod) return;
    ToneMod.start?.();
    synthRef.current.triggerAttackRelease(note, "16n");
  }, [enabled]);
  return { enabled, setEnabled, play };
}

function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ---------------------------------------------------------------
   Error boundary
----------------------------------------------------------------*/
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("Blood4Life UI error:", err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: C.text2, fontFamily: fontBody }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>Something didn't load correctly</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Please refresh the page. Your login session and data are unaffected.</div>
          <button onClick={() => window.location.reload()} style={btnSolid(C.green)}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------------------
   3D hero
----------------------------------------------------------------*/
function Hero3D({ height = 420 }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cleanup = () => {};
    try {
      cleanup = mountScene(mount, height);
    } catch (err) {
      console.warn("Hero3D: 3D scene unavailable, skipping.", err);
    }
    return () => cleanup();
  }, [height]);
  return <div ref={mountRef} style={{ width: "100%", height }} />;
}
function mountScene(mount, height) {
    const width = mount.clientWidth, h = height;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 0.6, 9.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);

    // Super smooth ultra-detail blood droplet core
    const coreGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe23d52,
      emissive: 0x7a0f1e,
      emissiveIntensity: 0.6,
      roughness: 0.12,
      metalness: 0.08,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const coreWireGeo = new THREE.IcosahedronGeometry(1.68, 3);
    const coreWire = new THREE.Mesh(coreWireGeo, new THREE.MeshBasicMaterial({ color: 0xffb3bd, wireframe: true, transparent: true, opacity: 0.25 }));
    group.add(coreWire);

    const rings = [0, 1, 2].map((i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.012, 16, 100), new THREE.MeshBasicMaterial({ color: 0x1ab86a, transparent: true, opacity: 0 }));
      ring.rotation.x = Math.PI / 2.3; ring.userData.delay = i * 1.1; group.add(ring); return ring;
    });

    // Smooth floating blood cell discs
    const cells = [];
    const cellGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0xe23d52, emissive: 0x5a000e, roughness: 0.2 });
    for (let i = 0; i < 12; i++) {
      const cell = new THREE.Mesh(cellGeo, cellMat);
      cell.rotation.x = Math.random() * Math.PI;
      cell.rotation.z = Math.random() * Math.PI;
      const radius = 2.4 + Math.random() * 1.2;
      const speed = 0.4 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      cell.userData = { radius, speed, angle, yOff: (Math.random() - 0.5) * 1.8 };
      group.add(cell);
      cells.push(cell);
    }

    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    for (let i = 0; i < 14; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x1ab86a : 0xefa23d, emissive: i % 3 === 0 ? 0x0b3b24 : 0x332209, emissiveIntensity: 0.8 });
      const node = new THREE.Mesh(nodeGeo, mat);
      const radius = 3 + Math.random() * 1.3, theta = Math.random() * Math.PI * 2, phi = Math.acos(Math.random() * 2 - 1);
      node.userData = { radius, theta, phi, speed: 0.15 + Math.random() * 0.25 };
      group.add(node); nodes.push(node);
    }
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1ab86a, transparent: true, opacity: 0.22 });
    const lines = nodes.slice(0, 6).map((n) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), n.position]);
      const line = new THREE.Line(geo, lineMat); group.add(line); return { line, node: n };
    });
    const helix = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const t = i / 26 * Math.PI * 4, y = i * 0.18 - 26 * 0.09;
      const p1 = new THREE.Vector3(Math.cos(t) * 0.5, y, Math.sin(t) * 0.5);
      const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * 0.5, y, Math.sin(t + Math.PI) * 0.5);
      [p1, p2].forEach((p, idx) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x1ab86a : 0xe23d52 }));
        dot.position.copy(p); helix.add(dot);
      });
    }
    helix.position.set(3.6, 0, -1.5); helix.scale.setScalar(0.85); group.add(helix);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.PointLight(0xff5a6c, 2.4, 20); key.position.set(4, 3, 5); scene.add(key);
    const rim = new THREE.PointLight(0x1ab86a, 1.9, 20); rim.position.set(-5, -2, -3); scene.add(rim);

    let raf; const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      // Ultra smooth heartbeat pulse formula
      const beat = Math.pow(Math.max(0, Math.sin(t * 2.8)), 6) * 0.12 + Math.sin(t * 1.2) * 0.02;
      core.scale.setScalar(1 + beat); coreWire.scale.setScalar((1 + beat) * 1.01);
      core.rotation.y = t * 0.12;

      rings.forEach((ring) => {
        const rt = ((t - ring.userData.delay) % 3.2) / 3.2;
        if (rt > 0) { ring.scale.setScalar(1 + rt * 2.4); ring.material.opacity = Math.max(0, 0.5 * (1 - rt)); }
      });

      cells.forEach((cell) => {
        cell.userData.angle += 0.008 * cell.userData.speed;
        const a = cell.userData.angle;
        cell.position.set(Math.cos(a) * cell.userData.radius, cell.userData.yOff + Math.sin(t * 1.5 + a) * 0.2, Math.sin(a) * cell.userData.radius);
        cell.rotation.x += 0.01;
        cell.rotation.y += 0.01;
      });

      nodes.forEach((n) => {
        n.userData.theta += 0.0025 * n.userData.speed * 60 * 0.016;
        const { radius, theta, phi } = n.userData;
        n.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi) * 0.6, radius * Math.sin(phi) * Math.sin(theta));
      });
      lines.forEach(({ line, node }) => { const pos = line.geometry.attributes.position; pos.setXYZ(1, node.position.x, node.position.y, node.position.z); pos.needsUpdate = true; });
      helix.rotation.y = t * 0.5; group.rotation.y = t * 0.12;
      renderer.render(scene, camera); raf = requestAnimationFrame(animate);
    };
    animate();
    const onResize = () => { const w = mount.clientWidth; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement); renderer.dispose(); };
}

/* --------------------------------- shared UI kit --------------------------------- */

function Pulse({ color = C.red, size = 8 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "b4l-ping 1.6s cubic-bezier(0,0,0.2,1) infinite", opacity: 0.6 }} />
      <span style={{ position: "relative", width: size, height: size, borderRadius: "50%", background: color }} />
    </span>
  );
}
function Badge({ children, color }) {
  return <span style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: 0.4, padding: "3px 8px", borderRadius: 4, color, background: color + "1e", border: `1px solid ${color}44`, textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>;
}
function Card({ children, style, hover }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)} style={{
      background: C.surface, border: `1px solid ${h ? C.borderLight : C.border}`, borderRadius: 14, padding: "18px 20px",
      transition: "border-color .2s ease, transform .2s ease, box-shadow .2s ease", transform: h ? "translateY(-3px)" : "none", boxShadow: h ? shadowMd : shadowSm, ...style,
    }}>{children}</div>
  );
}
function SectionTitle({ eyebrow, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div>
        {eyebrow && <div style={{ fontFamily: fontMono, fontSize: 11, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>{eyebrow}</div>}
        <h2 style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 19, margin: 0, color: C.text }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}
const th = { padding: "8px 10px", fontWeight: 600, color: C.text3 };
const td = { padding: "10px 10px", fontSize: 13.5 };
function IconBtn({ children, tone, onClick, title }) {
  return (
    <button title={title} onClick={onClick} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${tone}55`, background: tone + "16", color: tone, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform .12s ease" }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")} onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>{children}</button>
  );
}
const btnSolid = (tone) => ({ padding: "8px 14px", borderRadius: 8, border: `1px solid ${tone}`, background: tone, color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, transition: "transform .12s ease, box-shadow .2s ease", boxShadow: `0 6px 16px ${tone}40` });
const btnOutline = { padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.borderLight}`, background: C.surface, color: C.text2, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: fontBody };
function PressButton({ children, style, onClick, disabled }) {
  return <button type="button" disabled={disabled} onClick={onClick} style={{ ...style, cursor: disabled ? "default" : (style && style.cursor) || "pointer" }} onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.96)")} onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>{children}</button>;
}
const inputStyle = { background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 8, color: C.text, padding: "8px 10px", fontSize: 13.5, fontFamily: fontBody, outline: "none" };
function Field({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: 11, color: C.text3, fontFamily: fontMono, textTransform: "uppercase" }}>{label}</label>{children}</div>;
}
function SearchBox({ value, onChange, placeholder, width = 200 }) {
  return (
    <div style={{ position: "relative" }}>
      <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.text3 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, paddingLeft: 28, width, cursor: "text" }} />
    </div>
  );
}
function Select({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function Modal({ title, onClose, children, width = 420 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,59,36,0.45)", backdropFilter: "blur(3px)", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 18, padding: 24, width, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: shadowLg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function MapEmbed({ lat, lng, label, height = 200 }) {
  const has = typeof lat === "number" && typeof lng === "number";
  if (!has) {
    return (
      <div style={{ height, borderRadius: 12, background: C.surface2, border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.text3 }}>
        <MapPin size={18} />
        <div style={{ fontSize: 12 }}>Location not shared yet</div>
      </div>
    );
  }
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const openUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <iframe
          title={label || "Donor location"}
          src={src}
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a href={openUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.blue, fontWeight: 600, textDecoration: "none" }}>
        <Navigation size={12} /> Open in Google Maps
      </a>
    </div>
  );
}
function StatCard({ icon, label, value, sub, tone = C.text, trend }) {
  return (
    <Card hover style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, marginBottom: 10 }}>
        <span style={{ color: tone }}>{icon}</span>
        <span style={{ fontSize: 12, fontFamily: fontMono, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
        {trend && <span style={{ fontSize: 11, color: C.green, fontFamily: fontMono, display: "flex", alignItems: "center", gap: 2 }}><TrendingUp size={11} />{trend}</span>}
      </div>
      <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{sub}</div>
    </Card>
  );
}
function MiniStat({ label, value }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: C.text3, fontFamily: fontMono, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: fontDisplay, fontSize: 16, color: C.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

/* --------------------------------- ambient motion --------------------------------- */
function FloatingDrops({ count = 9 }) {
  const drops = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: 4 + Math.random() * 92, delay: Math.random() * 10, duration: 11 + Math.random() * 9,
    size: 10 + Math.random() * 14, tone: i % 4 === 0 ? C.red : i % 4 === 1 ? C.greenSoft : "#ffffff",
  })), [count]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {drops.map((d, i) => (
        <svg key={i} width={d.size} height={d.size * 1.3} viewBox="0 0 24 32" style={{ position: "absolute", left: `${d.left}%`, bottom: -40, opacity: 0.22, animation: `b4l-float ${d.duration}s linear ${d.delay}s infinite` }}>
          <path d="M12 2 C12 2 22 16 22 22 A10 10 0 0 1 2 22 C2 16 12 2 12 2 Z" fill={d.tone} />
        </svg>
      ))}
    </div>
  );
}

function MagneticButton({ children, tone, solid, onClick, icon: Icon }) {
  const ref = useRef(null);
  const [tf, setTf] = useState("translate(0,0)");
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setTf(`translate(${(e.clientX - r.left - r.width / 2) * 0.28}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`);
  };
  return (
    <button ref={ref} onClick={onClick} onMouseMove={onMove} onMouseLeave={() => setTf("translate(0,0)")} style={{
      position: "relative", padding: "13px 22px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: fontBody,
      display: "inline-flex", alignItems: "center", gap: 7, transform: tf, transition: "transform .15s cubic-bezier(.2,.9,.3,1.2), box-shadow .2s ease",
      border: solid ? `1px solid ${tone}` : "1px solid rgba(255,255,255,0.35)", background: solid ? tone : "rgba(255,255,255,0.08)", color: "#fff",
      boxShadow: solid ? `0 8px 24px ${tone}55` : "none", backdropFilter: solid ? "none" : "blur(4px)",
    }} onMouseEnter={(e) => { if (solid) e.currentTarget.style.boxShadow = `0 10px 30px ${tone}70, 0 0 24px ${tone}55`; }}>
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}
function TypingText({ phrases, style }) {
  const [i, setI] = useState(0), [sub, setSub] = useState(0), [del, setDel] = useState(false);
  useEffect(() => {
    const phrase = phrases[i % phrases.length];
    const t = setTimeout(() => {
      if (!del && sub < phrase.length) setSub(sub + 1);
      else if (!del && sub === phrase.length) setTimeout(() => setDel(true), 1200);
      else if (del && sub > 0) setSub(sub - 1);
      else { setDel(false); setI(i + 1); }
    }, del ? 28 : 42);
    return () => clearTimeout(t);
  }, [sub, del, i, phrases]);
  return <span style={style}>{phrases[i % phrases.length].slice(0, sub)}<span style={{ opacity: 0.6 }}>|</span></span>;
}

function NotificationCenter({ feed = [], notifications = [] }) {
  const [open, setOpen] = useState(false);
  const pendingNotifs = notifications.filter((n) => !n.responded);
  const unreadCount = pendingNotifs.length;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${unreadCount > 0 ? C.red + "88" : C.border}`, background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: unreadCount > 0 ? C.red : C.text2, transition: "all .2s ease" }}>
        <Bell size={16} />
        {(unreadCount > 0 || feed.length > 0) && (
          <span style={{ position: "absolute", top: -4, right: -4 }}>
            <Pulse color={unreadCount > 0 ? C.red : C.green} size={10} />
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: 44, right: 0, width: 340, maxHeight: 400, overflowY: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: shadowLg, zIndex: 150, padding: 10 }}>
          <div style={{ fontSize: 11, fontFamily: fontMono, textTransform: "uppercase", color: C.text3, padding: "6px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>System Notifications ({unreadCount} pending)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Pulse color={C.green} size={6} /> MySQL synced</span>
          </div>

          {notifications.length > 0 && (
            <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={`n-${n.id}`} style={{ padding: "8px 10px", borderRadius: 8, background: !n.responded ? C.amberDim : C.surface2, border: `1px solid ${!n.responded ? C.amber + "44" : C.border}`, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: C.text }}>{n.text}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.text3, fontFamily: fontMono, marginTop: 4 }}>
                    <span>{n.donorName ? `To: ${n.donorName}` : n.req}</span>
                    <span>{n.time || "just now"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 10.5, fontFamily: fontMono, textTransform: "uppercase", color: C.text3, padding: "4px 8px 6px" }}>Recent Activity</div>
          {feed.length === 0 && notifications.length === 0 && <div style={{ padding: 16, color: C.text3, fontSize: 12.5, textAlign: "center" }}>No notifications right now.</div>}
          {feed.slice(0, 6).map((f) => (
            <div key={f.id || Math.random()} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 8px", borderRadius: 8, animation: "b4l-slide-in .3s ease" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: (f.tone || C.green) + "16", color: f.tone || C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bell size={12} /></div>
              <div><div style={{ fontSize: 12, color: C.text }}>{f.text}</div><div style={{ fontSize: 10, color: C.text3, fontFamily: fontMono, marginTop: 2 }}>{f.time || "just now"}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BloodBag({ g, units, cap, pulse, size = "md" }) {
  const pct = Math.min(100, Math.round((units / cap) * 100));
  const low = pct < 25;
  const color = low ? C.red : pct < 50 ? C.amber : C.green;
  const [hov, setHov] = useState(false);
  const dims = size === "lg" ? { w: 72, h: 96 } : { w: 54, h: 72 };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: C.surface2, border: `1px solid ${low ? C.red + "55" : hov ? C.borderLight : C.border}`, borderRadius: 14,
      padding: "12px 12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      transform: hov ? "translateY(-4px) scale(1.03)" : "none", transition: "transform .2s ease, border-color .2s ease", position: "relative",
    }}>
      {low && pulse && <div style={{ position: "absolute", top: 8, right: 8 }}><Pulse color={C.red} size={6} /></div>}
      <svg width={dims.w} height={dims.h} viewBox="0 0 54 72">
        <defs>
          <clipPath id={`clip-${g}-${size}`}><path d="M10 8 H44 V20 C50 26 50 60 44 64 A20 20 0 0 1 10 64 C4 60 4 26 10 20 Z" /></clipPath>
          <linearGradient id={`wave-${g}-${size}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.9" /><stop offset="100%" stopColor={color} stopOpacity="1" /></linearGradient>
        </defs>
        <path d="M10 8 H44 V20 C50 26 50 60 44 64 A20 20 0 0 1 10 64 C4 60 4 26 10 20 Z" fill={C.bg} stroke={C.border} strokeWidth="1.5" />
        <g clipPath={`url(#clip-${g}-${size})`}>
          <rect x="0" y={72 - (pct / 100) * 64} width="54" height={(pct / 100) * 64} fill={`url(#wave-${g}-${size})`}>
            <animate attributeName="y" values={`${74 - (pct / 100) * 64};${70 - (pct / 100) * 64};${74 - (pct / 100) * 64}`} dur="3.2s" repeatCount="indefinite" />
          </rect>
        </g>
        <rect x="20" y="2" width="14" height="8" rx="2" fill={C.text3} />
      </svg>
      <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 14, color: C.text }}>{g}</span>
      <div style={{ display: "flex", gap: 6, fontFamily: fontMono, fontSize: 10.5, color: C.text2 }}><span>{units}u</span><span>·</span><span>{pct}%</span></div>
    </div>
  );
}

function TimelineModal({ request, onClose, onComplete }) {
  if (!request) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,59,36,0.45)", backdropFilter: "blur(3px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 18, padding: 26, width: 440, maxWidth: "100%", maxHeight: "82vh", overflowY: "auto", boxShadow: shadowLg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div><div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{request.id}</div><div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: C.text }}>{request.hospital}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3 }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px" }}>
          <Badge color={C.red}>{request.group}</Badge><Badge color={urgencyColor(request.urgency)}>{request.urgency}</Badge><Badge color={statusColor(request.status)}>{request.status}</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text2, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", marginBottom: 22 }}>
          <Users size={13} />
          {request.units} bag{request.units === 1 ? "" : "s"} needed · {(request.matchedDonorIds || []).length} of {request.units} matched to a donor (1 bag per donor)
          {request.droneDispatched && <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: C.blue, fontWeight: 600 }}><Plane size={12} /> Drone en route</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {TIMELINE_STEPS.map((s, i) => {
            const done = i < (request.step || 1); const active = i === (request.step || 1) - 1 && (request.step || 1) < TIMELINE_STEPS.length;
            return (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: done ? C.green : C.surface2, color: done ? "#fff" : C.text3, border: `1px solid ${done ? C.green : C.border}`, boxShadow: active ? `0 0 0 4px ${C.green}22` : "none", transition: "all .3s ease" }}><s.icon size={14} /></div>
                  {i < TIMELINE_STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: done ? C.green : C.border }} />}
                </div>
                <div style={{ paddingBottom: 22 }}>
                  <div style={{ fontSize: 13.5, color: done ? C.text : C.text3, fontWeight: done ? 600 : 400 }}>{s.label}</div>
                  {active && <div style={{ fontSize: 11.5, color: C.green, fontFamily: fontMono, marginTop: 2 }}>in progress…</div>}
                </div>
              </div>
            );
          })}
        </div>
        {onComplete && request.status === "Approved" && (
          <PressButton onClick={() => { onComplete(request.id); onClose(); }} style={{ ...btnSolid(C.green), width: "100%", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}><Check size={14} /> Mark bags collected & completed</PressButton>
        )}
      </div>
    </div>
  );
}

function MatchingOverlay({ active, group, units, matchedCount, onDone }) {
  const stages = [
    "Scanning donor network…",
    "Searching by blood group & city…",
    "Matching eligibility & distance…",
    matchedCount >= units
      ? `${matchedCount} donor${matchedCount === 1 ? "" : "s"} matched — 1 bag per donor`
      : `${matchedCount} of ${units} bags matched so far — 1 donor per bag`,
  ];
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!active) { setStage(0); return; }
    const timers = stages.map((_, i) => setTimeout(() => setStage(i), i * 750));
    const done = setTimeout(() => onDone?.(), stages.length * 750 + 700);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [active]);
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,59,36,0.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "30px 34px", width: 380, textAlign: "center", boxShadow: shadowLg }}>
        <div style={{ position: "relative", width: 74, height: 74, margin: "0 auto 18px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${C.greenDim}` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: C.green, animation: "b4l-spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.green }}><ScanLine size={26} /></div>
        </div>
        <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 15.5, color: C.text, marginBottom: 6 }}>Matching {group} donors</div>
        <div style={{ fontSize: 13, color: C.text2, fontFamily: fontMono, minHeight: 18 }}>{stages[stage]}</div>
        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 16 }}>{stages.map((_, i) => <div key={i} style={{ width: 26, height: 3, borderRadius: 2, background: i <= stage ? C.green : C.border, transition: "background .3s ease" }} />)}</div>
      </div>
    </div>
  );
}

function EmergencyWidget({ inventory, onNotify }) {
  const [seconds, setSeconds] = useState(47 * 60);
  useEffect(() => { const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  const critical = inventory.filter((b) => b.units / b.cap < 0.25).sort((a, b) => a.units / a.cap - b.units / b.cap);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"), ss = String(seconds % 60).padStart(2, "0");
  if (critical.length === 0) return null;
  return (
    <div style={{ borderRadius: 18, padding: "20px 22px", background: `linear-gradient(135deg, ${C.red} 0%, #b8283b 100%)`, color: "#fff", boxShadow: `0 16px 40px ${C.red}44`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, background: "radial-gradient(circle at 80% 20%, #fff, transparent 60%)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Pulse color="#fff" size={8} /><span style={{ fontFamily: fontMono, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.6 }}>Critical blood needed</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: fontMono, fontSize: 13, background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 20 }}><Timer size={13} /> {mm}:{ss}</div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {critical.map((b) => (
          <div key={b.g} style={{ background: "rgba(255,255,255,0.14)", borderRadius: 12, padding: "10px 16px", flex: 1, minWidth: 90 }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>{b.g}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{b.units} units left</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, position: "relative" }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{critical.length} group{critical.length === 1 ? "" : "s"} below 25% capacity</div>
        <PressButton onClick={() => onNotify(critical.map((b) => b.g))} style={{ background: "#fff", color: C.red, border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Notify donors</PressButton>
      </div>
    </div>
  );
}

function ActivityTicker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.surface, padding: "9px 0" }}>
      <div style={{ display: "flex", gap: 48, whiteSpace: "nowrap", animation: "b4l-marquee 28s linear infinite" }}>
        {doubled.map((txt, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text2, fontFamily: fontMono }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />{txt}</span>)}
      </div>
    </div>
  );
}

function LiveMap() {
  const [mapType, setMapType] = useState("google");
  const [active, setActive] = useState(null);

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: shadowSm, position: "relative", height: 340, background: C.surface }}>
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", gap: 6, backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.85)", padding: 4, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <button
          onClick={() => setMapType("google")}
          style={{
            background: mapType === "google" ? C.green : "transparent",
            color: mapType === "google" ? "#fff" : C.text2,
            border: "none",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <Navigation size={11} /> Hospital Map
        </button>
        <button
          onClick={() => setMapType("network")}
          style={{
            background: mapType === "network" ? C.green : "transparent",
            color: mapType === "network" ? "#fff" : C.text2,
            border: "none",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <Radio size={11} /> Network Map
        </button>
      </div>

      {mapType === "google" ? (
        <iframe
          title="Google Maps Nearby Hospitals"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
          loading="lazy"
          allowFullScreen
          src="https://maps.google.com/maps?q=hospitals%20near%20me%20Dhaka%20Medical%20College%20Square%20Hospital&t=&z=13&ie=UTF8&iwloc=&output=embed"
        />
      ) : (
        <div style={{ position: "relative", width: "100%", height: "100%", background: `linear-gradient(135deg, ${C.surface2}, ${C.surface3})` }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
            <defs>
              <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M 34 0 L 0 0 0 34" fill="none" stroke={C.border} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 32 28 Q 40 50 44 62" fill="none" stroke={C.green} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />
            <circle r="1.4" fill={C.red}><animateMotion dur="3.5s" repeatCount="indefinite" path="M 32 28 Q 40 50 44 62" /></circle>
          </svg>
          {MAP_NODES.map((n, i) => (
            <div key={i} onClick={() => setActive(active === i ? null : i)} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-100%)", cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: n.type === "hospital" ? C.blue : n.type === "bank" ? C.amber : C.green, boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ transform: "rotate(45deg)", color: "#fff" }}>{n.type === "hospital" ? <HospitalIcon size={12} /> : n.type === "bank" ? <Droplet size={12} /> : <Heart size={12} />}</div>
              </div>
              {active === i && <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", background: C.text, color: "#fff", fontSize: 11, padding: "5px 9px", borderRadius: 6, whiteSpace: "nowrap" }}>{n.label}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: 10.5, fontFamily: fontMono, zIndex: 10 }}>
        <span style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4, color: C.text2, boxShadow: shadowSm }}>
          <HospitalIcon size={11} color={C.green} /> Nearby Medical Centers
        </span>
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 5500); return () => clearInterval(t); }, []);
  const cur = TESTIMONIALS[i];
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: shadowMd, background: `linear-gradient(120deg, ${C.greenDeep2}, ${C.greenDeep})`, padding: "34px 40px", color: "#fff", minHeight: 190 }}>
      <Quote size={22} color={C.greenSoft} />
      <p key={i} style={{ fontFamily: fontDisplay, fontWeight: 500, fontSize: 17, lineHeight: 1.6, margin: "12px 0 16px", animation: "b4l-fade-up .4s ease", maxWidth: 640 }}>"{cur.quote}"</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={cur.img} alt={cur.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} />
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{cur.name}</div><div style={{ fontSize: 11.5, opacity: 0.65, fontFamily: fontMono }}>{cur.role}</div></div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={12} fill={s < cur.rating ? C.amber : "none"} color={C.amber} />)}</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 18 }}>{TESTIMONIALS.map((_, d) => <button key={d} onClick={() => setI(d)} style={{ width: d === i ? 20 : 6, height: 6, borderRadius: 4, border: "none", background: d === i ? C.greenSoft : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "width .3s ease" }} />)}</div>
    </div>
  );
}

function Gallery() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div style={{ columnCount: 3, columnGap: 12 }}>
        {IMG.gallery.map((src, i) => (
          <div key={i} onClick={() => setOpen(src)} style={{ breakInside: "avoid", marginBottom: 12, borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", boxShadow: shadowSm }}>
            <img src={src} alt="" style={{ width: "100%", display: "block", transition: "transform .35s ease" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
            <div style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 8, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Maximize2 size={12} /></div>
          </div>
        ))}
      </div>
      {open && <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}><img src={open} alt="" style={{ maxWidth: "80vw", maxHeight: "82vh", borderRadius: 12, boxShadow: shadowLg }} /></div>}
    </>
  );
}

/* =================================================================
   ADMIN VIEWS
================================================================= */

function RequestsTable({ rows, admin, onDecide, onOpen }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr style={{ textAlign: "left", fontSize: 11, fontFamily: fontMono, textTransform: "uppercase" }}><th style={th}>Request</th><th style={th}>Hospital</th><th style={th}>Group</th><th style={th}>Units</th><th style={th}>Urgency</th><th style={th}>Status</th><th style={th}></th></tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={7} style={{ ...td, color: C.text3, textAlign: "center", padding: 24 }}>No requests match your filters.</td></tr>}
        {rows.map((r) => (
          <tr key={r.id} onClick={() => onOpen?.(r)} style={{ borderTop: `1px solid ${C.border}`, cursor: onOpen ? "pointer" : "default" }}>
            <td style={{ ...td, fontFamily: fontMono, color: C.text2 }}>{r.id}</td>
            <td style={{ ...td, color: C.text, fontWeight: 500 }}>{r.hospital}</td>
            <td style={{ ...td, fontFamily: fontMono, color: C.red }}>{r.group}</td>
            <td style={{ ...td, fontFamily: fontMono }}>{r.units}</td>
            <td style={td}><Badge color={urgencyColor(r.urgency)}>{r.urgency}</Badge></td>
            <td style={td}><Badge color={statusColor(r.status)}>{r.status}</Badge>{r.droneDispatched && <span title="Drone dispatched" style={{ marginLeft: 6, display: "inline-flex", verticalAlign: -2, color: C.blue }}><Plane size={12} /></span>}</td>
            <td style={{ ...td, color: C.text3, fontSize: 12, textAlign: "right" }}>
              {admin && r.status === "Pending" ? (
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                  <IconBtn tone={C.green} title="Approve" onClick={() => onDecide(r.id, "Approved")}><Check size={13} /></IconBtn>
                  <IconBtn tone={C.red} title="Reject" onClick={() => onDecide(r.id, "Rejected")}><X size={13} /></IconBtn>
                </div>
              ) : r.time}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdminOverview({ inventory, requests, donors, notifications, onDecide, onNotifyCritical, push, chime, goto }) {
  const totalUnits = inventory.reduce((a, b) => a + b.units, 0);
  const totalDisp = useCountUp(totalUnits);
  const criticalCount = inventory.filter((b) => b.units / b.cap < 0.25).length;
  const pending = requests.filter((r) => r.status === "Pending").length;
  const eligible = donors.filter((d) => d.status === "Eligible").length;
  const [openReqId, setOpenReqId] = useState(null);
  const openReq = requests.find((r) => r.id === openReqId) || null;

  const chartData = [{ m: "Feb", donations: 62 }, { m: "Mar", donations: 74 }, { m: "Apr", donations: 58 }, { m: "May", donations: 91 }, { m: "Jun", donations: 83 }, { m: "Jul", donations: 96 }];
  const pieData = [{ name: "Fulfilled", value: 72, color: C.green }, { name: "Pending", value: 18, color: C.amber }, { name: "Rejected", value: 10, color: C.red }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <EmergencyWidget inventory={inventory} onNotify={onNotifyCritical} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard icon={<Droplet size={16} />} label="Units in stock" value={totalDisp} sub="across 8 groups" trend="+6 today" />
        <StatCard icon={<AlertTriangle size={16} />} label="Critical groups" value={criticalCount} sub="below 25% capacity" tone={C.red} />
        <StatCard icon={<ClipboardList size={16} />} label="Pending requests" value={pending} sub="awaiting approval" tone={C.amber} />
        <StatCard icon={<Users size={16} />} label="Eligible donors" value={eligible} sub={`of ${donors.length} tracked`} tone={C.green} trend="↑12%" />
      </div>
      <Card>
        <SectionTitle eyebrow="Live inventory" title="Blood group stock levels" right={<PressButton onClick={() => goto("inventory")} style={{ ...btnOutline, display: "flex", alignItems: "center", gap: 4 }}>Manage inventory <ChevronRight size={13} /></PressButton>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>{inventory.map((b) => <BloodBag key={b.g} {...b} pulse />)}</div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <Card>
          <SectionTitle eyebrow="Trend" title="Monthly donations" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}><CartesianGrid stroke={C.border} vertical={false} /><XAxis dataKey="m" stroke={C.text3} fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke={C.text3} fontSize={11} tickLine={false} axisLine={false} width={26} /><Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} /><Line type="monotone" dataKey="donations" stroke={C.green} strokeWidth={2.5} dot={{ r: 3, fill: C.green }} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle eyebrow="Outcomes" title="Request success rate" />
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3}>{pieData.map((p, i) => <Cell key={i} fill={p.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} /></PieChart></ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: -6 }}>{pieData.map((p) => <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.text2 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />{p.name}</div>)}</div>
        </Card>
      </div>
      <Card>
        <SectionTitle eyebrow="Requests" title="Recent hospital requests" right={<PressButton onClick={() => goto("requests")} style={{ ...btnOutline, display: "flex", alignItems: "center", gap: 4 }}>View all <ChevronRight size={13} /></PressButton>} />
        <RequestsTable rows={requests.slice(0, 4)} admin onDecide={onDecide} onOpen={(r) => setOpenReqId(r.id)} />
      </Card>
      <Card>
        <SectionTitle eyebrow="Donor pool" title="Recently active donors" right={<PressButton onClick={() => goto("donors")} style={{ ...btnOutline, display: "flex", alignItems: "center", gap: 4 }}>View all <ChevronRight size={13} /></PressButton>} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left", fontSize: 11, fontFamily: fontMono, textTransform: "uppercase" }}><th style={th}>Donor</th><th style={th}>Group</th><th style={th}>City</th><th style={th}>Status</th></tr></thead>
          <tbody>{donors.slice(0, 4).map((d) => (
            <tr key={d.id} style={{ borderTop: `1px solid ${C.border}` }}>
              <td style={td}><div style={{ fontWeight: 500, color: C.text }}>{d.name}</div><div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{d.id}</div></td>
              <td style={td}><span style={{ fontFamily: fontMono, color: C.red }}>{d.group}</span></td>
              <td style={{ ...td, color: C.text2 }}>{d.city}</td>
              <td style={td}><Badge color={d.status === "Eligible" ? C.green : C.text3}>{d.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <TimelineModal request={openReq} onClose={() => setOpenReqId(null)} />
    </div>
  );
}

function AdminInventory({ inventory, onRestock, push, chime }) {
  const [lowOnly, setLowOnly] = useState(false);
  const rows = lowOnly ? inventory.filter((b) => b.units / b.cap < 0.25) : inventory;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card>
        <SectionTitle eyebrow="Live inventory" title="Blood group stock levels" right={<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text2, cursor: "pointer" }}><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>{inventory.map((b) => <BloodBag key={b.g} {...b} size="lg" pulse />)}</div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Detail" title="Stock ledger" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left", fontSize: 11, fontFamily: fontMono, textTransform: "uppercase" }}><th style={th}>Group</th><th style={th}>Units</th><th style={th}>Capacity</th><th style={th}>Fill</th><th style={th}>Expiry</th><th style={th}></th></tr></thead>
          <tbody>{rows.map((b) => {
            const pct = Math.round((b.units / b.cap) * 100); const low = pct < 25; const daysLeft = Math.floor((new Date(b.expiry) - Date.now()) / 86400000);
            return (
              <tr key={b.g} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ ...td, fontFamily: fontDisplay, fontWeight: 700, color: C.text }}>{b.g}</td>
                <td style={{ ...td, fontFamily: fontMono }}>{b.units}</td>
                <td style={{ ...td, fontFamily: fontMono, color: C.text2 }}>{b.cap}</td>
                <td style={td}><Badge color={low ? C.red : pct < 50 ? C.amber : C.green}>{pct}%</Badge></td>
                <td style={{ ...td, color: daysLeft <= 10 ? C.red : C.text2, fontFamily: fontMono, fontSize: 12 }}>{daysLeft <= 0 ? "expired" : `${daysLeft}d left`}</td>
                <td style={{ ...td, textAlign: "right" }}><PressButton onClick={() => onRestock(b.g)} style={{ ...btnOutline, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5 }}><Plus size={12} /> Record donation</PressButton></td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminRequests({ requests, onDecide, onComplete, push, chime }) {
  const [q, setQ] = useState(""); const [status, setStatus] = useState("All"); const [openReqId, setOpenReqId] = useState(null);
  const openReq = requests.find((r) => r.id === openReqId) || null;
  const filtered = requests.filter((r) => (status === "All" || r.status === status) && (r.hospital.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())));
  const counts = ["Pending", "Approved", "Completed", "Rejected"].map((s) => ({ s, n: requests.filter((r) => r.status === s).length }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>{counts.map((c) => <StatCard key={c.s} icon={<ClipboardList size={16} />} label={c.s} value={c.n} sub="requests" tone={statusColor(c.s)} />)}</div>
      <Card>
        <SectionTitle eyebrow="Requests" title="All hospital blood requests" right={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><SearchBox value={q} onChange={setQ} placeholder="Search hospital or ID" /><Select value={status} onChange={setStatus} options={["All", "Pending", "Approved", "Rejected", "Completed"]} /></div>} />
        <RequestsTable rows={filtered} admin onDecide={onDecide} onOpen={(r) => setOpenReqId(r.id)} />
      </Card>
      <TimelineModal request={openReq} onClose={() => setOpenReqId(null)} onComplete={onComplete} />
    </div>
  );
}

function AddDonorModal({ onClose, onAdd }) {
  const defaultNum = Math.floor(2300 + Math.random() * 90);
  const [f, setF] = useState({
    name: "", gender: "Male", group: "O+", city: "", address: "", phone: "", email: "",
    lastDonationDate: "", healthScore: "", streak: "",
    username: "", password: "Donor@123"
  });

  const submit = () => {
    if (!f.name || !f.city) return;
    const donorId = `D-${defaultNum}`;
    const uname = (f.username || f.name.split(" ")[0].toLowerCase() + defaultNum).trim();
    onAdd({
      id: donorId,
      name: f.name.trim(), group: f.group, city: f.city.trim(), address: f.address.trim(),
      phone: f.phone.trim(), email: f.email.trim(),
      gender: f.gender,
      healthScore: f.healthScore !== "" ? Number(f.healthScore) : null,
      streak: f.streak !== "" ? Number(f.streak) : 0,
      lastDonationDate: f.lastDonationDate || null,
      status: computeDonorStatus(f.lastDonationDate || null),
      username: uname,
      password: f.password || "Donor@123",
      lat: null, lng: null,
    });
    onClose();
  };

  return (
    <Modal title="Add a new donor & create user account" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
          <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Shakib Al Hasan" style={inputStyle} /></Field>
          <Field label="Gender"><select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })} style={inputStyle}><option value="Male">Male</option><option value="Female">Female</option></select></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Username"><input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} placeholder="Auto-generated if blank" style={inputStyle} /></Field>
          <Field label="Password"><input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Default: Donor@123" style={inputStyle} /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Blood group"><select value={f.group} onChange={(e) => setF({ ...f, group: e.target.value })} style={inputStyle}>{INVENTORY_SEED.map((b) => <option key={b.g} value={b.g}>{b.g}</option>)}</select></Field>
          <Field label="City"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="e.g. Dhaka" style={inputStyle} /></Field>
        </div>
        <Field label="Address"><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Street / Area" style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Phone"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+880-1XXX-XXXXXX" style={inputStyle} /></Field>
          <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="donor@example.com" style={inputStyle} /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Health score (0-100)"><input type="number" min="0" max="100" value={f.healthScore} onChange={(e) => setF({ ...f, healthScore: e.target.value })} placeholder="Optional" style={inputStyle} /></Field>
          <Field label="Donation streak"><input type="number" min="0" value={f.streak} onChange={(e) => setF({ ...f, streak: e.target.value })} placeholder="Optional" style={inputStyle} /></Field>
        </div>
        <Field label="Last donation date (optional)"><input type="date" max={todayISO()} value={f.lastDonationDate} onChange={(e) => setF({ ...f, lastDonationDate: e.target.value })} style={inputStyle} /></Field>
        <PressButton onClick={submit} style={{ ...btnSolid(C.green), marginTop: 6 }}>Save donor &amp; user account</PressButton>
      </div>
    </Modal>
  );
}

function DonorProfileModal({ donor, onClose }) {
  return (
    <Modal title={donor.name} onClose={onClose} width={440}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.redDim, border: `1px solid ${C.red}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontDisplay, fontWeight: 700, color: C.red }}>{donor.group}</div>
        <div><div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{donor.id}</div><Badge color={donor.status === "Eligible" ? C.green : C.text3}>{donor.status}</Badge></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2 }}><MapPin size={14} /> {donor.city}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2 }}><Phone size={14} /> {donor.phone || "—"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2 }}><Mail size={14} /> {donor.email || "—"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2 }}><Activity size={14} /> Last donation: {formatLastDonation(donor.lastDonationDate)}</div>
      </div>
      <div style={{ fontSize: 11, fontFamily: fontMono, textTransform: "uppercase", letterSpacing: 0.5, color: C.text3, marginBottom: 8 }}>Live location</div>
      <MapEmbed lat={donor.lat} lng={donor.lng} label={donor.name} />
    </Modal>
  );
}

function AdminDonors({ donors, onAddDonor, push }) {
  const [q, setQ] = useState(""); const [group, setGroup] = useState("All"); const [status, setStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false); const [openDonorId, setOpenDonorId] = useState(null);
  const openDonor = donors.find((d) => d.id === openDonorId) || null;
  const groups = ["All", ...INVENTORY_SEED.map((b) => b.g)];
  const filtered = donors.filter((d) => (group === "All" || d.group === group) && (status === "All" || d.status === status) && (d.name.toLowerCase().includes(q.toLowerCase()) || d.city.toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard icon={<Users size={16} />} label="Total donors" value={donors.length} sub="in the system" />
        <StatCard icon={<Check size={16} />} label="Eligible now" value={donors.filter((d) => d.status === "Eligible").length} tone={C.green} sub="ready to be matched" />
        <StatCard icon={<Timer size={16} />} label="In cooldown" value={donors.filter((d) => d.status === "Cooldown").length} tone={C.amber} sub="within 90-day window" />
        <StatCard icon={<MapPin size={16} />} label="Location shared" value={donors.filter((d) => typeof d.lat === "number").length} tone={C.blue} sub="visible on map" />
      </div>
      <Card>
        <SectionTitle eyebrow="Donor pool" title="All registered donors" right={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SearchBox value={q} onChange={setQ} placeholder="Search name or city" />
            <Select value={group} onChange={setGroup} options={groups} />
            <Select value={status} onChange={setStatus} options={["All", "Eligible", "Cooldown", "Inactive"]} />
            <PressButton onClick={() => setShowAdd(true)} style={{ ...btnSolid(C.green), display: "flex", alignItems: "center", gap: 6 }}><Plus size={13} /> Add donor</PressButton>
          </div>
        } />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left", fontSize: 11, fontFamily: fontMono, textTransform: "uppercase" }}><th style={th}>Donor</th><th style={th}>Group</th><th style={th}>City</th><th style={th}>Last donation</th><th style={th}>Status</th><th style={th}>Location</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: C.text3, padding: 24 }}>No donors match your filters.</td></tr>}
            {filtered.map((d) => (
              <tr key={d.id} onClick={() => setOpenDonorId(d.id)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                <td style={td}><div style={{ fontWeight: 500, color: C.text }}>{d.name}</div><div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{d.id}</div></td>
                <td style={td}><span style={{ fontFamily: fontMono, color: C.red }}>{d.group}</span></td>
                <td style={{ ...td, color: C.text2 }}>{d.city}</td>
                <td style={{ ...td, color: C.text2, fontFamily: fontMono, fontSize: 12 }}>{formatLastDonation(d.lastDonationDate)}</td>
                <td style={td}><Badge color={d.status === "Eligible" ? C.green : C.text3}>{d.status}</Badge></td>
                <td style={td}>
                  {typeof d.lat === "number" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.green, fontSize: 12 }}><MapPin size={12} /> On map</span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.text3, fontSize: 12 }}><MapPin size={12} /> Not shared</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showAdd && <AddDonorModal onClose={() => setShowAdd(false)} onAdd={onAddDonor} />}
      {openDonor && <DonorProfileModal donor={openDonor} onClose={() => setOpenDonorId(null)} />}
    </div>
  );
}

function AdminNotifications({ notifications }) {
  const [status, setStatus] = useState("All");
  const filtered = notifications.filter((n) => status === "All" || (status === "Pending" ? !n.responded : status === "Accepted" ? n.responded === "accepted" : n.responded === "declined"));
  const total = notifications.length; const accepted = notifications.filter((n) => n.responded === "accepted").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <StatCard icon={<Bell size={16} />} label="Total sent" value={total} sub="all time" />
        <StatCard icon={<Check size={16} />} label="Accepted" value={accepted} sub={`${total ? Math.round((accepted / total) * 100) : 0}% response rate`} tone={C.green} />
        <StatCard icon={<ClipboardList size={16} />} label="Awaiting response" value={notifications.filter((n) => !n.responded).length} tone={C.amber} sub="pending" />
      </div>
      <Card>
        <SectionTitle eyebrow="Log" title="Notification history" right={<Select value={status} onChange={setStatus} options={["All", "Pending", "Accepted", "Declined"]} />} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && <div style={{ color: C.text3, fontSize: 12.5, padding: 20, textAlign: "center" }}>No notifications match this filter.</div>}
          {filtered.map((n) => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}`, gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: C.text }}>{n.donorName} <span style={{ color: C.text3, fontFamily: fontMono, fontSize: 11 }}>· {n.req}</span></div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{n.text}</div>
              </div>
              <Badge color={n.responded === "accepted" ? C.green : n.responded === "declined" ? C.text3 : C.amber}>{n.responded ? n.responded : "Pending"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DemandForecastCard({ inventory }) {
  const data = inventory.map((b) => ({ g: b.g, risk: forecastRisk(b, UPCOMING_EVENTS_SEED) })).sort((a, b) => b.risk - a.risk);
  return (
    <Card>
      <SectionTitle eyebrow="AI demand forecasting" title="7-day shortage risk by blood type" right={<Badge color={C.blue}>model: stock trend + local events</Badge>} />
      <div style={{ height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="g" tick={{ fontSize: 11, fill: C.text3, fontFamily: fontMono }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.text3 }} axisLine={false} tickLine={false} unit="%" width={34} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} formatter={(v) => [`${v}% risk`, "Shortage risk"]} />
            <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={riskTone(d.risk)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function DiscardReductionCard({ inventory, onRoute, push, chime, savedCount, setSavedCount }) {
  const atRisk = inventory.filter((b) => daysAgo(b.expiry) <= 5).sort((a, b) => daysAgo(a.expiry) - daysAgo(b.expiry));
  return (
    <Card>
      <SectionTitle eyebrow="Smart discard reduction" title="Units expiring soon" right={<Badge color={C.green}><Recycle size={11} style={{ verticalAlign: -2, marginRight: 4 }} />{savedCount} units saved</Badge>} />
      {atRisk.length === 0 ? (
        <div style={{ color: C.text3, fontSize: 12.5, padding: 20, textAlign: "center" }}>Nothing is close to expiry right now — inventory is healthy.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {atRisk.map((b) => {
            const d = daysAgo(b.expiry);
            const center = TRAUMA_CENTERS_SEED[atRisk.indexOf(b) % TRAUMA_CENTERS_SEED.length];
            return (
              <div key={b.g} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: d <= 2 ? C.redDim : C.amberDim, border: `1px solid ${d <= 2 ? C.red + "33" : C.amber + "33"}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{b.g} · {b.units} units</div>
                  <div style={{ fontSize: 11.5, color: C.text2, marginTop: 1 }}>Expires in {Math.max(d, 0)} day{d === 1 ? "" : "s"} · suggested: route to <b>{center.name}</b> ({center.volume} volume trauma center)</div>
                </div>
                <PressButton onClick={() => onRoute(b, center)} style={{ ...btnSolid(d <= 2 ? C.red : C.amber), display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, whiteSpace: "nowrap" }}><Route size={12} /> Route now</PressButton>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function GeoShortageMapCard({ inventory, onTransfer, push, chime }) {
  const [chapters, setChapters] = useState(REGIONAL_CHAPTERS_SEED);
  const [active, setActive] = useState(chapters[0]);
  const chapterTotal = (c) => Object.values(c.stock).reduce((a, v) => a + v, 0);
  const severity = (c) => { const t = chapterTotal(c); return t < 25 ? C.red : t < 45 ? C.amber : C.green; };
  const mostCriticalGroup = inventory.slice().sort((a, b) => a.units / a.cap - b.units / b.cap)[0];

  return (
    <Card>
      <SectionTitle eyebrow="Geospatial shortage mapping" title="Regional chapter stock levels" right={<Badge color={C.blue}><Globe2 size={11} style={{ verticalAlign: -2, marginRight: 4 }} />5 chapters</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {chapters.map((c) => (
            <div key={c.id} onClick={() => setActive(c)} style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 10, background: active?.id === c.id ? C.greenDim : C.surface2, border: `1px solid ${active?.id === c.id ? C.green + "55" : C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: severity(c), display: "inline-block" }} /> {c.name}
                </div>
                <span style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{chapterTotal(c)} units</span>
              </div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>
                {Object.entries(c.stock).map(([g, u]) => `${g} ${u}`).join(" · ")}
              </div>
            </div>
          ))}
        </div>
        <MapEmbed lat={active?.lat} lng={active?.lng} label={active?.name} height={280} />
      </div>
    </Card>
  );
}

function ColdChainCard() {
  const [boxes, setBoxes] = useState(TRANSIT_BOXES_SEED);
  const [active, setActive] = useState(TRANSIT_BOXES_SEED[0]);
  useEffect(() => {
    const t = setInterval(() => {
      setBoxes((bs) => bs.map((b) => ({ ...b, temp: Math.round(Math.min(8, Math.max(1, b.temp + (Math.random() - 0.5) * 0.6)) * 10) / 10 })));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <Card>
      <SectionTitle eyebrow="IoT cold chain sensors" title="Transit boxes — live temperature & GPS" right={<Badge color={C.blue}><Thermometer size={11} style={{ verticalAlign: -2, marginRight: 4 }} />ideal 2–6°C</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {boxes.map((b) => {
            const ok = coldChainOk(b.temp);
            return (
              <div key={b.id} onClick={() => setActive(b)} style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 10, background: active?.id === b.id ? C.greenDim : (ok ? C.surface2 : C.redDim), border: `1px solid ${active?.id === b.id ? C.green + "55" : ok ? C.border : C.red + "44"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{b.label}</div>
                  <span style={{ fontFamily: fontMono, fontSize: 12, fontWeight: 700, color: ok ? C.green : C.red }}>{b.temp}°C</span>
                </div>
              </div>
            );
          })}
        </div>
        <MapEmbed lat={active?.lat} lng={active?.lng} label={active?.label} height={220} />
      </div>
    </Card>
  );
}

function DroneDispatchCard({ requests, onDispatch, push, chime }) {
  const eligible = requests.filter((r) => r.urgency === "Critical" && (r.status === "Pending" || r.status === "Approved"));
  return (
    <Card>
      <SectionTitle eyebrow="Emergency logistics" title="Drone delivery for critical requests" right={<Badge color={C.blue}><Plane size={11} style={{ verticalAlign: -2, marginRight: 4 }} />{DRONE_BASE.label}</Badge>} />
      {eligible.length === 0 ? (
        <div style={{ color: C.text3, fontSize: 12.5, padding: 20, textAlign: "center" }}>No critical requests currently need drone dispatch.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {eligible.map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.id} · {r.hospital}</div>
                <div style={{ fontSize: 11.5, color: C.text2, marginTop: 1 }}>{r.group} · {r.units} units · <Badge color={urgencyColor(r.urgency)}>{r.urgency}</Badge></div>
              </div>
              {r.droneDispatched ? (
                <Badge color={C.blue}><Plane size={11} style={{ verticalAlign: -2, marginRight: 4 }} />En route</Badge>
              ) : (
                <PressButton onClick={() => onDispatch(r)} style={{ ...btnSolid(C.blue), fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}><Plane size={12} /> Dispatch drone</PressButton>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CrisisModeCard({ crisisMode, onActivate, onDeactivate }) {
  return (
    <Card style={crisisMode ? { background: `linear-gradient(135deg, ${C.red} 0%, #b8283b 100%)`, color: "#fff" } : {}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: crisisMode ? "rgba(255,255,255,0.18)" : C.redDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Siren size={20} color={crisisMode ? "#fff" : C.red} />
          </div>
          <div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 15.5 }}>Mass Casualty Surge Protocol</div>
            <div style={{ fontSize: 12, opacity: crisisMode ? 0.9 : 1, color: crisisMode ? "#fff" : C.text2, marginTop: 2 }}>
              {crisisMode ? "Active — emergency alerts broadcast to every eligible donor and intake is streamlined." : "One button broadcasts an emergency alert to matching eligible donors and streamlines intake."}
            </div>
          </div>
        </div>
        {crisisMode ? (
          <PressButton onClick={onDeactivate} style={{ background: "#fff", color: C.red, border: "none", padding: "9px 18px", borderRadius: 8, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Deactivate</PressButton>
        ) : (
          <PressButton onClick={onActivate} style={{ ...btnSolid(C.red), padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}><Siren size={13} /> Activate crisis mode</PressButton>
        )}
      </div>
    </Card>
  );
}

function AdminInsights({ inventory, requests, crisisMode, onActivateCrisis, onDeactivateCrisis, onDispatchDrone, push, chime }) {
  const [savedCount, setSavedCount] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <CrisisModeCard crisisMode={crisisMode} onActivate={onActivateCrisis} onDeactivate={onDeactivateCrisis} />
      <DemandForecastCard inventory={inventory} />
      <DiscardReductionCard inventory={inventory} push={push} chime={chime} savedCount={savedCount} setSavedCount={setSavedCount} />
      <GeoShortageMapCard inventory={inventory} push={push} chime={chime} />
      <DroneDispatchCard requests={requests} onDispatch={onDispatchDrone} push={push} chime={chime} />
      <ColdChainCard />
    </div>
  );
}

function AdminView({ section, inventory, onRestock, requests, donors, onAddDonor, notifications, crisisMode, onActivateCrisis, onDeactivateCrisis, onDecide, onComplete, onDispatchDrone, onNotifyCritical, push, chime, goto }) {
  if (section === "inventory") return <AdminInventory inventory={inventory} onRestock={onRestock} push={push} chime={chime} />;
  if (section === "requests") return <AdminRequests requests={requests} onDecide={onDecide} onComplete={onComplete} push={push} chime={chime} />;
  if (section === "donors") return <AdminDonors donors={donors} onAddDonor={onAddDonor} push={push} />;
  if (section === "notifications") return <AdminNotifications notifications={notifications} />;
  if (section === "insights") return <AdminInsights inventory={inventory} requests={requests} crisisMode={crisisMode} onActivateCrisis={onActivateCrisis} onDeactivateCrisis={onDeactivateCrisis} onDispatchDrone={onDispatchDrone} push={push} chime={chime} />;
  return <AdminOverview inventory={inventory} requests={requests} donors={donors} notifications={notifications} onDecide={onDecide} onNotifyCritical={onNotifyCritical} push={push} chime={chime} goto={goto} />;
}

/* =================================================================
   DONOR VIEWS
================================================================= */

const computeBadges = (count) => [
  { icon: Droplet, label: "First Donation", earned: count >= 1 },
  { icon: Flame, label: "3x Streak", earned: count >= 3 },
  { icon: Award, label: "Gold Donor", earned: count >= 5 },
  { icon: HeartPulse, label: "Lifesaver x10", earned: count >= 10 },
];
const LOYALTY_TIERS = [
  { min: 0, label: "Bronze", perk: "Standard scheduling" },
  { min: 3, label: "Silver", perk: "Priority scheduling unlocked" },
  { min: 5, label: "Gold", perk: "Priority scheduling + milestone certificate" },
  { min: 10, label: "Platinum", perk: "Priority scheduling + certificate + lifesaver recognition" },
];
const loyaltyTier = (count) => LOYALTY_TIERS.slice().reverse().find((t) => count >= t.min) || LOYALTY_TIERS[0];

function EditDonorProfileModal({ profile, onClose, onSave, onPictureSave }) {
  const [f, setF] = useState({
    name: profile.name || "",
    gender: profile.gender || "Male",
    group: profile.group || "O+",
    city: profile.city || "",
    phone: profile.phone || "",
    address: profile.address || "",
    email: profile.email || "",
    healthScore: profile.healthScore != null ? profile.healthScore : "",
    streak: profile.streak != null ? profile.streak : "",
    lastDonationDate: profile.lastDonationDate || "",
  });
  const [picPreview, setPicPreview] = useState(profile.profilePic || null);
  const [picLoading, setPicLoading] = useState(false);
  const fileRef = useRef(null);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Please pick an image smaller than 5 MB."); return; }
    setPicLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setPicPreview(b64);
      setPicLoading(false);
      onPictureSave?.(b64);
    };
    reader.readAsDataURL(file);
  };

  const avatarSrc = picPreview || getDonorAvatar(f.gender);

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Profile picture picker */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ position: "relative", cursor: "pointer", width: 84, height: 84 }}
            title="Click to change profile picture"
          >
            <img
              src={avatarSrc}
              alt="Profile"
              style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.green}`, display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "rgba(0,0,0,0.42)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3, opacity: 0, transition: "opacity 0.18s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Camera size={18} color="#fff" />
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>CHANGE</span>
            </div>
            {picLoading && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 10 }}>Saving…</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicChange} />
          <span style={{ fontSize: 11, color: C.text3 }}>Click the photo to upload a new one (max 5 MB)</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
          <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="Gender">
            <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })} style={inputStyle}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Blood group"><select value={f.group} onChange={(e) => setF({ ...f, group: e.target.value })} style={inputStyle}>{INVENTORY_SEED.map((b) => <option key={b.g} value={b.g}>{b.g}</option>)}</select></Field>
          <Field label="City"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} style={inputStyle} /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Health score (0-100)"><input type="number" min="0" max="100" value={f.healthScore} onChange={(e) => setF({ ...f, healthScore: e.target.value })} style={inputStyle} placeholder="e.g. 88" /></Field>
          <Field label="Donation streak"><input type="number" min="0" value={f.streak} onChange={(e) => setF({ ...f, streak: e.target.value })} style={inputStyle} placeholder="e.g. 3" /></Field>
        </div>
        <Field label="Last donation date"><input type="date" max={todayISO()} value={f.lastDonationDate} onChange={(e) => setF({ ...f, lastDonationDate: e.target.value })} style={inputStyle} /></Field>
        <Field label="Address"><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Phone"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={inputStyle} /></Field>
          <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={inputStyle} /></Field>
        </div>
        <PressButton onClick={() => {
          onSave({
            ...profile, ...f,
            healthScore: f.healthScore !== "" ? Number(f.healthScore) : null,
            streak: f.streak !== "" ? Number(f.streak) : 0,
            profilePic: picPreview || profile.profilePic
          });
          onClose();
        }} style={{ ...btnSolid(C.green), marginTop: 6 }}>Save changes</PressButton>
      </div>
    </Modal>
  );
}

function DonorProfileSection({ profile, donations, onLocationUpdate, onProfileSave, onDonationLogged, onPictureSave, push }) {
  const [edit, setEdit] = useState(false);
  const [locating, setLocating] = useState(false);
  const [logDate, setLogDate] = useState(todayISO());
  const since = profile.lastDonationDate ? daysAgo(profile.lastDonationDate) : null;
  const remaining = since !== null ? Math.max(0, 90 - since) : 0;
  const fileRef = useRef(null);
  const [picHover, setPicHover] = useState(false);

  const avatarSrc = profile.profilePic || getDonorAvatar(profile.gender);

  const handleQuickPicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { push("Image too large — please pick one under 5 MB", C.red); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      onPictureSave(b64);
      push("Profile picture updated!", C.green);
    };
    reader.readAsDataURL(file);
  };

  const shareLocation = () => {
    if (!navigator.geolocation) { push("Geolocation isn't supported in this browser", C.red); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        push("Your location is now visible to hospitals & admin", C.green);
      },
      (err) => { setLocating(false); push(`Couldn't get your location: ${err.message}`, C.red); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const logDonation = () => {
    if (!logDate) return;
    onDonationLogged(logDate);
    push("Donation logged — your eligibility countdown has been updated", C.green);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <Card hover style={{ background: `linear-gradient(135deg, ${C.surface} 60%, ${C.greenDim} 140%)` }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {/* Clickable avatar */}
          <div
            style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setPicHover(true)}
            onMouseLeave={() => setPicHover(false)}
            title="Click to change your profile picture"
          >
            <img
              src={avatarSrc}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.green}`, display: "block", transition: "filter 0.18s", filter: picHover ? "brightness(0.55)" : "brightness(1)" }}
            />
            {picHover && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, pointerEvents: "none" }}>
                <Camera size={16} color="#fff" />
                <span style={{ fontSize: 8.5, color: "#fff", fontWeight: 700, letterSpacing: 0.5 }}>CHANGE</span>
              </div>
            )}
            <div style={{ position: "absolute", bottom: -2, right: -2, background: C.amber, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}><Award size={11} color="#fff" /></div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQuickPicChange} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 600, color: C.text }}>{profile.name}</div>
                <div style={{ fontFamily: fontMono, fontSize: 12, color: C.text3 }}>{profile.id} · {profile.city} · <span style={{ color: C.red }}>{profile.group}</span></div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge color={profile.gender === "Female" ? C.red : C.blue}>{profile.gender || "Male"}</Badge>
                <Badge color={remaining === 0 ? C.green : C.amber}>{remaining === 0 ? "Eligible now" : `Eligible in ${remaining}d`}</Badge>
                <PressButton onClick={() => setEdit(true)} style={{ ...btnOutline, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}><Pencil size={12} /> Edit</PressButton>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>
              <MiniStat label="Last donation" value={formatLastDonation(profile.lastDonationDate)} />
              <MiniStat label="Health score" value={profile.healthScore != null ? `${profile.healthScore}/100` : "—"} />
              <MiniStat label="Streak" value={profile.streak != null && profile.streak > 0 ? `${profile.streak}x` : "—"} />
              <MiniStat label="Total donations" value={donations.length} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18, fontSize: 12.5, color: C.text2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={13} /> {profile.phone || <span style={{color:C.text3,fontStyle:"italic"}}>Phone not set</span>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={13} /> {profile.email || <span style={{color:C.text3,fontStyle:"italic"}}>Email not set</span>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={13} /> {profile.address || <span style={{color:C.text3,fontStyle:"italic"}}>Address not set — click Edit to add</span>}</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {computeBadges(donations.length).map((b, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: b.earned ? C.greenDim : C.surface2, border: `1px solid ${b.earned ? C.green + "44" : C.border}`, color: b.earned ? C.greenDeep : C.text3, fontSize: 11.5, fontWeight: 600, opacity: b.earned ? 1 : 0.55 }}><b.icon size={12} /> {b.label}</div>)}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="Donor recognition" title={`${loyaltyTier(donations.length).label} tier donor`} right={<Badge color={C.amber}><Trophy size={11} style={{ verticalAlign: -2, marginRight: 4 }} />{donations.length} donations</Badge>} />
        <div style={{ fontSize: 12.5, color: C.text2, marginBottom: 10 }}>{loyaltyTier(donations.length).perk}</div>
      </Card>

      <Card>
        <SectionTitle eyebrow="Eligibility tracking" title="Track your last blood donation" right={<Badge color={remaining === 0 ? C.green : C.amber}>{remaining === 0 ? "Eligible now" : `${remaining}d until eligible`}</Badge>} />
        <div style={{ fontSize: 12.5, color: C.text2, marginBottom: 14 }}>
          Log the date you last donated — this keeps your 90-day cooldown accurate for hospitals and admin, and updates your donation history automatically.
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
          <Field label="Donation date">
            <input type="date" max={todayISO()} value={logDate} onChange={(e) => setLogDate(e.target.value)} style={inputStyle} />
          </Field>
          <PressButton onClick={logDonation} style={{ ...btnSolid(C.green), display: "flex", alignItems: "center", gap: 6 }}><Droplet size={13} /> Log donation</PressButton>
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="Live location" title="Visible to hospitals & admin" right={
          <PressButton onClick={shareLocation} disabled={locating} style={{ ...btnSolid(C.green), display: "flex", alignItems: "center", gap: 6, opacity: locating ? 0.7 : 1 }}>
            <Navigation size={13} /> {locating ? "Locating…" : profile.lat != null ? "Update location" : "Share my location"}
          </PressButton>
        } />
        <div style={{ fontSize: 12.5, color: C.text2, marginBottom: 12 }}>
          When you share your location, nearby hospitals matching your blood group and the admin team can see it on a map to coordinate faster pickups during urgent requests.
        </div>
        <MapEmbed lat={profile.lat} lng={profile.lng} label={profile.name} />
      </Card>

      {edit && <EditDonorProfileModal
        profile={profile}
        onClose={() => setEdit(false)}
        onSave={(f) => { onProfileSave(f); push("Profile updated", C.green); }}
        onPictureSave={(b64) => onPictureSave(b64)}
      />}
    </div>
  );
}

function DonorNotificationsSection({ notifications, donorId, onRespond }) {
  const [filter, setFilter] = useState("All");
  const mine = notifications.filter((n) => n.donorId === donorId);
  const filtered = mine.filter((n) => filter === "All" || (filter === "Pending" ? !n.responded : n.responded === filter.toLowerCase()));
  return (
    <Card>
      <SectionTitle eyebrow="Real-time matching" title="Notifications for you" right={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select value={filter} onChange={setFilter} options={["All", "Pending", "Accepted", "Declined"]} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.text3, fontSize: 12 }}><Pulse size={7} color={C.green} /> live</div>
        </div>
      } />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && <div style={{ color: C.text3, fontSize: 12.5, padding: 20, textAlign: "center" }}>No notifications here.</div>}
        {filtered.map((n) => (
          <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
              <Bell size={15} color={C.amber} style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, color: C.text }}>{n.text}</div><div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3, marginTop: 2 }}>{n.req} · {n.time}</div></div>
            </div>
            {n.responded ? <Badge color={n.responded === "accepted" ? C.green : C.text3}>{n.responded === "accepted" ? "Accepted" : "Declined"}</Badge> : (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <PressButton onClick={() => onRespond(n.id, "accepted")} style={btnSolid(C.green)}>Accept</PressButton>
                <PressButton onClick={() => onRespond(n.id, "declined")} style={btnOutline}>Decline</PressButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function DonorHistorySection({ donations, profile }) {
  const totalMl = donations.reduce((a, d) => a + d.qty, 0);
  const chartData = donations.slice().reverse().map((d) => ({ date: d.date.slice(2), ml: d.qty }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard icon={<Droplet size={16} />} label="Total donations" value={donations.length} sub="lifetime" />
        <StatCard icon={<Activity size={16} />} label="Total volume" value={`${totalMl} ml`} sub={`~${(totalMl / 450).toFixed(1)} units`} tone={C.green} />
        <StatCard icon={<HeartPulse size={16} />} label="Lives potentially helped" value={donations.length * 3} sub="up to 3 per donation" tone={C.red} />
        <StatCard icon={<Timer size={16} />} label="Days since last" value={profile.lastDonationDate ? daysAgo(profile.lastDonationDate) : "—"} sub={`group ${profile.group}`} tone={C.amber} />
      </div>
      <Card>
        <SectionTitle eyebrow="History" title="Your donation record" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left", fontSize: 11, fontFamily: fontMono, textTransform: "uppercase" }}><th style={th}>Date</th><th style={th}>Quantity</th><th style={th}>Status</th></tr></thead>
          <tbody>{donations.map((row, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
              <td style={{ ...td, fontFamily: fontMono, color: C.text2 }}>{row.date}</td>
              <td style={td}>{row.qty} ml</td>
              <td style={td}><Badge color={C.text3}>{row.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

function DonorSlots({ profile, inventory, push, chime }) {
  const bag = inventory.find((b) => b.g === profile.group);
  const riskPct = bag ? forecastRisk(bag, UPCOMING_EVENTS_SEED) : 0;
  const priority = riskPct >= 35;
  const [selected, setSelected] = useState(null);
  const centers = ["Central Blood Bank — Mirpur", "Dhaka Medical College Camp", "Dhanmondi Community Center"];
  const slots = useMemo(() => {
    const out = [];
    for (let d = 1; d <= 6; d++) {
      const date = new Date(Date.now() + d * 86400000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      const times = priority ? ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM"] : ["11:00 AM", "3:00 PM"];
      times.forEach((t, i) => out.push({ id: `${d}-${i}`, date, time: t, center: centers[(d + i) % centers.length] }));
    }
    return out;
  }, [priority]);
  const book = (slot) => { setSelected(slot); push(`Slot booked: ${slot.date} at ${slot.time} — ${slot.center}`, C.green); chime("E6"); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle eyebrow="Donation schedule" title="Appointment availability based on current blood needs" right={priority ? <Badge color={C.red}>{profile.group} is in high demand</Badge> : <Badge color={C.green}>Standard availability</Badge>} />
        {selected && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: C.greenDim, border: `1px solid ${C.green}44`, marginBottom: 12, fontSize: 12.5, color: C.greenDeep }}><Check size={14} /> Booked: {selected.date} · {selected.time} · {selected.center}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 10 }}>
          {slots.map((s) => (
            <div key={s.id} onClick={() => book(s)} style={{ cursor: "pointer", padding: 12, borderRadius: 10, background: selected?.id === s.id ? C.greenDim : C.surface2, border: `1px solid ${selected?.id === s.id ? C.green + "55" : C.border}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{s.date}</div>
              <div style={{ fontSize: 13, fontFamily: fontMono, color: C.green, marginTop: 2 }}>{s.time}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{s.center}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DonorView({ section, profile, inventory, onLocationUpdate, onProfileSave, onDonationLogged, onPictureSave, notifications, onRespond, donations, push, chime }) {
  if (section === "notifications") return <DonorNotificationsSection notifications={notifications} donorId={profile.id} onRespond={onRespond} />;
  if (section === "history") return <DonorHistorySection donations={donations} profile={profile} />;
  if (section === "slots") return <DonorSlots profile={profile} inventory={inventory} push={push} chime={chime} />;
  return <DonorProfileSection profile={profile} donations={donations} onLocationUpdate={onLocationUpdate} onProfileSave={onProfileSave} onDonationLogged={onDonationLogged} onPictureSave={onPictureSave} push={push} />;
}

/* =================================================================
   HOSPITAL VIEWS
================================================================= */

function NearbyDonorsMap({ donors, requests, group }) {
  const busy = busyDonorIds(requests, null);
  const matches = donors.filter((d) => d.group === group && d.status === "Eligible" && !busy.has(d.id));
  const withLocation = matches.filter((d) => typeof d.lat === "number");
  const [active, setActive] = useState(withLocation[0] || null);

  return (
    <Card>
      <SectionTitle eyebrow="Live map" title={`Eligible ${group} donors near you`} right={<Badge color={C.blue}>{matches.length} available</Badge>} />
      {matches.length === 0 ? (
        <div style={{ color: C.text3, fontSize: 12.5, padding: 20, textAlign: "center" }}>No eligible donors of this group in the pool right now.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {matches.map((d) => (
              <div key={d.id} onClick={() => setActive(d)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: active?.id === d.id ? C.greenDim : C.surface2, border: `1px solid ${active?.id === d.id ? C.green + "55" : C.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{d.name}</div>
                  <div style={{ fontFamily: fontMono, fontSize: 11, color: C.text3 }}>{d.city} · last donated {formatLastDonation(d.lastDonationDate)}</div>
                </div>
              </div>
            ))}
          </div>
          <MapEmbed lat={active?.lat} lng={active?.lng} label={active?.name} height={matches.length * 50 > 200 ? matches.length * 50 : 200} />
        </div>
      )}
    </Card>
  );
}

function HospitalNewRequest({ requests, donors, onSubmitRequest, chime, hospitalName }) {
  const [form, setForm] = useState({ group: "O+", units: 2, urgency: "Normal" });
  const [matching, setMatching] = useState(false);
  const mine = requests.filter((r) => r.hospital === hospitalName);
  const unitsNeeded = Math.max(1, Number(form.units) || 1);
  const busy = busyDonorIds(requests, null);
  const eligiblePool = donors.filter((d) => d.group === form.group && d.status === "Eligible" && !busy.has(d.id)).length;
  const previewMatched = Math.min(unitsNeeded, eligiblePool);
  const submit = () => setMatching(true);
  const finalizeSubmit = () => { setMatching(false); onSubmitRequest(hospitalName, form); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card>
        <SectionTitle eyebrow="New request" title="Submit a blood request" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <Field label="Blood group"><select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} style={inputStyle}>{INVENTORY_SEED.map((b) => <option key={b.g} value={b.g}>{b.g}</option>)}</select></Field>
          <Field label="Units needed (bags)"><input type="number" min={1} value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} style={inputStyle} /></Field>
          <Field label="Urgency"><select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} style={inputStyle}><option>Normal</option><option>High</option><option>Critical</option></select></Field>
          <PressButton onClick={submit} style={{ ...btnSolid(C.red), padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Submit request</PressButton>
        </div>
      </Card>
      <NearbyDonorsMap donors={donors} requests={requests} group={form.group} />
      <Card>
        <SectionTitle eyebrow="Recent" title="Your last 3 requests" />
        <RequestsTable rows={mine.slice(0, 3)} />
      </Card>
      <MatchingOverlay active={matching} group={form.group} units={unitsNeeded} matchedCount={previewMatched} onDone={finalizeSubmit} />
    </div>
  );
}

function HospitalTrack({ requests, hospitalName }) {
  const [q, setQ] = useState(""); const [status, setStatus] = useState("All"); const [openId, setOpenId] = useState(null);
  const mine = requests.filter((r) => r.hospital === hospitalName);
  const filtered = mine.filter((r) => (status === "All" || r.status === status) && (r.id.toLowerCase().includes(q.toLowerCase()) || r.group.toLowerCase().includes(q.toLowerCase())));
  const open = requests.find((r) => r.id === openId) || null;
  return (
    <Card>
      <SectionTitle eyebrow="Tracking" title="Your requests" right={<div style={{ display: "flex", gap: 8 }}><SearchBox value={q} onChange={setQ} placeholder="Search ID or group" /><Select value={status} onChange={setStatus} options={["All", "Pending", "Approved", "Rejected", "Completed"]} /></div>} />
      <RequestsTable rows={filtered} onOpen={(r) => setOpenId(r.id)} />
      <TimelineModal request={open} onClose={() => setOpenId(null)} />
    </Card>
  );
}

function EditHospitalProfileModal({ profile, onClose, onSave }) {
  const [f, setF] = useState(profile);
  return (
    <Modal title="Edit hospital profile" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Hospital name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="License no."><input value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })} style={inputStyle} /></Field>
          <Field label="City"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} style={inputStyle} /></Field>
        </div>
        <Field label="Address"><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Phone"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={inputStyle} /></Field>
          <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={inputStyle} /></Field>
        </div>
        <PressButton onClick={() => { onSave(f); onClose(); }} style={{ ...btnSolid(C.green), marginTop: 6 }}>Save changes</PressButton>
      </div>
    </Modal>
  );
}

function HospitalProfileSection({ profile, requests, onProfileSave, push }) {
  const [edit, setEdit] = useState(false);
  const mine = requests.filter((r) => r.hospital === profile.name);
  const fulfilled = mine.filter((r) => r.status === "Completed").length;
  const rate = mine.length ? Math.round((fulfilled / mine.length) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card hover>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.blueDim, border: `1px solid ${C.blue}44`, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><HospitalIcon size={24} /></div>
            <div><div style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 600, color: C.text }}>{profile.name}</div><div style={{ fontFamily: fontMono, fontSize: 12, color: C.text3 }}>{profile.license}</div></div>
          </div>
          <PressButton onClick={() => setEdit(true)} style={{ ...btnOutline, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}><Pencil size={12} /> Edit</PressButton>
        </div>
      </Card>
      {edit && <EditHospitalProfileModal profile={profile} onClose={() => setEdit(false)} onSave={(f) => onProfileSave(f)} />}
    </div>
  );
}

function HospitalView({ section, requests, donors, profile, onProfileSave, onSubmitRequest, push, chime }) {
  if (section === "track") return <HospitalTrack requests={requests} hospitalName={profile.name} />;
  if (section === "profile") return <HospitalProfileSection profile={profile} requests={requests} onProfileSave={onProfileSave} push={push} />;
  return <HospitalNewRequest requests={requests} donors={donors} onSubmitRequest={onSubmitRequest} chime={chime} hospitalName={profile.name} />;
}

/* =================================================================
   LANDING & AUTH
================================================================= */

function TiltCard({ icon: Icon, title, desc, tone, onClick }) {
  const ref = useRef(null);
  const [tf, setTf] = useState("");
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    setTf(`perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setTf("")} onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 22px", cursor: "pointer", transform: tf, transition: "transform .15s ease, border-color .2s ease, box-shadow .2s ease", transformStyle: "preserve-3d", boxShadow: shadowSm }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = tone + "66"; e.currentTarget.style.boxShadow = shadowMd; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = shadowSm; }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: tone + "16", border: `1px solid ${tone}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icon size={21} color={tone} /></div>
      <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: C.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: tone, fontWeight: 600 }}>Enter portal <ArrowRight size={14} /></div>
    </div>
  );
}
function StepCard({ n, img, title, desc }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: C.surface, border: `1px solid ${C.border}`, boxShadow: shadowSm }}>
      <div style={{ height: 150, position: "relative", overflow: "hidden" }}>
        <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 40%, ${C.greenDeep}99 100%)` }} />
        <div style={{ position: "absolute", top: 12, left: 12, width: 30, height: 30, borderRadius: "50%", background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontDisplay, fontWeight: 700, fontSize: 13 }}>{n}</div>
      </div>
      <div style={{ padding: "16px 18px" }}><div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 15.5, color: C.text, marginBottom: 6 }}>{title}</div><div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{desc}</div></div>
    </div>
  );
}
function GlassStat({ icon, label, value, delta }) {
  return (
    <div style={{ ...glass, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7CE8AE", flexShrink: 0 }}>{icon}</div>
      <div><div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><div style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value.toLocaleString()}</div>{delta && <span style={{ fontSize: 10, color: "#7CE8AE", fontFamily: fontMono }}>{delta}</span>}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>{label}</div></div>
    </div>
  );
}
function FeatureRow({ icon, tone, title, desc }) {
  return <Card hover style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: tone + "16", border: `1px solid ${tone}44`, display: "flex", alignItems: "center", justifyContent: "center", color: tone, flexShrink: 0, marginTop: 2 }}>{icon}</div><div><div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginBottom: 4 }}>{title}</div><div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>{desc}</div></div></Card>;
}

function Landing({ onEnter, feed, soundOn, setSoundOn, inventory }) {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const totalUnits = inventory.reduce((a, b) => a + b.units, 0);
  const units = useCountUp(totalUnits, 1400);
  const donorsN = useCountUp(128546, 1600);
  const hospitalsN = useCountUp(520, 1400);
  const livesSaved = useCountUp(15234, 1600);
  const heroRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onHeroMove = (e) => { const r = heroRef.current?.getBoundingClientRect(); if (!r) return; setParallax({ x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * 14 }); };

  return (
    <div>
      <div ref={heroRef} onMouseMove={onHeroMove} style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginTop: 8, background: `linear-gradient(135deg, ${C.greenDeep} 0%, #124A2D 55%, #0E2A1C 100%)` }}>
        <FloatingDrops count={11} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 44px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Droplet size={15} color="#fff" fill="#fff" /></div><span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 15, color: "#fff" }}>Blood4Life</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setShowAboutModal(true)} style={{ ...glass, padding: "7px 14px", borderRadius: 9, color: "#fff", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: fontBody }}>
              <Sparkles size={14} color={C.greenSoft} /> About Us
            </button>
            <button onClick={() => setSoundOn((s) => !s)} title="Toggle UI sound" style={{ ...glass, width: 34, height: 34, borderRadius: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
          </div>
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, alignItems: "center", padding: "26px 44px 24px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "5px 12px", marginBottom: 20, backdropFilter: "blur(4px)" }}><Pulse color="#ff8a97" size={6} /><span style={{ fontSize: 11.5, fontFamily: fontMono, color: "#fff", textTransform: "uppercase", letterSpacing: 0.6 }}>Live emergency network</span></div>
            <h1 style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 46, lineHeight: 1.06, margin: 0, color: "#fff" }}>Every drop<br /><span style={{ color: "#7CE8AE" }}>saves a life.</span></h1>
            <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 15.5, marginTop: 16, fontFamily: fontMono, minHeight: 24 }}><TypingText phrases={["Matched to a donor in under 2 minutes.", "Tracked from request to transfusion.", "Trusted by 520+ partner hospitals."]} /></div>
            <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
              <MagneticButton tone={C.red} solid icon={Droplet} onClick={() => onEnter("donor")}>Donate Blood</MagneticButton>
              <MagneticButton tone={C.blue} solid icon={AlertTriangle} onClick={() => onEnter("hospital")}>Request Blood</MagneticButton>
              <MagneticButton onClick={() => onEnter("donor")} icon={Heart}>Become Donor</MagneticButton>
              <MagneticButton onClick={() => onEnter("admin")} icon={Search}>Find Nearby Blood</MagneticButton>
            </div>
          </div>
          <div style={{ position: "relative", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", overflow: "hidden", boxShadow: shadowLg }}>
              <ErrorBoundary><Hero3D height={380} /></ErrorBoundary>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", padding: "0 44px 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <GlassStat icon={<Droplet size={16} />} label="Units tracked" value={units} delta="+6 today" />
          <GlassStat icon={<Users size={16} />} label="Registered donors" value={donorsN} delta="+25 today" />
          <GlassStat icon={<Building2 size={16} />} label="Partner hospitals" value={hospitalsN} delta="↑12%" />
          <GlassStat icon={<Heart size={16} />} label="Lives saved" value={livesSaved} delta="+3 today" />
        </div>
      </div>

      <div style={{ marginTop: 22 }}><ActivityTicker items={feed.map((f) => f.text)} /></div>

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div><SectionTitle eyebrow="Right now" title="Critical blood needed" /><EmergencyWidget inventory={inventory} /></div>
        <div><SectionTitle eyebrow="Network" title="Donors & hospitals near you" /><LiveMap /></div>
      </div>

      <div style={{ marginTop: 40 }}>
        <SectionTitle eyebrow="Choose your portal" title="One system, three points of view" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <TiltCard icon={LayoutGrid} title="Admin" tone={C.red} onClick={() => onEnter("admin")} desc="Monitor inventory in real time, approve hospital requests, and track the donor pool." />
          <TiltCard icon={Heart} title="Donor" tone={C.green} onClick={() => onEnter("donor")} desc="Get matched to urgent requests near you, respond in one tap, and track your history." />
          <TiltCard icon={HospitalIcon} title="Hospital" tone={C.amber} onClick={() => onEnter("hospital")} desc="Submit a blood request by group and urgency, and track it through to fulfilment." />
        </div>
      </div>

      <div style={{ marginTop: 44 }}>
        <SectionTitle eyebrow="How it works" title="From sign-up to saving a life, in three steps" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StepCard n="1" img={IMG.step1} title="Register as a donor" desc="Share your blood group, city, and contact details once — the system tracks your eligibility automatically." />
          <StepCard n="2" img={IMG.step2} title="Get matched instantly" desc="When a hospital raises a request, eligible donors nearby are notified in real time." />
          <StepCard n="3" img={IMG.step3} title="Accept and donate" desc="Confirm in one tap, visit the blood bank, and your donation updates inventory automatically." />
        </div>
      </div>

      <div style={{ marginTop: 44 }}>
        <DoctorMessageCard />
      </div>

      {/* Clean Footer & About Us trigger */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`, fontSize: 12.5, color: C.text3, flexWrap: "wrap", gap: 12 }}>
        <div>© 2026 Blood4Life Emergency Network. All rights reserved.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setShowAboutModal(true)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={14} /> About Us
          </button>
        </div>
      </footer>

      {showAboutModal && <AboutUsModal onClose={() => setShowAboutModal(false)} />}
    </div>
  );
}

function DoctorMessageCard() {
  return (
    <Card style={{ background: `linear-gradient(135deg, ${C.surface} 50%, ${C.surface2} 100%)`, border: `1px solid ${C.green}44`, padding: "28px 30px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "center" }}>
        <div style={{ position: "relative", textAlign: "center" }}>
          <img
            src={IMG.doctor}
            alt="Doctor Specialist"
            style={{ width: 180, height: 220, borderRadius: 16, objectFit: "cover", border: `3px solid ${C.green}`, boxShadow: shadowMd }}
          />
          <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: "90%" }}>
            <Badge color={C.green}>Medical Advisor</Badge>
          </div>
        </div>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.green, fontFamily: fontMono, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>
            <HeartPulse size={14} /> Doctor's Advice & Medical Guidance
          </div>
          <h3 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: C.text }}>
            "A Single Donation Can Save Up to 3 Lives"
          </h3>
          <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>
            “Every two seconds, someone urgently needs blood for emergency trauma, surgery, or cancer treatments. Voluntary blood donation is safe, healthy, and stimulates your bone marrow to produce fresh blood cells. Blood4Life’s automated system bridges the vital gap between donor availability and critical hospital need.”
          </p>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Dr. Anowar Hossain, MD</div>
              <div style={{ fontSize: 12, color: C.text3 }}>Chief Hematologist & Clinical Director</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.green, fontWeight: 600, background: C.greenDim, padding: "5px 10px", borderRadius: 8 }}>
                <Check size={13} /> 100% Safe & Screened
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.red, fontWeight: 600, background: C.redDim, padding: "5px 10px", borderRadius: 8 }}>
                <Droplet size={13} /> 450ml Saves 3 Lives
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AboutUsModal({ onClose }) {
  return (
    <Modal title="About Blood4Life" onClose={onClose} width={540}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.greenDim, border: `1px solid ${C.green}44`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 700, color: C.text }}>
              Blood4Life Network
            </div>
            <div style={{ fontSize: 12.5, color: C.text2, marginTop: 1 }}>
              Created and developed by <strong style={{ color: C.greenDeep }}>Abu Sayed Ruman</strong>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>
          Blood4Life is a real-time emergency blood network created and developed by <strong>Abu Sayed Ruman</strong>. The platform connects hospitals, blood banks, and volunteer donors quickly so patients get life-saving blood without delay.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontFamily: fontMono, textTransform: "uppercase", color: C.green, fontWeight: 600 }}>Founder & Developer</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: 700, color: C.text, marginTop: 4 }}>Abu Sayed Ruman</div>
            <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>Project Creator & Lead Developer</div>
          </div>
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontFamily: fontMono, textTransform: "uppercase", color: C.red, fontWeight: 600 }}>Our Goal</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: 700, color: C.text, marginTop: 4 }}>Fast Blood Access</div>
            <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>Helping save lives when every second counts</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontFamily: fontMono, textTransform: "uppercase", color: C.text3, marginTop: 4 }}>Key Features</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text2 }}><ShieldCheck size={14} color={C.green} /> Instant donor matching for urgent hospital requests</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text2 }}><Radio size={14} color={C.green} /> Immediate emergency notifications to nearby donors</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text2 }}><Thermometer size={14} color={C.green} /> Temperature-monitored transport & emergency drone delivery</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text2 }}><Users size={14} color={C.green} /> Secure user accounts and permanent database records</div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: C.text3 }}>© 2026 Blood4Life Network</span>
          <PressButton onClick={onClose} style={btnSolid(C.green)}>Close</PressButton>
        </div>
      </div>
    </Modal>
  );
}

function PasswordField({ value, onChange, placeholder, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="current-password"
        style={{ ...inputStyle, width: "100%", paddingRight: 36, cursor: "text" }}
      />
      <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 11, fontFamily: fontMono }}>
        {show ? "HIDE" : "SHOW"}
      </button>
    </div>
  );
}

function LoginScreen({ initialRole, users, onSuccess, onBack, push }) {
  const [role, setRole] = useState(initialRole || "donor");
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [group, setGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [license, setLicense] = useState("");
  const [error, setError] = useState("");
  const meta = ROLE_META[role];

  useEffect(() => {
    setMode("login"); setUsername(""); setPassword(""); setName("");
    setGender("Male"); setGroup("O+"); setPhone(""); setEmail(""); setCity(""); setAddress(""); setLicense(""); setError("");
  }, [role]);

  const submitLogin = async () => {
    setError("");
    try {
      const res = await api.login(role, username, password);
      onSuccess(role, res.user);
      push?.(`Welcome back, ${res.user.name.split(" ")[0]}.`, meta.tone);
    } catch (err) {
      // Local fallback in case database endpoint is unreachable
      const account = users[role].find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (!account) { setError(`No ${meta.label.toLowerCase()} account found for that username.`); return; }
      if (account.password !== password) { setError("Incorrect password. Please try again."); return; }
      onSuccess(role, account);
      push?.(`Welcome back, ${account.name.split(" ")[0]}.`, meta.tone);
    }
  };

  const submitRegister = async () => {
    setError("");
    const commonMissing = !name.trim() || !username.trim() || password.length < 6 || !phone.trim() || !email.trim() || !city.trim() || !address.trim();
    if (commonMissing) { setError("Please fill every field — password needs at least 6 characters."); return; }
    if (role === "hospital" && !license.trim()) { setError("Please enter your hospital's license number."); return; }

    const payload = { role, username, password, name, group, gender, phone, email, city, address, license };
    try {
      const res = await api.register(payload);
      onSuccess(role, res.user);
      push?.(`Account created — welcome, ${res.user.name.split(" ")[0]}!`, meta.tone);
    } catch (err) {
      setError(err.message || "Failed to create account");
    }
  };

  const onKeyDownSubmit = (fn) => (e) => { if (e.key === "Enter") fn(); };

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${C.greenDeep} 0%, #124A2D 55%, #0E2A1C 100%)`, position: "relative", overflow: "hidden" }}>
      <FloatingDrops count={9} />
      <div style={{ position: "relative", width: 460, maxWidth: "92vw", background: C.surface, borderRadius: 20, padding: "28px 28px 26px", boxShadow: shadowLg, maxHeight: "94vh", overflowY: "auto" }}>
        <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.text3, fontSize: 12, marginBottom: 18 }}>
          <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} /> Back to home
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Droplet size={16} color="#fff" fill="#fff" /></div>
          <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 17 }}>Blood4Life</span>
        </div>
        <div style={{ color: C.text3, fontSize: 12.5, marginBottom: 18 }}>Sign in to the portal that matches your role. Live data is synchronized with your local XAMPP MySQL database.</div>

        <div style={{ display: "flex", background: C.surface2, borderRadius: 10, padding: 3, marginBottom: 18, border: `1px solid ${C.border}` }}>
          {Object.keys(ROLE_META).map((r) => {
            const m = ROLE_META[r];
            return (
              <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer", background: role === r ? C.surface : "transparent", boxShadow: role === r ? shadowSm : "none", color: role === r ? m.tone : C.text3, fontSize: 12, fontWeight: 600, fontFamily: fontBody, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <m.icon size={14} />{m.label}
              </button>
            );
          })}
        </div>

        {mode === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Username">
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={role === "hospital" ? "e.g. dmc" : role === "admin" ? "e.g. admin" : "e.g. rafiq"} autoComplete="username" style={{ ...inputStyle, width: "100%", cursor: "text" }} />
            </Field>
            <Field label="Password">
              <PasswordField value={password} onChange={setPassword} placeholder="Enter password" onKeyDown={onKeyDownSubmit(submitLogin)} />
            </Field>
            {error && <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.red, fontSize: 12.5, background: C.redDim, borderRadius: 8, padding: "8px 10px" }}><AlertTriangle size={13} /> {error}</div>}
            <PressButton onClick={submitLogin} style={{ ...btnSolid(meta.tone), width: "100%", padding: "10px 0", fontSize: 13.5, marginTop: 4 }}>Sign in as {meta.label}</PressButton>
            <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 11, color: C.text3, fontFamily: fontMono }}>
              Demo credentials — {role}: {users[role][0]?.username} / {users[role][0]?.password}
            </div>
            {role !== "admin" && (
              <div style={{ textAlign: "center", fontSize: 12.5, color: C.text3 }}>
                New {meta.label.toLowerCase()}? <span onClick={() => setMode("register")} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Create an account</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label={role === "hospital" ? "Hospital name" : "Full name"}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "hospital" ? "e.g. Green Life Hospital" : "e.g. Your name"} style={{ ...inputStyle, width: "100%", cursor: "text" }} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Choose a username">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Unique username" autoComplete="username" style={inputStyle} />
              </Field>
              <Field label="Choose a password">
                <PasswordField value={password} onChange={setPassword} placeholder="At least 6 characters" onKeyDown={onKeyDownSubmit(submitRegister)} />
              </Field>
            </div>

            {role === "donor" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Blood group">
                    <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                      {INVENTORY_SEED.map((b) => <option key={b.g} value={b.g}>{b.g}</option>)}
                    </select>
                  </Field>
                  <Field label="Gender">
                    <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </Field>
                </div>
              </>
            )}
            {role === "hospital" && (
              <Field label="License number">
                <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="e.g. LIC-1042" style={{ ...inputStyle, width: "100%", cursor: "text" }} />
              </Field>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880-1XXX-XXXXXX" style={inputStyle} />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="City">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mirpur" style={inputStyle} />
              </Field>
              <Field label="Address">
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area" style={inputStyle} />
              </Field>
            </div>

            {error && <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.red, fontSize: 12.5, background: C.redDim, borderRadius: 8, padding: "8px 10px" }}><AlertTriangle size={13} /> {error}</div>}
            <PressButton onClick={submitRegister} style={{ ...btnSolid(meta.tone), width: "100%", padding: "10px 0", fontSize: 13.5, marginTop: 4 }}>Create {meta.label.toLowerCase()} account</PressButton>
            <div style={{ textAlign: "center", fontSize: 12.5, color: C.text3 }}>
              Already registered? <span onClick={() => setMode("login")} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Sign in instead</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = C.green) => { const id = Math.random().toString(36).slice(2); setToasts((t) => [...t, { id, message, tone }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200); }, []);
  return { toasts, push };
}
function ToastStack({ toasts }) {
  return <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 999 }}>{toasts.map((t) => <div key={t.id} style={{ background: C.surface, border: `1px solid ${t.tone}55`, borderLeft: `3px solid ${t.tone}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, minWidth: 240, boxShadow: shadowLg, animation: "b4l-slide-in .3s ease" }}>{t.message}</div>)}</div>;
}

/* =================================================================
   MAIN APP SHELL
================================================================= */

const NAV = {
  admin: [{ key: "overview", icon: LayoutGrid, label: "Overview" }, { key: "insights", icon: Brain, label: "Shortage Forecast" }, { key: "inventory", icon: Droplet, label: "Inventory" }, { key: "requests", icon: ClipboardList, label: "Requests" }, { key: "donors", icon: Users, label: "Donors" }, { key: "notifications", icon: Bell, label: "Notifications" }],
  donor: [{ key: "profile", icon: Activity, label: "My profile" }, { key: "slots", icon: CalendarClock, label: "Book a slot" }, { key: "notifications", icon: Bell, label: "Notifications" }, { key: "history", icon: ClipboardList, label: "Donation history" }],
  hospital: [{ key: "newRequest", icon: Plus, label: "New request" }, { key: "track", icon: ClipboardList, label: "Track requests" }, { key: "profile", icon: Building2, label: "Hospital profile" }],
};

export default function App() {
  const [view, setView] = useState("landing");
  const [role, setRole] = useState("admin");
  const [section, setSection] = useState("overview");
  const [inventory, setInventory] = useState(INVENTORY_SEED);
  const [requests, setRequests] = useState(REQUESTS_SEED);
  const [donors, setDonors] = useState(DONORS_SEED);
  const [donations, setDonations] = useState(DONATIONS_SEED);
  const [notifications, setNotifications] = useState(NOTIFS_SEED);
  const [donorProfile, setDonorProfile] = useState(DONOR_PROFILE_SEED);
  const [hospitalProfile, setHospitalProfile] = useState(HOSPITAL_PROFILE_SEED);
  const [feed, setFeed] = useState([]);
  const [crisisMode, setCrisisMode] = useState(false);
  const [users, setUsers] = useState(USERS_SEED);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState("donor");
  const { toasts, push } = useToasts();
  const { enabled: soundOn, setEnabled: setSoundOn, play: chime } = useChime();

  // Load initial data from backend API
  const refreshData = useCallback(async () => {
    try {
      const [inv, reqs, dns, notifs, crisis, dbUsers] = await Promise.all([
        api.getInventory().catch(() => null),
        api.getRequests().catch(() => null),
        api.getDonors().catch(() => null),
        api.getNotifications().catch(() => null),
        api.getCrisis().catch(() => null),
        api.getUsers().catch(() => null),
      ]);
      if (inv) setInventory(inv);
      if (reqs) setRequests(reqs);
      if (dns) setDonors(dns);
      if (notifs) setNotifications(notifs);
      if (crisis) setCrisisMode(crisis.active);
      if (dbUsers && Array.isArray(dbUsers)) {
        const grouped = { admin: [], donor: [], hospital: [] };
        dbUsers.forEach((u) => {
          if (grouped[u.role]) {
            grouped[u.role].push({
              id: u.id,
              username: u.username,
              password: u.password,
              name: u.name,
              profileId: u.profileId || u.profile_id,
              license: u.license
            });
          }
        });
        setUsers({
          admin: [...grouped.admin, ...USERS_SEED.admin.filter((a) => !grouped.admin.some((x) => x.username === a.username))],
          donor: [...grouped.donor, ...USERS_SEED.donor.filter((d) => !grouped.donor.some((x) => x.username === d.username))],
          hospital: [...grouped.hospital, ...USERS_SEED.hospital.filter((h) => !grouped.hospital.some((x) => x.username === h.username))],
        });
      }
    } catch (err) {
      console.warn("Could not sync with MySQL backend, using local state", err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Live polling for backend updates without fake random auto-changing notifications
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 6000);
    return () => clearInterval(timer);
  }, [refreshData]);

  const goToLogin = (r) => { setLoginRole(r); setView("login"); };

  const handleLoginSuccess = async (r, account) => {
    setCurrentUser({ role: r, username: account.username, name: account.name });
    setRole(r);
    setSection(NAV[r][0].key);
    setView("dashboard");

    if (r === "donor") {
      // First try to get fresh data from backend
      try {
        const freshDonors = await api.getDonors();
        const matched = freshDonors.find((d) => d.id === account.profileId);
        if (matched) {
          setDonorProfile(matched);
          setDonors(freshDonors);
          refreshData();
          return;
        }
      } catch {}
      // Fallback: build profile from registration data
      const matched = donors.find((d) => d.id === account.profileId);
      if (matched) {
        setDonorProfile(matched);
      } else {
        setDonorProfile({
          id: account.profileId || "D-NEW",
          name: account.name,
          group: account.group || "O+",
          gender: account.gender || "Male",
          city: account.city || "",
          address: account.address || "",
          phone: account.phone || "",
          email: account.email || "",
          healthScore: null,
          streak: null,
          profilePic: null,
          lat: null, lng: null,
          lastDonationDate: null
        });
      }
    } else if (r === "hospital") {
      try {
        const hp = await api.getHospitalProfile(account.name);
        setHospitalProfile(hp);
      } catch {
        setHospitalProfile({ name: account.name, license: account.license || "LIC-1001", address: account.address || "Dhaka", city: account.city || "Dhaka", phone: account.phone || "—", email: account.email || "—" });
      }
    }
    refreshData();
  };

  const handleLogout = () => { setCurrentUser(null); setView("landing"); };

  const restockInventory = async (group) => {
    setInventory((inv) => inv.map((b) => (b.g === group ? { ...b, units: Math.min(b.cap, b.units + 1) } : b)));
    push(`+1 unit added to ${group}`, C.green);
    chime("E6");
    api.restockInventory(group).catch(() => {});
  };

  const updateDonorLocation = async ({ lat, lng }) => {
    setDonorProfile((p) => ({ ...p, lat, lng }));
    setDonors((ds) => ds.map((d) => (d.id === donorProfile.id ? { ...d, lat, lng } : d)));
    api.updateDonorLocation(donorProfile.id, lat, lng).catch(() => {});
  };

  const saveDonorProfile = async (f) => {
    setDonorProfile(f);
    setDonors((ds) => ds.map((d) => (d.id === f.id ? { ...d, ...f } : d)));
    try {
      await api.updateDonorProfile(f.id, {
        name: f.name, group: f.group, gender: f.gender || "Male",
        city: f.city, address: f.address, phone: f.phone, email: f.email,
        healthScore: f.healthScore !== "" && f.healthScore != null ? Number(f.healthScore) : null,
        streak: f.streak !== "" && f.streak != null ? Number(f.streak) : 0,
        lastDonationDate: f.lastDonationDate || null,
      });
    } catch {}
  };

  const saveDonorPicture = async (b64) => {
    setDonorProfile((p) => ({ ...p, profilePic: b64 }));
    setDonors((ds) => ds.map((d) => (d.id === donorProfile.id ? { ...d, profilePic: b64 } : d)));
    try {
      await api.updateDonorPicture(donorProfile.id, b64);
    } catch {}
  };

  const logDonorDonation = async (dateStr) => {
    setDonations((ds) => [{ date: dateStr, qty: 450, status: "Completed" }, ...ds]);
    setDonorProfile((p) => ({ ...p, lastDonationDate: dateStr }));
    setDonors((ds) => ds.map((d) => (d.id === donorProfile.id ? { ...d, lastDonationDate: dateStr, status: computeDonorStatus(dateStr) } : d)));
    api.logDonation(donorProfile.id, dateStr).catch(() => {});
  };

  const activateCrisis = async () => {
    setCrisisMode(true);
    push("Crisis mode activated — emergency alerts sent to eligible donors", C.red);
    chime("E6");
    api.toggleCrisis(true).then(refreshData).catch(() => {});
  };
  const deactivateCrisis = async () => {
    setCrisisMode(false);
    push("Crisis mode deactivated", C.green);
    api.toggleCrisis(false).then(refreshData).catch(() => {});
  };

  const submitHospitalRequest = async (hospitalName, form) => {
    push(`Blood request submitted for ${form.units} unit(s) of ${form.group}`, C.green);
    chime("E6");
    try {
      await api.createRequest(hospitalName, form.group, form.units, form.urgency);
      refreshData();
    } catch {
      refreshData();
    }
  };

  const decideRequest = async (id, decision) => {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: decision } : r)));
    push(`${id} ${decision.toLowerCase()}`, decision === "Approved" ? C.green : C.red);
    chime(decision === "Approved" ? "E6" : "A4");
    api.decideRequest(id, decision).catch(() => {});
  };

  const completeRequest = async (id) => {
    push(`${id} marked completed`, C.green);
    chime("E6");
    api.completeRequest(id).then(refreshData).catch(() => {});
  };

  const dispatchDrone = async (r) => {
    setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, droneDispatched: true } : x)));
    push(`Drone dispatched for ${r.id}`, C.blue);
    chime("E6");
    api.dispatchDrone(r.id).catch(() => {});
  };

  const respondToNotification = async (id, val) => {
    setNotifications((ns) => ns.map((x) => (x.id === id ? { ...x, responded: val } : x)));
    push(val === "accepted" ? "Response recorded — thank you!" : "Response recorded", val === "accepted" ? C.green : C.text3);
    chime(val === "accepted" ? "E6" : "A4");
    api.respondNotification(id, val).then(refreshData).catch(() => {});
  };

  const notifyCriticalGroups = async (groups) => {
    push(`Notified eligible donors for groups: ${groups.join(", ")}`, C.red);
    chime("E6");
    api.notifyCritical(groups).then(refreshData).catch(() => {});
  };

  const addDonor = async (newDonor) => {
    try {
      const res = await api.addDonor(newDonor);
      if (res && res.donor) {
        setDonors((ds) => [res.donor, ...ds]);
        push(`Donor "${newDonor.name}" saved to MySQL with username "${res.donor.username || newDonor.username}"`, C.green);
      } else {
        setDonors((ds) => [newDonor, ...ds]);
        push(`${newDonor.name} added to donor pool`, C.green);
      }
      chime("E6");
      refreshData();
    } catch (err) {
      push(`Added donor: ${err.message || 'Saved locally'}`, C.amber);
      setDonors((ds) => [newDonor, ...ds]);
    }
  };

  const saveHospitalProfile = async (f) => {
    const oldName = hospitalProfile.name;
    setHospitalProfile(f);
    push("Hospital profile updated", C.green);
    api.updateHospitalProfile({ ...f, oldName }).catch(() => {});
  };

  return (
    <div style={{ fontFamily: fontBody, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes b4l-ping { 0% { transform: scale(1); opacity: .6; } 75%, 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes b4l-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes b4l-slide-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes b4l-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes b4l-float { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-560px) rotate(25deg); } }
        @keyframes b4l-drift { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
        @keyframes b4l-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::selection { background: ${C.green}33; }
        button { font-family: inherit; }
        select, input { cursor: pointer; }
      `}</style>

      <ToastStack toasts={toasts} />

      <ErrorBoundary>
      {view === "landing" ? (
        <div style={{ flex: 1, width: "100%", padding: "0 4vw 60px" }}>
          <Landing onEnter={goToLogin} feed={feed} soundOn={soundOn} setSoundOn={setSoundOn} inventory={inventory} />
        </div>
      ) : view === "login" ? (
        <LoginScreen initialRole={loginRole} users={users} onSuccess={handleLoginSuccess} onBack={() => setView("landing")} push={push} />
      ) : (
        <>
          <div style={{ width: 220, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", flexShrink: 0, background: C.surface }}>
            <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px", marginBottom: 22, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Droplet size={15} color="#fff" fill="#fff" /></div>
              <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16 }}>Blood4Life</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 10px", marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: ROLE_META[role].tone, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: fontDisplay, flexShrink: 0 }}>
                {(currentUser?.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.name}</div>
                <div style={{ fontSize: 10.5, color: C.text3, fontFamily: fontMono, textTransform: "uppercase", letterSpacing: 0.5 }}>{ROLE_META[role].label} account</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV[role].map((n) => (
                <div key={n.key} onClick={() => setSection(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: section === n.key ? C.greenDim : "transparent", color: section === n.key ? C.greenDeep : C.text2, fontSize: 13.5, cursor: "pointer", fontWeight: section === n.key ? 600 : 400, transition: "background .15s ease" }}>
                  <n.icon size={15} />{n.label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 6px", color: C.red, fontSize: 12.5, fontWeight: 600, cursor: "pointer", borderRadius: 8 }}><LogOut size={13} /> Log out</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, width: "100%", padding: "24px 3vw 60px" }}>
            {crisisMode && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: `linear-gradient(135deg, ${C.red}, #b8283b)`, color: "#fff", borderRadius: 12, padding: "10px 16px", marginBottom: 18, boxShadow: `0 10px 24px ${C.red}44` }}>
                <Siren size={16} />
                <div style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>Emergency Surge Alert Active — urgent alerts sent to available donors in your area.</div>
                {role === "admin" && <PressButton onClick={deactivateCrisis} style={{ background: "#fff", color: C.red, border: "none", padding: "6px 12px", borderRadius: 7, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>Deactivate</PressButton>}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 11, color: C.green, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Emergency Blood Bank & Donor Network</div>
                <h1 style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 600, margin: "4px 0 0" }}>{role === "admin" && "Admin"}{role === "donor" && `Welcome back, ${donorProfile.name.split(" ")[0]}`}{role === "hospital" && hospitalProfile.name} <span style={{ color: C.text3, fontWeight: 400, fontSize: 16 }}>{role !== "donor" && `· ${NAV[role].find((n) => n.key === section)?.label}`}{role === "donor" && `· ${NAV.donor.find((n) => n.key === section)?.label}`}</span></h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <NotificationCenter feed={feed} notifications={notifications} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text2, fontSize: 12.5, fontFamily: fontMono }}><Pulse color={C.green} /> MySQL synced</div>
              </div>
            </div>
            <ErrorBoundary key={role + section}>
              <div style={{ animation: "b4l-fade-up .35s ease" }}>
                {role === "admin" && <AdminView section={section} inventory={inventory} onRestock={restockInventory} requests={requests} donors={donors} onAddDonor={addDonor} notifications={notifications} crisisMode={crisisMode} onActivateCrisis={activateCrisis} onDeactivateCrisis={deactivateCrisis} onDecide={decideRequest} onComplete={completeRequest} onDispatchDrone={dispatchDrone} onNotifyCritical={notifyCriticalGroups} push={push} chime={chime} goto={setSection} />}
                {role === "donor" && <DonorView section={section} profile={donorProfile} inventory={inventory} onLocationUpdate={updateDonorLocation} onProfileSave={saveDonorProfile} onDonationLogged={logDonorDonation} onPictureSave={saveDonorPicture} notifications={notifications} onRespond={respondToNotification} donations={donations} push={push} chime={chime} />}
                {role === "hospital" && <HospitalView section={section} requests={requests} donors={donors} profile={hospitalProfile} onProfileSave={saveHospitalProfile} onSubmitRequest={submitHospitalRequest} push={push} chime={chime} />}
              </div>
            </ErrorBoundary>
          </div>
        </>
      )}
      </ErrorBoundary>
    </div>
  );
}
