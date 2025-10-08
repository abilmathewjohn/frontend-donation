import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    contactPhone: '+3XXXXXXXXX',
    ticketPrice: 2.00,
    adminEmail: 'admin@example.com'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    
    try {
      await axios.put(`${API_URL}/admin/settings`, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="+3XXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-2">
                  This number will be displayed to users for support inquiries
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ticket Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={settings.ticketPrice}
                  onChange={(e) => handleChange('ticketPrice', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Price per ticket in Euros. This affects new donations only.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Email address for system notifications and admin communications
                </p>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>

              {saved && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  Settings saved successfully!
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800">Important Notes</h3>
            </div>
            <ul className="text-sm text-yellow-700 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Changes to ticket price affect new donations only
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Contact phone is displayed on the donation form
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Admin email is used for system notifications
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Settings are applied immediately after saving
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={fetchSettings}
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition duration-200 font-semibold text-sm"
              >
                ↻ Refresh Settings
              </button>
              <button
                onClick={() => window.open('/api/health', '_blank')}
                className="w-full bg-white text-green-600 py-3 px-4 rounded-lg border border-green-200 hover:bg-green-50 transition duration-200 font-semibold text-sm"
              >
                🏥 System Health
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;