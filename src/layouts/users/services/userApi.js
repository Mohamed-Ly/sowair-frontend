// services/userApi.js
import api from "../../../services/api/api";

export const userApi = {
  // الأدمن: الحصول على جميع المستخدمين
  getAllUsers: (params) => api.get("/users", { params }),

  // الأدمن: إحصائيات المستخدمين
  getUsersCount: () => api.get("/users/count"),

  // الأدمن: تفاصيل مستخدم
  getUserDetails: (userId) => api.get(`/users/${userId}`),

  // تحديث بيانات المستخدم
  updateUser: (userId, data) => api.put(`/users/profile/${userId}`, data),

  // حذف مستخدم (للمستخدم العادي)
  deleteUserProfile: (userId) => api.delete(`/users/profile/${userId}`),

  // حذف مستخدم (للأدمن)
  deleteUserAdmin: (userId) => api.delete(`/users/admin/${userId}`),

  // تغيير دور مستخدم (للأدمن)
  changeUserRole: (userId, role) => api.patch(`/users/admin/${userId}/role`, { role }),
};

export default userApi;
