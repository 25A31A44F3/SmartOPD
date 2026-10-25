/**
 * API Service for SmartOPD
 * Handles communication with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function handleResponse(response) {
  if (!response.ok) {
    let errMessage = "Server error occurred";
    try {
      const errData = await response.json();
      errMessage = errData.detail || errData.message || JSON.stringify(errData);
    } catch (e) {
      errMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errMessage);
  }
  return await response.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async assessTriage(payload) {
    const res = await fetch(`${API_BASE}/triage/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async registerPatient(payload) {
    const res = await fetch(`${API_BASE}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getPatients(filters = {}) {
    const query = new URLSearchParams();
    if (filters.q) query.append("q", filters.q);
    if (filters.department) query.append("department", filters.department);
    if (filters.priority) query.append("priority", filters.priority);
    if (filters.status) query.append("status", filters.status);
    
    const res = await fetch(`${API_BASE}/patients?${query.toString()}`);
    return handleResponse(res);
  },

  async getPatient(id) {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    return handleResponse(res);
  },

  async getQueue(filters = {}) {
    const query = new URLSearchParams();
    if (filters.department) query.append("department", filters.department);
    if (filters.include_completed) query.append("include_completed", "true");

    const res = await fetch(`${API_BASE}/queue?${query.toString()}`);
    return handleResponse(res);
  },

  async overridePriority(patientId, payload) {
    const res = await fetch(`${API_BASE}/queue/${patientId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updatePatientStatus(patientId, payload) {
    const res = await fetch(`${API_BASE}/queue/${patientId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return handleResponse(res);
  },

  async resetSeedData() {
    const res = await fetch(`${API_BASE}/reset-seed`, {
      method: "POST"
    });
    return handleResponse(res);
  }
};
