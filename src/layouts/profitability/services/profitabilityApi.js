import api from "../../../services/api/api";

export const profitabilityApi = {
  // تقرير صافي الربح (على الطلبات المسلّمة فقط)
  getProfit: (params) => api.get("/reports/profit", { params }),

  // تقرير قيمة المخزون بسعر الشراء
  getInventoryValue: () => api.get("/reports/inventory-value"),
};

export default profitabilityApi;
