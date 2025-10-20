// components/EmailManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, Filter, Download, RefreshCw, Share2, Copy, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

const EmailManagement = () => {
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resendingId, setResendingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/emails?limit=1000`);
      setEmailLogs(response.data.rows || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      showToast('Failed to load email logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    // Use your existing toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border-l-4 ${
      type === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
      type === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
      'bg-blue-50 border-blue-500 text-blue-700'
    } animate-slide-in`;
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-lg">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div>
          <p class="font-semibold">${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 4000);
  };

  const resendEmail = async (emailLogId) => {
    setResendingId(emailLogId);
    try {
      const response = await axios.post(`${API_URL}/admin/emails/${emailLogId}/resend`);
      if (response.data.success) {
        showToast('Email resent successfully!', 'success');
        fetchEmailLogs(); // Refresh the list
      } else {
        showToast(`Failed to resend email: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      showToast('Error resending email', 'error');
    } finally {
      setResendingId(null);
    }
  };

  const exportEmails = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/emails/export`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `email-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Email logs exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting email logs:', error);
      showToast('Error exporting email logs', 'error');
    }
  };

  const getShareContent = async (emailLogId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/emails/${emailLogId}/share-content`);
      return response.data;
    } catch (error) {
      console.error('Error getting share content:', error);
      showToast('Error generating share content', 'error');
      return null;
    }
  };

  const copyToClipboard = async (emailLogId) => {
    const content = await getShareContent(emailLogId);
    if (!content) return;

    const text = content.generic.text;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(emailLogId);
      showToast('Content copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Error copying to clipboard', 'error');
    }
  };

  const shareViaWhatsApp = async (emailLogId) => {
    const content = await getShareContent(emailLogId);
    if (!content) return;

    const whatsappText = encodeURIComponent(content.whatsapp.text);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Sent',
        icon: <CheckCircle className="w-3 h-3" />
      },
      failed: {
        color: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Failed',
        icon: <XCircle className="w-3 h-3" />
      }
    };
    const config = statusConfig[status] || statusConfig.sent;
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  // Filter email logs
  const filteredEmailLogs = emailLogs.filter((log) => {
    const matchesSearch =
      log.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.teamId?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading email logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">
              Email Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Track and manage all sent confirmation emails
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportEmails}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export to CSV
            </button>
            <button
              onClick={fetchEmailLogs}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{emailLogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Successful</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {emailLogs.filter(e => e.status === 'sent').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Failed</p>
                <p className="text-3xl font-bold text-rose-600 mt-2">
                  {emailLogs.filter(e => e.status === 'failed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Emails
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or team ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team & Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmailLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-blue-50/30 transition-all duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-semibold text-gray-900 truncate">
                            {log.recipientName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {log.recipientEmail}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Teammate: {log.donation?.teammateName || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base font-semibold text-blue-600 font-mono">
                        {log.teamId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                      {log.errorMessage && (
                        <div className="text-xs text-rose-600 mt-1 max-w-xs truncate">
                          {log.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(log.sentAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.sentAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => resendEmail(log.id)}
                          disabled={resendingId === log.id}
                          className={`flex items-center gap-2 font-semibold text-sm transition-all duration-200 ${
                            resendingId === log.id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-800 hover:scale-105'
                          }`}
                        >
                          {resendingId === log.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {resendingId === log.id ? 'Sending...' : 'Resend'}
                        </button>

                        <button
                          onClick={() => copyToClipboard(log.id)}
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-all duration-200 hover:scale-105"
                        >
                          {copiedId === log.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedId === log.id ? 'Copied!' : 'Copy'}
                        </button>

                        <button
                          onClick={() => shareViaWhatsApp(log.id)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold text-sm transition-all duration-200 hover:scale-105"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmailLogs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">No email logs found</p>
              {(searchTerm || statusFilter !== 'all') && (
                <p className="text-gray-400 mt-2">
                  Try adjusting your search criteria or filters
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;