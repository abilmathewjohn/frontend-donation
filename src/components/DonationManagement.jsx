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
      // Show user-friendly error message
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
      await axios.patch(
        `${API_URL}/admin/donations/${donationId}/status`,
        statusUpdate
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
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      confirmed: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Confirmed",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Rejected",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const calculateTicketsFromAmount = (amount) => {
    return Math.floor(amount / ticketPrice);
  };

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || donation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">
          Donation Management
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
          >
            Export to Excel
          </button>
          <button
            onClick={fetchDonations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Donor Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Paid/Assigned
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr
                  key={donation.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {donation.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {donation.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.phone}
                        </div>
                        <div className="text-xs text-gray-400">
                          {donation.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {donation.tickets} tickets
                    </div>
                    <div className="text-sm text-gray-500">
                      €{donation.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {donation.ticketsAssigned || "0"} tickets
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      €{donation.actualAmount || donation.amount}
                    </div>
                    {donation.ticketNumbers &&
                      donation.ticketNumbers.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {donation.ticketNumbers.length} tickets
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(donation.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-400">
                      {new Date(donation.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(donation)}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="text-red-600 hover:text-red-900 font-semibold text-sm"
                    >
                      Delete
                    </button>
                    {donation.paymentScreenshot && (
                      <a
                        href={donation.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 font-semibold text-sm mr-3"
                      >
                        View Screenshot
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No donations found</p>
            {searchTerm || statusFilter !== "all" ? (
              <p className="text-gray-400">
                Try adjusting your search or filters
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Update Donation Status
                </h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Donation Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Donor:</span>
                      <p>{selectedDonation.fullName}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Email:</span>
                      <p>{selectedDonation.email}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Requested:</span>
                      <p>
                        {selectedDonation.tickets} tickets (€
                        {selectedDonation.amount})
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Phone:</span>
                      <p>{selectedDonation.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) =>
                      setStatusUpdate({
                        ...statusUpdate,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {statusUpdate.status === "confirmed" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Actual Amount Paid (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={statusUpdate.actualAmount}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const calculatedTickets =
                            calculateTicketsFromAmount(amount);
                          setStatusUpdate({
                            ...statusUpdate,
                            actualAmount: e.target.value,
                            ticketsToAssign: calculatedTickets,
                          });
                        }}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter actual amount received"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Based on €{ticketPrice} per ticket:{" "}
                        {calculateTicketsFromAmount(
                          parseFloat(statusUpdate.actualAmount) || 0
                        )}{" "}
                        tickets
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Adjust if different from calculated amount
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        placeholder="TICKET-001, TICKET-002, ... (leave empty for auto-generation)"
                        rows="4"
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {statusUpdate.ticketNumbers
                          ? `${
                              statusUpdate.ticketNumbers
                                .split(",")
                                .filter((t) => t.trim()).length
                            } tickets specified`
                          : "Will auto-generate ticket numbers"}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl font-semibold transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateDonationStatus(selectedDonation.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition duration-200"
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
