import React, { useState, useEffect } from 'react';
import DonationForm from './components/DonationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isAuthenticated ? (
        <div>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Support Our Cause 🎗️
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Make a difference by purchasing tickets. Every contribution helps us achieve our mission and create positive change in our community.
              </p>
            </div>
            <DonationForm />
          </div>
          
          {/* Admin Access Button */}
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setIsAdmin(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition duration-200 shadow-lg"
            >
              Admin Access
            </button>
          </div>

          {/* Admin Login Modal */}
          {isAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full">
                <AdminLogin onLogin={handleLogin} />
                <button
                  onClick={() => setIsAdmin(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;