import api from "../../../services/api/api";

// يبني FormData عندما يكون هناك ملف صورة، وإلا يرسل JSON عادي
export function brandSubmitData(data) {
  const hasFile = data.image && data.image instanceof File;
  if (!hasFile) return data;

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === "image" && data[key] instanceof File) return;
    if (data[key] !== null && data[key] !== undefined) formData.append(key, data[key]);
  });
  formData.append("image", data.image);
  return formData;
}

export const brandApi = {
  // الحصول على جميع الماركات
  getAllBrands: (params) => api.get("/brands", { params }),

  // الحصول على ماركة محددة
  getBrand: (id) => api.get(`/brands/${id}`),

  // إنشاء ماركة جديدة
  createBrand: (data) => api.post("/brands", brandSubmitData(data)),

  // تحديث ماركة
  updateBrand: (id, data) => api.patch(`/brands/${id}`, brandSubmitData(data)),

  // حذف ماركة
  deleteBrand: (id) => api.delete(`/brands/${id}`),

  // عدد الماركات
  countBrands: (params) => api.get("/brands/count", { params }),
};

export default brandApi;
