import React, { useState, useEffect } from "react";
import axios from "axios";

const DonationManagement = ({ onUpdate }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    actualAmount: "",
    ticketsToAssign: "",
    ticketNumbers: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ticketPrice, setTicketPrice] = useState(2.0);
  const [autoGenerateTickets, setAutoGenerateTickets] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDonations();
    fetchTicketPrice();
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
        alert(
          "Failed to load donations. Please check if the server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this donation and its screenshot?"
      )
    ) {
      try {
        await axios.delete(`${API_URL}/admin/donations/${donationId}`);
        await fetchDonations();
        onUpdate();
        alert("Donation deleted successfully!");
      } catch (error) {
        console.error("Error deleting donation:", error);
        alert("Error deleting donation");
      }
    }
  };

  const fetchTicketPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`);
      if (response.data) {
        setTicketPrice(response.data.ticketPrice);
      }
    } catch (error) {
      console.error("Error fetching ticket price:", error);
    }
  };

  const updateDonationStatus = async (donationId) => {
    try {
      const payload = {
        ...statusUpdate,
        autoGenerateTickets: autoGenerateTickets && statusUpdate.status === "confirmed"
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
        ticketsToAssign: "",
        ticketNumbers: "",
      });
      setAutoGenerateTickets(true);
      alert("Donation status updated successfully!");
    } catch (error) {
      console.error("Error updating donation status:", error);
      alert(
        "Error updating donation status: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const openEditModal = (donation) => {
    const calculatedTickets = Math.floor(
      (donation.actualAmount || donation.amount) / ticketPrice
    );

    setSelectedDonation(donation);
    setStatusUpdate({
      status: donation.status,
      actualAmount: donation.actualAmount || donation.amount,
      ticketsToAssign: donation.ticketsAssigned || calculatedTickets,
      ticketNumbers: donation.ticketNumbers
        ? donation.ticketNumbers.join(", ")
        : "",
    });
    
    // Set auto-generate based on whether ticket numbers already exist
    setAutoGenerateTickets(!donation.ticketNumbers || donation.ticketNumbers.length === 0);
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/donations/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `donations-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting donations:", error);
      alert("Error exporting donations");
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

  const calculateTicketsFromAmount = (amount) => {
    return Math.floor(amount / ticketPrice);
  };

  const handleAmountChange = (amount) => {
    const calculatedTickets = calculateTicketsFromAmount(amount);
    setStatusUpdate({
      ...statusUpdate,
      actualAmount: amount,
      ticketsToAssign: autoGenerateTickets ? calculatedTickets : statusUpdate.ticketsToAssign,
    });
  };

  const handleAutoGenerateToggle = (enabled) => {
    setAutoGenerateTickets(enabled);
    if (enabled) {
      const amount = parseFloat(statusUpdate.actualAmount) || 0;
      const calculatedTickets = calculateTicketsFromAmount(amount);
      setStatusUpdate({
        ...statusUpdate,
        ticketsToAssign: calculatedTickets,
        ticketNumbers: "",
      });
    }
  };

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.phone?.includes(searchTerm);

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
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Donation Management
            </h2>
            <p className="text-gray-600 mt-2">
              Manage and track all donation requests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <button
              onClick={fetchDonations}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Search Donations
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Donor Information
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Paid/Assigned
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {donation.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-gray-900">
                            {donation.fullName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {donation.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.phone}
                          </div>
                          {donation.location && (
                            <div className="text-xs text-gray-400 mt-1">
                              📍 {donation.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-900">
                        {donation.tickets} tickets
                      </div>
                      <div className="text-sm text-gray-600">
                        €{donation.amount}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">
                        {donation.ticketsAssigned || "0"} tickets
                      </div>
                      <div className="text-sm font-semibold text-emerald-600">
                        €{donation.actualAmount || donation.amount}
                      </div>
                      {donation.ticketNumbers && donation.ticketNumbers.length > 0 && (
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          🎫 {donation.ticketNumbers.length} tickets assigned
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openEditModal(donation)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        {donation.paymentScreenshot && (
                          <a
                            href={donation.paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Screenshot
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-sm transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-semibold">No donations found</p>
              {(searchTerm || statusFilter !== "all") && (
                <p className="text-gray-400 mt-2">
                  Try adjusting your search criteria or filters
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Update Donation Status
                </h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                {/* Donation Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Donation Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Donor:</span>
                        <p className="text-gray-900">{selectedDonation.fullName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Requested:</span>
                        <p className="text-gray-900">
                          {selectedDonation.tickets} tickets (€{selectedDonation.amount})
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900">{selectedDonation.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <p className="text-gray-900">{selectedDonation.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Donation Status
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) =>
                      setStatusUpdate({
                        ...statusUpdate,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
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
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter actual amount received"
                      />
                      <p className="text-sm text-gray-600 mt-3">
                        Based on €{ticketPrice} per ticket:{" "}
                        <span className="font-semibold text-blue-600">
                          {calculateTicketsFromAmount(
                            parseFloat(statusUpdate.actualAmount) || 0
                          )}{" "}
                          tickets
                        </span>
                      </p>
                    </div>

                    {/* Ticket Generation Toggle */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-bold text-gray-800">
                          Auto-generate Ticket Numbers
                        </span>
                        <div 
                          onClick={() => handleAutoGenerateToggle(!autoGenerateTickets)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            autoGenerateTickets ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              autoGenerateTickets ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </div>
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        {autoGenerateTickets 
                          ? "Ticket numbers will be automatically generated based on the amount paid"
                          : "You can manually specify ticket numbers below"
                        }
                      </p>
                    </div>

                    {/* Tickets to Assign */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Tickets to Assign
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={statusUpdate.ticketsToAssign}
                        onChange={(e) =>
                          setStatusUpdate({
                            ...statusUpdate,
                            ticketsToAssign: e.target.value,
                          })
                        }
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={autoGenerateTickets}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {autoGenerateTickets 
                          ? "Automatically calculated from amount paid"
                          : "Manually adjust the number of tickets to assign"
                        }
                      </p>
                    </div>

                    {/* Manual Ticket Numbers Input */}
                    {!autoGenerateTickets && (
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Ticket Numbers (comma separated)
                        </label>
                        <textarea
                          value={statusUpdate.ticketNumbers}
                          onChange={(e) =>
                            setStatusUpdate({
                              ...statusUpdate,
                              ticketNumbers: e.target.value,
                            })
                          }
                          placeholder="TICKET-001, TICKET-002, TICKET-003, ..."
                          rows="4"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          {statusUpdate.ticketNumbers
                            ? `${
                                statusUpdate.ticketNumbers
                                  .split(",")
                                  .filter((t) => t.trim()).length
                              } tickets specified`
                            : "Enter ticket numbers separated by commas"}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="px-8 py-4 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200 hover:border-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateDonationStatus(selectedDonation.id)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;