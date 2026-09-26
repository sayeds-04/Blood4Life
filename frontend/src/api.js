// API Service connecting React frontend to Express / MySQL backend
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  } catch (err) {
    console.warn(`[API Warning] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (role, username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ role, username, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getUsers: () => request('/roles/users'),

  // Inventory
  getInventory: () => request('/inventory'),
  restockInventory: (blood_group) =>
    request('/inventory/restock', { method: 'PUT', body: JSON.stringify({ blood_group }) }),

  // Requests
  getRequests: () => request('/requests'),
  createRequest: (hospital, group, units, urgency) =>
    request('/requests', { method: 'POST', body: JSON.stringify({ hospital, group, units, urgency }) }),
  decideRequest: (id, decision) =>
    request(`/requests/${id}/decide`, { method: 'PUT', body: JSON.stringify({ decision }) }),
  completeRequest: (id) =>
    request(`/requests/${id}/complete`, { method: 'PUT' }),
  dispatchDrone: (id) =>
    request(`/requests/${id}/drone`, { method: 'PUT' }),

  // Donors
  getDonors: () => request('/donors'),
  addDonor: (donorData) =>
    request('/donors', { method: 'POST', body: JSON.stringify(donorData) }),
  updateDonorLocation: (id, lat, lng) =>
    request(`/donors/${id}/location`, { method: 'PUT', body: JSON.stringify({ lat, lng }) }),
  updateDonorProfile: (id, profileData) =>
    request(`/donors/${id}/profile`, { method: 'PUT', body: JSON.stringify(profileData) }),
  updateDonorPicture: (id, profilePic) =>
    request(`/donors/${id}/picture`, { method: 'PUT', body: JSON.stringify({ profilePic }) }),
  logDonation: (id, date) =>
    request(`/donors/${id}/log-donation`, { method: 'POST', body: JSON.stringify({ date }) }),
  getDonorHistory: (id) => request(`/donors/${id}/history`),

  // Notifications
  getNotifications: () => request('/notifications'),
  respondNotification: (id, responded) =>
    request(`/notifications/${id}/respond`, { method: 'PUT', body: JSON.stringify({ responded }) }),
  notifyCritical: (groups) =>
    request('/notifications/critical-alert', { method: 'POST', body: JSON.stringify({ groups }) }),

  // Hospitals & Crisis
  getHospitalProfile: (name) => request(`/hospitals/profile/${encodeURIComponent(name)}`),
  updateHospitalProfile: (payload) =>
    request('/hospitals/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  getCrisis: () => request('/crisis'),
  toggleCrisis: (active) =>
    request('/crisis/toggle', { method: 'POST', body: JSON.stringify({ active }) }),
};
