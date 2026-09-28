import api from "../../../services/api/api";

export const locationApi = {
  // ============ المدن ============
  getCities: (params) => api.get("/admin/locations/cities", { params }),
  getCity: (id) => api.get(`/admin/locations/cities/${id}`),
  createCity: (data) => api.post("/admin/locations/cities", data),
  updateCity: (id, data) => api.patch(`/admin/locations/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/locations/cities/${id}`),

  // ============ المناطق ============
  getAreas: (params) => api.get("/admin/locations/areas", { params }),
  createArea: (data) => api.post("/admin/locations/areas", data),
  updateArea: (id, data) => api.patch(`/admin/locations/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/admin/locations/areas/${id}`),
};

export default locationApi;
