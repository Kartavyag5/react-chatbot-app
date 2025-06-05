import axios from "axios";

const API_BASE = "https://piri.prakashinfotech.com/"; // Adjust if needed for dev/prod

export const submitContactForm = async (data: { message: string }) => {
  try {
    const res = await axios.post(`${API_BASE}contact_form`, data);
    return res.status === 200;
  } catch {
    return false;
  }
};

export const submitProject = async (data: { details: string }) => {
  try {
    const res = await axios.post(`${API_BASE}submit_project`, data);
    return res.status === 200;
  } catch {
    return false;
  }
};

export const submitInquiry = async (data: { inquiry: string }) => {
  try {
    const res = await axios.post(`${API_BASE}submit_inquiry`, data);
    return res.status === 200;
  } catch {
    return false;
  }
};

export const submitService = async (data: { service: string }) => {
  try {
    const res = await axios.post(`${API_BASE}submit_service`, data);
    return res.status === 200;
  } catch {
    return false;
  }
};
