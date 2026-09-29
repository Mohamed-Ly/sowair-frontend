import api from "../../../services/api/api";

export const walletApi = {
  // كل المندوبين مع ملخص المحفظة (للأدمن)
  getAdminWallets: () => api.get("/admin/wallets"),

  // سجل حركات مندوب محدد
  getCourierTransactions: (courierId) => api.get(`/admin/wallets/${courierId}/transactions`),

  // صرف رصيد يدوي
  settleWallet: (courierId, data) => api.post(`/admin/wallets/${courierId}/settle`, data),

  // تصحيح يدوي (±)
  adjustWallet: (courierId, data) => api.post(`/admin/wallets/${courierId}/adjust`, data),
};

export default walletApi;
