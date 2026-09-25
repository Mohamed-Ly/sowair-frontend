// import api from "./api";
import axios from "axios";

const API_URL = "http://localhost:5000";
// const API_URL = "https://perfume-project-production-b4c5.up.railway.app";

export const authService = {
  login: async ({ identifier, password }) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      identifier,
      password,
    });
    return response.data;
  },

  logoutAll: async () => {
    const response = await axios.post(`${API_URL}/api/auth/logout-all`);
    return response.data;
  },

  refreshTokens: async ({ refreshToken }) => {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
    return response.data;
  },
};
