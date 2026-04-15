import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectsDashboard from './pages/ProjectsDashboard';
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
          element={
            <ProtectedRoute>
              <Layout onIssueCreated={handleIssueCreated} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsDashboard />} />
          <Route path="/projects/:projectId/board" element={<Board refreshKey={boardRefreshKey} />} />
          <Route path="/projects/:projectId/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}

export default App;
