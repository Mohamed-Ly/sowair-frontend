import axios from "axios";
import jsCookie from "js-cookie";
import { store } from "../../store/store";
import { logout } from "../../store/slices/authSlice";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// جعل baseURL عاماً لجميع الـ APIs
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

// Interceptor لإضافة التوكن تلقائياً
api.interceptors.request.use((config) => {
  const token = jsCookie.get("accessToken");
  console.log("🔑 Sending request with token:", token ? "Yes" : "No");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("🚨 API Error:", {
      status: error.response?.status,
      url: originalRequest.url,
      message: error.response?.data?.message,
    });

    // إذا كان الخطأ 401 أو 403 (مشكلة في التوكن) ولم نكن في حالة retry
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      // إذا كان هذا طلب login أو refresh، ارفض مباشرة
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // إذا لم تكن هناك عملية تجديد جارية، ابدأ واحدة
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshToken = jsCookie.get("refreshToken");
            console.log("🔄 Attempting token refresh...");

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              { refreshToken },
              {
                headers: { "Content-Type": "application/json" },
                timeout: 10000,
              }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // تحديث التوكنات
            jsCookie.set("accessToken", accessToken, { expires: 1 });
            jsCookie.set("refreshToken", newRefreshToken, { expires: 7 });

            // تحديث الـ store
            store.dispatch({
              type: "auth/setCredentials",
              payload: {
                accessToken,
                refreshToken: newRefreshToken,
                user: store.getState().auth.user,
              },
            });

            console.log("✅ Token refresh successful");
            return accessToken;
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);

            // تنظيف البيانات
            store.dispatch(logout());
            jsCookie.remove("accessToken");
            jsCookie.remove("refreshToken");
            localStorage.removeItem("user");

            // إعادة توجيه لصفحة login
            window.location.href = "/authentication/sign-in";

            throw refreshError;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      // انتظر اكتمال عملية التجديد
      try {
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log("🔄 Retrying original request with new token");
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
