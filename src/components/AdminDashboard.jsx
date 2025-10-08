import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DonationManagement from './DonationManagement';
import PaymentLinksManagement from './PaymentLinksManagement';
import SettingsManagement from './SettingsManagement';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('donations');
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingDonations: 0,
    confirmedDonations: 0,
    totalAmount: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [donationsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/donations?limit=1000`)
      ]);

      const donations = donationsRes.data.rows || [];
      const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);
      const confirmedAmount = donations
        .filter(d => d.status === 'confirmed')
        .reduce((sum, donation) => sum + parseFloat(donation.actualAmount || donation.amount || 0), 0);
      
      setStats({
        totalDonations: donations.length,
        pendingDonations: donations.filter(d => d.status === 'pending').length,
        confirmedDonations: donations.filter(d => d.status === 'confirmed').length,
        totalAmount: confirmedAmount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'donations', name: 'Donations', icon: '💰', color: 'blue' },
    { id: 'payment-links', name: 'Payment Links', icon: '🔗', color: 'green' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: 'purple' }
  ];

  const getStatColor = (index) => {
    const colors = ['blue', 'green', 'yellow', 'purple'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage donations and system settings</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Donations', value: stats.totalDonations, icon: '💰' },
            { label: 'Pending', value: stats.pendingDonations, icon: '⏳' },
            { label: 'Confirmed', value: stats.confirmedDonations, icon: '✅' },
            { label: 'Total Amount', value: `€${stats.totalAmount.toFixed(2)}`, icon: '💶' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-${getStatColor(index)}-100`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 py-4 px-6 text-center border-b-2 font-semibold text-sm transition duration-200 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'donations' && <DonationManagement onUpdate={fetchStats} />}
            {activeTab === 'payment-links' && <PaymentLinksManagement />}
            {activeTab === 'settings' && <SettingsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;