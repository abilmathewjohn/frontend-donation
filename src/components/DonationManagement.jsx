import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Download, RefreshCw, Edit, Eye, Trash2, X, User, Mail, Phone, Calendar, Euro, Shield, CheckCircle, XCircle, Clock } from "lucide-react";

const DonationManagement = ({ onUpdate }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    actualAmount: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/donations?limit=1000`);
      setDonations(response.data.rows || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      showToast("Failed to load registrations. Please check if the server is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "info") => {
    // You can replace this with your preferred toast notification system
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

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(donationId);
    try {
      await axios.delete(`${API_URL}/admin/donations/${donationId}`);
      await fetchDonations();
      onUpdate();
      showToast("Registration deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting registration:", error);
      showToast("Error deleting registration. Please try again.", "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const updateDonationStatus = async (donationId) => {
    setUpdatingId(donationId);
    
    try {
      const payload = {
        ...statusUpdate,
        actualAmount: parseFloat(statusUpdate.actualAmount) || 0,
      };

      console.log('⚡ Quick status update started');

      // INSTANT Team ID generation on frontend for immediate display
      if (statusUpdate.status === 'confirmed') {
        const instantTeamId = Math.floor(100000 + Math.random() * 900000).toString();
        
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation.id === donationId 
              ? { 
                  ...donation, 
                  status: 'confirmed',
                  teamId: instantTeamId,
                  actualAmount: payload.actualAmount
                }
              : donation
          )
        );
      }

      // Quick API call with timeout
      const response = await axios.patch(
        `${API_URL}/admin/donations/${donationId}/status`,
        payload,
        { timeout: 5000 }
      );

      console.log('✅ Backend response received');

      // Update with server data
      if (response.data.donation) {
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation.id === donationId 
              ? { ...donation, ...response.data.donation }
              : donation
          )
        );
      }

      setSelectedDonation(null);
      setStatusUpdate({ status: "", actualAmount: "" });
      
      showToast(`Status updated successfully! Team ID: ${response.data.donation?.teamId || 'Generated'}`, "success");
      
    } catch (error) {
      console.error("Update error:", error);
      
      // Revert on error
      if (statusUpdate.status === 'confirmed') {
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation.id === donationId 
              ? { 
                  ...donation, 
                  status: selectedDonation?.status || 'pending',
                  teamId: selectedDonation?.teamId || null
                }
              : donation
          )
        );
      }
      
      showToast("Update failed: " + (error.response?.data?.error || error.message), "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const openStatusModal = (donation) => {
    const actualAmount = parseFloat(donation.actualAmount || donation.amount) || 0;

    setSelectedDonation(donation);
    setStatusUpdate({
      status: donation.status,
      actualAmount: actualAmount.toString(),
    });
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/donations/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `registrations-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Export completed successfully!", "success");
    } catch (error) {
      console.error("Error exporting registrations:", error);
      showToast("Error exporting registrations", "error");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Pending",
        icon: <Clock className="w-3 h-3" />
      },
      confirmed: {
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        label: "Confirmed",
        icon: <CheckCircle className="w-3 h-3" />
      },
      rejected: {
        color: "bg-rose-50 text-rose-800 border-rose-200",
        label: "Rejected",
        icon: <XCircle className="w-3 h-3" />
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const openScreenshotModal = (screenshotUrl, donation) => {
    setSelectedScreenshot({
      url: screenshotUrl,
      donation: donation
    });
  };

  const downloadScreenshot = async () => {
    if (!selectedScreenshot) return;

    try {
      const response = await fetch(selectedScreenshot.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const filename = `payment-${selectedScreenshot.donation.participantName}-${selectedScreenshot.donation.id}.jpg`;
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Screenshot downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading screenshot:", error);
      showToast("Error downloading screenshot", "error");
    }
  };

  // Filter registrations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.contactNumber1?.includes(searchTerm) ||
      donation.teamId?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || donation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6">
      {/* Toast Container */}
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
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
              Team Registration Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and track all team registration requests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
            <button
              onClick={fetchDonations}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Registrations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{donations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {donations.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Confirmed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {donations.filter(d => d.status === 'confirmed').length}
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
                <p className="text-gray-600 text-sm font-semibold">Rejected</p>
                <p className="text-3xl font-bold text-rose-600 mt-2">
                  {donations.filter(d => d.status === 'rejected').length}
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
                Search Registrations
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or team ID..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="hover:bg-blue-50/30 transition-all duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-semibold text-gray-900 truncate">
                            {donation.participantName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {donation.teammateName}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {donation.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {donation.contactNumber1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-base font-semibold ${
                        donation.teamId ? "text-blue-600" : "text-gray-500"
                      }`}>
                        {donation.teamId || "Pending"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.teamId ? "Confirmed" : "Not assigned"}
                      </div>
                      {updatingId === donation.id && (
                        <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Generating Team ID...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base font-semibold text-gray-900 flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {(parseFloat(donation.amount) || 0).toFixed(2)}
                      </div>
                      {donation.actualAmount && (
                        <div className="text-sm text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Paid: €{(parseFloat(donation.actualAmount) || 0).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openStatusModal(donation)}
                          disabled={updatingId === donation.id}
                          className={`flex items-center gap-2 font-semibold text-sm transition-all duration-200 ${
                            updatingId === donation.id 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-blue-600 hover:text-blue-800 hover:scale-105"
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                          {updatingId === donation.id ? "Updating..." : "Status"}
                        </button>
                        
                        {donation.paymentScreenshot && (
                          <button
                            onClick={() => openScreenshotModal(donation.paymentScreenshot, donation)}
                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
                          disabled={deleteLoading === donation.id || updatingId === donation.id}
                          className={`flex items-center gap-2 font-semibold text-sm transition-all duration-200 ${
                            (deleteLoading === donation.id || updatingId === donation.id)
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-rose-600 hover:text-rose-800 hover:scale-105"
                          }`}
                        >
                          {deleteLoading === donation.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {deleteLoading === donation.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonations.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">No registrations found</p>
              {(searchTerm || statusFilter !== "all") && (
                <p className="text-gray-400 mt-2">
                  Try adjusting your search criteria or filters
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Update Registration Status
                </h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Registration Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Team Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Team Captain:</span>
                        <p className="text-gray-900 mt-1">{selectedDonation.participantName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Teammate:</span>
                        <p className="text-gray-900 mt-1">{selectedDonation.teammateName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Requested Amount:</span>
                        <p className="text-gray-900 mt-1 flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {(parseFloat(selectedDonation.amount) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900 mt-1">{selectedDonation.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <p className="text-gray-900 mt-1">{selectedDonation.contactNumber1}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Team ID:</span>
                        <p className="text-gray-900 font-mono mt-1">{selectedDonation.teamId || "Not assigned"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Registration Status
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) =>
                      setStatusUpdate({
                        ...statusUpdate,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirm & Generate Team ID</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>

                {statusUpdate.status === "confirmed" && (
                  <>
                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Actual Amount Paid (€)
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={statusUpdate.actualAmount}
                          onChange={(e) => setStatusUpdate({
                            ...statusUpdate,
                            actualAmount: e.target.value
                          })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                          placeholder="Enter actual amount received"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Team ID will be automatically generated and sent via email
                      </p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    disabled={updatingId === selectedDonation.id}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200 hover:border-gray-400 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateDonationStatus(selectedDonation.id)}
                    disabled={updatingId === selectedDonation.id || !statusUpdate.status}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {updatingId === selectedDonation.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-emerald-600" />
                  Payment Screenshot
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedScreenshot.donation.participantName} - €{(parseFloat(selectedScreenshot.donation.amount) || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadScreenshot}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-auto">
              <div className="flex justify-center">
                <img
                  src={selectedScreenshot.url}
                  alt="Payment Screenshot"
                  className="max-w-full h-auto rounded-2xl shadow-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-center py-20 text-gray-500';
                    errorDiv.innerHTML = `
                      <div class="text-6xl mb-4">📸</div>
                      <p class="text-lg font-semibold">Failed to load image</p>
                      <p class="text-sm mt-2">The screenshot cannot be displayed</p>
                      <a href="${selectedScreenshot.url}" target="_blank" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        Open in new tab
                      </a>
                    `;
                    e.target.parentNode.appendChild(errorDiv);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;