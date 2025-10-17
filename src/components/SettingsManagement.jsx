import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Save, 
  RefreshCw, 
  Upload, 
  Trash2, 
  Building, 
  Phone, 
  Mail, 
  Euro, 
  FileText, 
  Image, 
  Settings,
  Lightbulb,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    contactPhone: "+3XXXXXXXXX",
    adminEmail: "admin@example.com",
    orgName: "Your Organization",
    pricePerPerson: 10.0,
    pricePerTeam: 20.0,
    registrationFee: 20.0,
    pricingDescription: "1 team = 2 persons = €20.00 (€10 per person)",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

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
      showToast("Failed to load settings", "error");
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
    setLoading(true);
    setSaved(false);

    try {
      await axios.put(`${API_URL}/admin/settings`, settings);
      setSaved(true);
      showToast("Settings saved successfully!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast("Error updating settings: " + (error.response?.data?.error || error.message), "error");
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Logo file size must be less than 5MB", "error");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploadLoading(true);
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
      showToast("Logo uploaded successfully!", "success");
      fetchSettings();
    } catch (error) {
      showToast("Error uploading logo", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Banner file size must be less than 5MB", "error");
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const uploadBanner = async () => {
    if (!bannerFile) return;
    setUploadLoading(true);
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
      showToast("Banner uploaded successfully!", "success");
      fetchSettings();
    } catch (error) {
      showToast("Error uploading banner", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeBanner = async (publicId) => {
    setUploadLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/remove-banner`, {
        publicId,
      });
      setBanners(response.data.banners);
      showToast("Banner removed successfully!", "success");
      fetchSettings();
    } catch (error) {
      showToast("Error removing banner", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return (parseFloat(settings.pricePerTeam || 0) + parseFloat(settings.registrationFee || 0)).toFixed(2);
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your organization's settings and appearance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Organization Information
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={settings.orgName}
                      onChange={(e) => handleChange("orgName", e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="Your Organization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => handleChange("contactPhone", e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="+3XXXXXXXXX"
                    />
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      This number will be displayed to users for support inquiries
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleChange("adminEmail", e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="admin@example.com"
                    />
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Email address for system notifications and admin communications
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Pricing Settings Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Registration Pricing
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Euro className="w-4 h-4 text-emerald-600" />
                        Price Per Person (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.pricePerPerson}
                        onChange={(e) =>
                          handleChange(
                            "pricePerPerson",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Euro className="w-4 h-4 text-emerald-600" />
                        Price Per Team (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.pricePerTeam}
                        onChange={(e) =>
                          handleChange(
                            "pricePerTeam",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Euro className="w-4 h-4 text-emerald-600" />
                        Registration Fee (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.registrationFee}
                        onChange={(e) =>
                          handleChange(
                            "registrationFee",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Set to 0 for no registration fee
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Pricing Description
                    </label>
                    <textarea
                      value={settings.pricingDescription}
                      onChange={(e) =>
                        handleChange("pricingDescription", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                      placeholder="Describe your pricing structure..."
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      This description will be shown to users on the registration form
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Organization Logo
                  </h3>
                </div>
                <div className="p-6">
                  {currentLogo && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={currentLogo}
                        alt="Current Logo"
                        className="h-24 w-24 object-contain rounded-2xl border-4 border-gray-100 shadow-lg"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-700 font-semibold">Click to upload logo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    </div>

                    {logoPreview && (
                      <div className="text-center">
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="h-16 w-16 object-contain rounded-xl border-2 border-gray-200 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-600">New logo preview</p>
                      </div>
                    )}

                    <button
                      onClick={uploadLogo}
                      disabled={!logoFile || uploadLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3.5 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      {uploadLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {uploadLoading ? "Uploading..." : "Upload Logo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner Upload Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Event Banners
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Current Banners */}
                    {banners.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-800">Current Banners:</p>
                        {banners.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Banner ${index + 1}`}
                              className="w-full h-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                            />
                            <button
                              onClick={() => removeBanner(settings.bannerPublicIds?.[index])}
                              disabled={uploadLoading}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-700 font-semibold">Click to upload banner</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    </div>

                    {bannerPreview && (
                      <div className="text-center">
                        <img
                          src={bannerPreview}
                          alt="Preview"
                          className="h-20 w-full object-cover rounded-xl border-2 border-gray-200"
                        />
                        <p className="text-sm text-gray-600 mt-2">New banner preview</p>
                      </div>
                    )}

                    <button
                      onClick={uploadBanner}
                      disabled={!bannerFile || uploadLoading}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      {uploadLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {uploadLoading ? "Uploading..." : "Upload Banner"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Apply Changes</h3>
                  <p className="text-sm text-gray-600">Save all settings and media changes</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchSettings}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "Saving..." : "Save All Settings"}
                  </button>
                </div>
              </div>

              {saved && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Settings saved successfully!</p>
                    <p className="text-sm">All changes have been applied.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800">
                  Team Registration
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span><strong>1 Team = 2 Persons</strong> mandatory</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Each team gets a unique Team ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Registration fee can be set to 0</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Automatic email confirmations</span>
                </li>
              </ul>
            </div>

            {/* Pricing Summary Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-800">
                  Current Pricing
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-700">Per Person:</span>
                  <span className="font-semibold text-emerald-800">
                    €{settings.pricePerPerson}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-700">Per Team:</span>
                  <span className="font-semibold text-emerald-800">
                    €{settings.pricePerTeam}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-700">Registration Fee:</span>
                  <span className="font-semibold text-emerald-800">
                    €{settings.registrationFee}
                  </span>
                </div>
                <div className="pt-2 mt-2">
                  <div className="flex justify-between items-center py-3 bg-white rounded-xl px-3 shadow-sm">
                    <span className="font-bold text-emerald-800">Total per Team:</span>
                    <span className="font-bold text-lg text-emerald-800">
                      €{calculateTotalAmount()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={fetchSettings}
                  className="w-full bg-white text-blue-600 py-3 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Settings
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full bg-white text-blue-600 py-3 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <ArrowUp className="w-4 h-4" />
                  Scroll to Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing ArrowUp icon component
const ArrowUp = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

export default SettingsManagement;