import apiClient from './apiClient';

// =================================================================
// Auth API — Các hàm gọi endpoint xác thực
// =================================================================

/**
 * POST /api/auth/register — Đăng ký tài khoản mới.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<Object>} { success, message, data: { user, token } }
 */
export const register = (payload) =>
  apiClient.post('/auth/register', payload).then((res) => res.data);

/**
 * POST /api/auth/login — Đăng nhập.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<Object>} { success, message, data: { user, token } }
 */
export const login = (payload) =>
  apiClient.post('/auth/login', payload).then((res) => res.data);

/**
 * GET /api/auth/me — Lấy thông tin user hiện tại (cần token).
 * @returns {Promise<Object>} { success, data: user }
 */
export const getMe = () =>
  apiClient.get('/auth/me').then((res) => res.data);
