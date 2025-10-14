import React, { useState, useEffect } from "react";
import axios from "axios";

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
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Failed to load registrations. Please check if the server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (window.confirm("Are you sure you want to delete this registration and its screenshot?")) {
      try {
        await axios.delete(`${API_URL}/admin/donations/${donationId}`);
        await fetchDonations();
        onUpdate();
        alert("Registration deleted successfully!");
      } catch (error) {
        console.error("Error deleting registration:", error);
        alert("Error deleting registration");
      }
    }
  };

  const updateDonationStatus = async (donationId) => {
    try {
      const payload = {
        ...statusUpdate,
        actualAmount: parseFloat(statusUpdate.actualAmount) || 0,
      };

      await axios.patch(
        `${API_URL}/admin/donations/${donationId}/status`,
        payload
      );
      await fetchDonations();
      onUpdate();
      setSelectedDonation(null);
      setStatusUpdate({
        status: "",
        actualAmount: "",
      });
      alert("Registration status updated successfully!");
    } catch (error) {
      console.error("Error updating registration status:", error);
      alert("Error updating registration status: " + (error.response?.data?.error || error.message));
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
    } catch (error) {
      console.error("Error exporting registrations:", error);
      alert("Error exporting registrations");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Pending",
      },
      confirmed: {
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        label: "Confirmed",
      },
      rejected: {
        color: "bg-rose-50 text-rose-800 border-rose-200",
        label: "Rejected",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${config.color}`}
      >
        {config.label}
      </span>
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
      
      const filename = `screenshot-${selectedScreenshot.donation.participantName}-${selectedScreenshot.donation.id}.jpg`;
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading screenshot:", error);
      alert("Error downloading screenshot");
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
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Team Registration Management
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Manage and track all team registration requests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <button
              onClick={fetchDonations}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Search Registrations
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or team ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
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
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team Information
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team ID
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">
                            {donation.participantName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-semibold text-gray-900">
                            {donation.participantName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            + {donation.teammateName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            📞 {donation.contactNumber1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-semibold text-blue-600">
                        {donation.teamId || "Pending"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {donation.teamId ? "Confirmed" : "Not assigned"}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        €{(parseFloat(donation.amount) || 0).toFixed(2)}
                      </div>
                      {donation.actualAmount && (
                        <div className="text-xs text-green-600">
                          Paid: €{(parseFloat(donation.actualAmount) || 0).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => openStatusModal(donation)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Status
                        </button>
                        
                        {donation.paymentScreenshot && (
                          <button
                            onClick={() => openScreenshotModal(donation.paymentScreenshot, donation)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold text-xs sm:text-sm transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-xs sm:text-sm transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonations.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-semibold">No registrations found</p>
              {(searchTerm || statusFilter !== "all") && (
                <p className="text-gray-400 mt-2 text-sm">
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Update Registration Status
                </h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Registration Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Team Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Team Captain:</span>
                        <p className="text-gray-900">{selectedDonation.participantName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Teammate:</span>
                        <p className="text-gray-900">{selectedDonation.teammateName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Requested Amount:</span>
                        <p className="text-gray-900">€{(parseFloat(selectedDonation.amount) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900">{selectedDonation.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <p className="text-gray-900">{selectedDonation.contactNumber1}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Team ID:</span>
                        <p className="text-gray-900 font-mono">{selectedDonation.teamId || "Not assigned"}</p>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirm & Send Team ID</option>
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
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={statusUpdate.actualAmount}
                        onChange={(e) => setStatusUpdate({
                          ...statusUpdate,
                          actualAmount: e.target.value
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter actual amount received"
                      />
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
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200 hover:border-gray-400 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateDonationStatus(selectedDonation.id)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Update Status
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
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Payment Screenshot
                </h3>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {selectedScreenshot.donation.participantName} - €{(parseFloat(selectedScreenshot.donation.amount) || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadScreenshot}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-emerald-700 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl transition-colors duration-200 p-2"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 max-h-[70vh] overflow-auto">
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
                      <div class="text-4xl sm:text-6xl mb-4">📸</div>
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