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
// (Mở rộng sau: thêm Authorization token tại đây)
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────
// Trích xuất thẳng phần `data` từ response của backend  
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi không xác định';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
