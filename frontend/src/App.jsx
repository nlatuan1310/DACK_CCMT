import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Board from './pages/Board';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import './App.css';

function App() {
  // Tăng key này để trigger Board re-fetch sau khi tạo issue thành công
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const handleIssueCreated = useCallback(() => {
    setBoardRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <Router>
      <Routes>
        {/* ── Public Routes (không cần đăng nhập) ──────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Routes (trong Layout có Sidebar + Header) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout onIssueCreated={handleIssueCreated}>
                <Routes>
                  <Route path="/" element={<Navigate to="/board" replace />} />
                  <Route path="/board" element={<Board refreshKey={boardRefreshKey} />} />
                  <Route path="/settings"  element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}

export default App;
