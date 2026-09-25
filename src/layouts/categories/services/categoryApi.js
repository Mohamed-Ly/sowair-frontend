import api from "../../../services/api/api";

// يبني FormData عندما يكون هناك ملف صورة، وإلا يرسل JSON عادي
export function categorySubmitData(data) {
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

export const categoryApi = {
  // الحصول على جميع التصنيفات
  getAllCategories: (params) => api.get("/categories", { params }),

  // الحصول على تصنيف محدد
  getCategory: (id) => api.get(`/categories/${id}`),

  // إنشاء تصنيف جديد
  createCategory: (data) => api.post("/categories", categorySubmitData(data)),

  // تحديث تصنيف
  updateCategory: (id, data) => api.patch(`/categories/${id}`, categorySubmitData(data)),

  // حذف تصنيف
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // عدد التصنيفات
  countCategories: (params) => api.get("/categories/count", { params }),
};

export default categoryApi;
