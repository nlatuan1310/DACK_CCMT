import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Board from './pages/Board';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<Board />} />
          <Route path="/dashboard" element={<h1 className="text-2xl font-semibold">Dashboard</h1>} />
          <Route path="/backlog" element={<h1 className="text-2xl font-semibold">Backlog</h1>} />
          <Route path="/issues" element={<h1 className="text-2xl font-semibold">Issues</h1>} />
          <Route path="/settings" element={<h1 className="text-2xl font-semibold">Project Settings</h1>} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
