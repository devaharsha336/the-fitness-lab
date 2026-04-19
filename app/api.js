import axios from 'axios';
import { getAccessToken } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function authConfig() {
  const token = getAccessToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export const api = {
  // Members
  getMembers: () => axios.get(`${API}/members`, authConfig()),
  createMember: (data) => axios.post(`${API}/members`, data, authConfig()),
  updateMember: (id, data) => axios.put(`${API}/members/${id}`, data, authConfig()),
  deleteMember: (id) => axios.delete(`${API}/members/${id}`, authConfig()),

  // Classes
  getClasses: () => axios.get(`${API}/classes`, authConfig()),
  createClass: (data) => axios.post(`${API}/classes`, data, authConfig()),
  deleteClass: (id) => axios.delete(`${API}/classes/${id}`, authConfig()),

  // Stats
  getStats: () => axios.get(`${API}/stats`, authConfig()),

  // Announcements
  getAnnouncements: () => axios.get(`${API}/announcements`, authConfig()),
  createAnnouncement: (data) => axios.post(`${API}/announcements`, data, authConfig()),
  deleteAnnouncement: (id) => axios.delete(`${API}/announcements/${id}`, authConfig()),

  // Enquiries (public)
  submitEnquiry: (data) => axios.post(`${API}/enquiries`, data),
  getEnquiries: () => axios.get(`${API}/enquiries`, authConfig()),

  // Pricing
  getPricing: () => axios.get(`${API}/pricing`),
  updatePricing: (plans) => axios.put(`${API}/pricing`, plans, authConfig()),

  // Programs
  getPrograms: () => axios.get(`${API}/programs`),
  updatePrograms: (programs) => axios.put(`${API}/programs`, programs, authConfig()),

  // Auth
  changePassword: (data) => axios.post(`${API}/auth/change-password`, data, authConfig()),
};
