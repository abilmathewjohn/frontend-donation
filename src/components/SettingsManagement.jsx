import React, { useState, useEffect } from "react";
import axios from "axios";

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    contactPhone: "+3XXXXXXXXX",
    ticketPrice: 2.0,
    adminEmail: "admin@example.com",
    orgName: "Your Organization",
    // New pricing fields
    pricingMode: "per_team",
    pricePerPerson: 10.0,
    pricePerTeam: 20.0,
    registrationFee: 20.0,
    pricingDescription:
      "1 team = €20.00 (€10 per person), Registration fee: €20.00",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`);
      if (response.data) {
        setSettings(response.data);
        setCurrentLogo(response.data.logoUrl);
        setBanners(response.data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
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
      console.error("Error updating settings:", error);
      alert(
        "Error updating settings: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePricingModeChange = (mode) => {
    setSettings((prev) => ({
      ...prev,
      pricingMode: mode,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("logo", logoFile);
    try {
      const response = await axios.post(
        `${API_URL}/admin/upload-logo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setCurrentLogo(response.data.logoUrl);
      setLogoFile(null);
      setLogoPreview(null);
      fetchSettings();
    } catch (error) {
      alert("Error uploading logo");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const uploadBanner = async () => {
    if (!bannerFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("banner", bannerFile);
    try {
      const response = await axios.post(
        `${API_URL}/admin/upload-banner`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setBanners(response.data.banners);
      setBannerFile(null);
      setBannerPreview(null);
      fetchSettings();
    } catch (error) {
      alert("Error uploading banner");
    } finally {
      setLoading(false);
    }
  };

  const removeBanner = async (publicId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/remove-banner`, {
        publicId,
      });
      setBanners(response.data.banners);
      fetchSettings();
    } catch (error) {
      alert("Error removing banner");
    } finally {
      setLoading(false);
    }
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
                  Organization Name
                </label>
                <input
                  type="text"
                  value={settings.orgName}
                  onChange={(e) => handleChange("orgName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Your Organization"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="+3XXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-2">
                  This number will be displayed to users for support inquiries
                </p>
              </div>

              {/* Pricing Settings Section */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  Pricing Settings
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Pricing Mode
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => handlePricingModeChange("per_ticket")}
                        className={`p-4 border-2 rounded-xl text-center transition duration-200 ${
                          settings.pricingMode === "per_ticket"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-semibold">Per Ticket</div>
                        <div className="text-sm mt-1">Individual tickets</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricingModeChange("per_person")}
                        className={`p-4 border-2 rounded-xl text-center transition duration-200 ${
                          settings.pricingMode === "per_person"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-semibold">Per Person</div>
                        <div className="text-sm mt-1">
                          Individual registration
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricingModeChange("per_team")}
                        className={`p-4 border-2 rounded-xl text-center transition duration-200 ${
                          settings.pricingMode === "per_team"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-semibold">Per Team</div>
                        <div className="text-sm mt-1">Team registration</div>
                      </button>
                    </div>
                  </div>

                  {settings.pricingMode === "per_team" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Price Per Person (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={settings.pricePerPerson}
                            onChange={(e) =>
                              handleChange(
                                "pricePerPerson",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Price Per Team (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={settings.pricePerTeam}
                            onChange={(e) =>
                              handleChange(
                                "pricePerTeam",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Registration Fee (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={settings.registrationFee}
                      onChange={(e) =>
                        handleChange(
                          "registrationFee",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Pricing Description
                    </label>
                    <textarea
                      value={settings.pricingDescription}
                      onChange={(e) =>
                        handleChange("pricingDescription", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Describe your pricing structure..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      This description will be shown to users on the
                      registration form
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange("adminEmail", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Email address for system notifications and admin
                  communications
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

            {/* Logo Upload */}
            <div className="mt-8 border-t pt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Organization Logo
              </label>
              {currentLogo && (
                <div className="mb-4">
                  <img
                    src={currentLogo}
                    alt="Current Logo"
                    className="h-20 w-20 object-contain rounded-full border-2 border-gray-200"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mb-4"
              />
              {logoPreview && (
                <div className="mb-4">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="h-20 w-20 object-contain rounded-full border-2 border-gray-200"
                  />
                </div>
              )}
              <button
                onClick={uploadLogo}
                disabled={!logoFile || loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition duration-200"
              >
                Upload Logo
              </button>
            </div>

            {/* Banners Upload */}
            <div className="mt-8 border-t pt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Banners
              </label>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {banners.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Banner ${index}`}
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      onClick={() =>
                        removeBanner(settings.bannerPublicIds?.[index])
                      }
                      className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="mb-4"
              />
              {bannerPreview && (
                <div className="mb-4">
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                  />
                </div>
              )}
              <button
                onClick={uploadBanner}
                disabled={!bannerFile || loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition duration-200"
              >
                Upload Banner
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800">
                Pricing Modes
              </h3>
            </div>
            <ul className="text-sm text-yellow-700 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <strong>Per Ticket:</strong> Individual ticket sales
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <strong>Per Person:</strong> Individual registration
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <strong>Per Team:</strong> Team-based registration (2 people)
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={fetchSettings}
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition duration-200 font-semibold text-sm"
              >
                ↻ Refresh Settings
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Current Pricing
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-semibold capitalize">
                  {settings.pricingMode?.replace("_", " ")}
                </span>
              </div>
              {settings.pricingMode === "per_team" && (
                <>
                  <div className="flex justify-between">
                    <span>Per Person:</span>
                    <span className="font-semibold">
                      €{settings.pricePerPerson}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Team:</span>
                    <span className="font-semibold">
                      €{settings.pricePerTeam}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Registration Fee:</span>
                <span className="font-semibold">
                  €{settings.registrationFee}
                </span>
              </div>
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total per Team:</span>
                  <span>
                    €
                    {(
                      parseFloat(settings.pricePerTeam || 0) +
                      parseFloat(settings.registrationFee || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
