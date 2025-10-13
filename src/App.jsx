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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!isAuthenticated ? (
        <div className="relative">
          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <DonationForm />
          </div>
          
          {/* Floating Admin Access Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsAdmin(true)}
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold shadow-lg hover:scale-105 transform flex items-center gap-2 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin
            </button>
          </div>

          {/* Admin Login Modal */}
          {isAdmin && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200">
                <button
                  onClick={() => setIsAdmin(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <AdminLogin onLogin={handleLogin} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;