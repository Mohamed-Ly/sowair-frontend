// services/reportsApi.js
import api from "../../../services/api/api";

export const reportsApi = {
  getSummary: (params) => api.get("/reports/summary", { params }),
  getProducts: (params) => api.get("/reports/products", { params }),
  exportReport: (params) => api.get("/reports/export", { params, responseType: "blob" }),
};

export default reportsApi;
