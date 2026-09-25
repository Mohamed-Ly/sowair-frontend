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

// الـ axios instance ي带头 application/json بشكل افتراضي، ولو بقي 헤nder كذا
// هيحوّل الـ FormData كلها لـ JSON والملف بيبقى {} والباك اند بيقع.
// لازم نحدّد multipart/form-data وقت وجود ملف.
const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };
const submitConfig = (data) => (data.image instanceof File ? multipartConfig : undefined);

export const categoryApi = {
  // الحصول على جميع التصنيفات
  getAllCategories: (params) => api.get("/categories", { params }),

  // الحصول على تصنيف محدد
  getCategory: (id) => api.get(`/categories/${id}`),

  // إنشاء تصنيف جديد
  createCategory: (data) =>
    api.post("/categories", categorySubmitData(data), submitConfig(data)),

  // تحديث تصنيف
  updateCategory: (id, data) =>
    api.patch(`/categories/${id}`, categorySubmitData(data), submitConfig(data)),

  // حذف تصنيف
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // عدد التصنيفات
  countCategories: (params) => api.get("/categories/count", { params }),
};

export default categoryApi;
