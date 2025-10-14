import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DonationForm from './components/DonationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Routes>
          {/* Public Route - Donation Form */}
          <Route path="/" element={<DonationForm />} />
          
          {/* Admin Login Route */}
          <Route 
            path="/admin/login" 
            element={
              !isAuthenticated ? (
                <div className="min-h-screen flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
                    <AdminLogin onLogin={handleLogin} />
                  </div>
                </div>
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } 
          />
          
          {/* Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Floating Admin Access Button - Only show on home page */}
   

      </div>
    </Router>
  );
}

export default App;