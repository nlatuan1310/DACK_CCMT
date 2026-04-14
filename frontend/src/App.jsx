import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">Board</h1>
              <p className="text-gray-600">This is the board page. Epic 3 features go here.</p>
            </div>
          } />
          <Route path="/dashboard" element={<h1 className="text-2xl font-semibold">Dashboard</h1>} />
          <Route path="/backlog" element={<h1 className="text-2xl font-semibold">Backlog</h1>} />
          <Route path="/issues" element={<h1 className="text-2xl font-semibold">Issues</h1>} />
          <Route path="/settings" element={<h1 className="text-2xl font-semibold">Project Settings</h1>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
