import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Link, 
  ToggleLeft, 
  ToggleRight, 
  Calendar,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PaymentLinksManagement = () => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
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
      setLoading(true);
      const response = await axios.get(`${API_URL}/payment-links`);
      setPaymentLinks(response.data);
    } catch (error) {
      console.error('Error fetching payment links:', error);
      showToast('Failed to load payment links', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border-l-4 ${
      type === "success" ? "bg-green-50 border-green-500 text-green-700" :
      type === "error" ? "bg-red-50 border-red-500 text-red-700" :
      "bg-blue-50 border-blue-500 text-blue-700"
    } animate-slide-in`;
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-lg">
          ${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
        </div>
        <div>
          <p class="font-semibold">${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("animate-slide-out");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (editingLink) {
        await axios.put(`${API_URL}/payment-links/${editingLink.id}`, formData);
        showToast('Payment link updated successfully!', 'success');
      } else {
        await axios.post(`${API_URL}/payment-links`, formData);
        showToast('Payment link created successfully!', 'success');
      }
      await fetchPaymentLinks();
      resetForm();
    } catch (error) {
      console.error('Error saving payment link:', error);
      showToast('Error saving payment link: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment link? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/payment-links/${id}`);
      await fetchPaymentLinks();
      showToast('Payment link deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting payment link:', error);
      showToast('Error deleting payment link', 'error');
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
      showToast(`Payment link ${!link.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating payment link status:', error);
      showToast('Error updating payment link status', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('URL copied to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      {/* Toast Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slideOut 0.3s ease-in;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent flex items-center gap-3">
              <Link className="w-8 h-8 text-purple-600" />
              Payment Links Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage payment methods for team registrations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchPaymentLinks}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add New Link
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Links</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{paymentLinks.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Link className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {paymentLinks.filter(link => link.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <ToggleRight className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Inactive</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {paymentLinks.filter(link => !link.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <ToggleLeft className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  {editingLink ? 'Edit Payment Link' : 'Add New Payment Link'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-white/80 hover:text-white text-2xl transition-colors duration-200 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Link Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                    placeholder="e.g., Revolut Payment, PayPal, Bank Transfer..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Payment URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                    placeholder="https://revolut.com/pay/..."
                  />
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Users will be redirected to this URL for payment
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className={`relative inline-flex items-center cursor-pointer ${formData.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="sr-only"
                    />
                    <div 
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    >
                      <div 
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                          formData.isActive ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </div>
                  </div>
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Active (visible to users)
                  </label>
                  {formData.isActive ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={formLoading}
                    className="px-8 py-3.5 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200 hover:border-gray-400 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {formLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {formLoading ? 'Saving...' : (editingLink ? 'Update Link' : 'Create Link')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Loading payment links...</p>
              </div>
            </div>
          ) : paymentLinks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">No payment links found</p>
              <p className="text-gray-400 mt-2">Create your first payment link to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold"
              >
                + Add Payment Link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paymentLinks.map((link) => (
                <div key={link.id} className="p-6 hover:bg-gray-50/50 transition-all duration-150 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        link.isActive ? 'bg-emerald-400' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            link.isActive 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-gray-50 text-gray-800 border border-gray-200'
                          }`}>
                            {link.isActive ? (
                              <><CheckCircle className="w-3 h-3" /> Active</>
                            ) : (
                              <><EyeOff className="w-3 h-3" /> Inactive</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <p 
                            className="text-gray-600 break-all cursor-pointer hover:text-blue-600 transition-colors duration-200 flex-1"
                            onClick={() => copyToClipboard(link.url)}
                            title="Click to copy URL"
                          >
                            {link.url}
                          </p>
                          <button
                            onClick={() => copyToClipboard(link.url)}
                            className="opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-600 p-1.5 rounded-lg hover:bg-blue-200 transition-all duration-200"
                            title="Copy URL"
                          >
                            <Link className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(link.createdAt).toLocaleDateString()}
                          </div>
                          {link.updatedAt !== link.createdAt && (
                            <div className="flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Updated: {new Date(link.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLinkStatus(link)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          link.isActive
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {link.isActive ? (
                          <><ToggleLeft className="w-4 h-4" /> Deactivate</>
                        ) : (
                          <><ToggleRight className="w-4 h-4" /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => editLink(link)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 font-semibold text-sm transition-all duration-200 border border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-800 rounded-xl hover:bg-red-100 font-semibold text-sm transition-all duration-200 border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default PaymentLinksManagement;