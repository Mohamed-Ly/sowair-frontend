import api from "../../../services/api/api";

export const supplierApi = {
  // الحصول على جميع الموردين
  getAllSuppliers: (params) => api.get("/suppliers", { params }),

  // الحصول على مورد محدد (مع منتجاته)
  getSupplier: (id) => api.get(`/suppliers/${id}`),

  // إنشاء مورد جديد
  createSupplier: (data) => api.post("/suppliers", data),

  // تحديث مورد
  updateSupplier: (id, data) => api.patch(`/suppliers/${id}`, data),

  // حذف مورد
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),

  // عدد الموردين
  countSuppliers: (params) => api.get("/suppliers/count", { params }),
};

export default supplierApi;
