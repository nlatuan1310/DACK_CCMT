import axios from 'axios';

/**
 * Axios instance dùng chung cho toàn bộ frontend.
 * BaseURL trỏ về backend Express đang chạy cổng 5000.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây
});

// ── Request Interceptor ────────────────────────────────────────
// Tự động gắn JWT Bearer token vào header Authorization
// cho mọi request gửi xuống Backend.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dack_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────
// Xử lý lỗi chung: trích xuất message + redirect /login khi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token hết hạn hoặc không hợp lệ → xóa auth + redirect login
    if (status === 401) {
      localStorage.removeItem('dack_auth_token');
      localStorage.removeItem('dack_auth_user');

      // Chỉ redirect nếu chưa ở trang login (tránh vòng lặp)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi không xác định';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

