import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentLinksManagement = () => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    isActive: true
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-links`);
      setPaymentLinks(response.data);
    } catch (error) {
      console.error('Error fetching payment links:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await axios.put(`${API_URL}/payment-links/${editingLink.id}`, formData);
      } else {
        await axios.post(`${API_URL}/payment-links`, formData);
      }
      await fetchPaymentLinks();
      resetForm();
      alert(`Payment link ${editingLink ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving payment link:', error);
      alert('Error saving payment link: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment link?')) {
      try {
        await axios.delete(`${API_URL}/payment-links/${id}`);
        await fetchPaymentLinks();
        alert('Payment link deleted successfully!');
      } catch (error) {
        console.error('Error deleting payment link:', error);
        alert('Error deleting payment link');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', url: '', isActive: true });
    setEditingLink(null);
    setShowForm(false);
  };

  const editLink = (link) => {
    setFormData({
      name: link.name,
      url: link.url,
      isActive: link.isActive
    });
    setEditingLink(link);
    setShowForm(true);
  };

  const toggleLinkStatus = async (link) => {
    try {
      await axios.put(`${API_URL}/payment-links/${link.id}`, {
        ...link,
        isActive: !link.isActive
      });
      await fetchPaymentLinks();
      alert(`Payment link ${!link.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating payment link status:', error);
      alert('Error updating payment link status');
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Payment Links Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          + Add New Link
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingLink ? 'Edit Payment Link' : 'Add New Payment Link'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="e.g., Revolut Payment Link, PayPal, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="https://revolut.com/pay/..."
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                Active (visible to users)
              </label>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl font-semibold transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition duration-200"
              >
                {editingLink ? 'Update' : 'Create'} Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {paymentLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-gray-500 text-lg">No payment links found</p>
            <p className="text-gray-400">Create your first payment link to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentLinks.map((link) => (
              <div key={link.id} className="p-6 hover:bg-gray-50 transition duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${link.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          link.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 break-all mt-1">{link.url}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Created: {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleLinkStatus(link)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition duration-200 ${
                        link.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {link.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => editLink(link)}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-semibold text-sm transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold text-sm transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentLinksManagement;