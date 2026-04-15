import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

// ── Context ─────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── localStorage keys ───────────────────────────────────────────
const STORAGE_KEY_TOKEN = 'dack_auth_token';
const STORAGE_KEY_USER  = 'dack_auth_user';

// =================================================================
// AuthProvider — Bọc quanh App để cung cấp state { user, token }
// =================================================================
/**
 * Quản lý toàn bộ trạng thái xác thực:
 *  - Lưu token + user vào localStorage (persist qua F5 refresh)
 *  - Cung cấp hàm login / logout cho các component con
 *  - Tự động kiểm tra token hợp lệ khi mount (gọi /api/auth/me)
 */
export function AuthProvider({ children }) {
  // Khởi tạo state từ localStorage (nếu có)
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN));
  const [user, setUser]   = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // ── Login: lưu token + user vào state + localStorage ──────────
  const login = useCallback((userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
  }, []);

  // ── Logout: xóa sạch state + localStorage ────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }, []);

  // ── Kiểm tra token khi mount (refresh F5) ────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Gọi /api/auth/me để xác minh token còn hợp lệ
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Cập nhật user mới nhất từ server
        const freshUser = res.data.data;
        setUser(freshUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(freshUser));
      } catch (error) {
        // Token hết hạn hoặc không hợp lệ → logout
        console.warn('Token không hợp lệ, tự động đăng xuất:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // ── Context value ─────────────────────────────────────────────
  const value = {
    user,
    token,
    loading,           // true khi đang verify token lúc mount
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =================================================================
// useAuth — Custom hook để truy cập AuthContext
// =================================================================
/**
 * Sử dụng:
 *   const { user, token, login, logout, isAuthenticated, loading } = useAuth();
 *
 * ⚠️ Phải dùng bên trong <AuthProvider>.
 */
/* eslint-disable react-refresh/only-export-components */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth() phải được sử dụng bên trong <AuthProvider>.');
  }

  return context;
}

export default AuthContext;
