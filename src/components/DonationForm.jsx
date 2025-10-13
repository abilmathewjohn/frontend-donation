import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Upload, ArrowRight, ArrowLeft, Heart } from 'lucide-react';

const DonationForm = () => {
  const [step, setStep] = useState(1);
  const [pricingSettings, setPricingSettings] = useState({
    pricingMode: 'per_team',
    pricePerPerson: 10.00,
    pricePerTeam: 20.00,
    registrationFee: 20.00,
    pricingDescription: '1 team = €20.00 (€10 per person), Registration fee: €20.00'
  });
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [contactPhone, setContactPhone] = useState('+3XXXXXXXXX');
  const [orgName, setOrgName] = useState('Your Organization');
  const [logoUrl, setLogoUrl] = useState(null);
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    participantName: '',
    teammateName: '',
    address: '',
    contactNumber1: '',
    contactNumber2: '',
    email: '',
    whatsappNumber: '',
    zone: '',
    howKnown: '',
    otherHowKnown: '',
    diocese: '',
    previousParticipation: false,
    teamRegistration: true,
    paymentLinkUsed: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const validatePhone = (phone) => /^\d{0,11}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    fetchSettings();
    fetchPaymentLinks();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`, { timeout: 5000 });
      if (response.data) {
        setContactPhone(response.data.contactPhone || '+3XXXXXXXXX');
        setOrgName(response.data.orgName || 'Your Organization');
        setLogoUrl(response.data.logoUrl || null);
        setBanners(response.data.banners || []);
        
        // Set pricing settings
        setPricingSettings({
          pricingMode: response.data.pricingMode || 'per_team',
          pricePerPerson: parseFloat(response.data.pricePerPerson) || 10.00,
          pricePerTeam: parseFloat(response.data.pricePerTeam) || 20.00,
          registrationFee: parseFloat(response.data.registrationFee) || 20.00,
          pricingDescription: response.data.pricingDescription || '1 team = €20.00 (€10 per person), Registration fee: €20.00'
        });
        
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch settings. Using default values.');
    }
  };

  const fetchPaymentLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-links/active`, { timeout: 5000 });
      setPaymentLinks(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching payment links:', error);
      setPaymentLinks([]);
      setError('Failed to fetch payment options. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };
    if (name === 'contactNumber1' || name === 'contactNumber2' || name === 'whatsappNumber') {
      if (!validatePhone(value)) {
        newErrors[name] = 'Phone number must be up to 11 digits';
      } else {
        delete newErrors[name];
      }
    }
    if (name === 'email') {
      if (!validateEmail(value)) {
        newErrors[name] = 'Invalid email format';
      } else {
        delete newErrors[name];
      }
    }
    if (name === 'participantName' || name === 'teammateName') {
      if (value.length > 25) {
        newErrors[name] = 'Name must be 25 characters or less';
      } else {
        delete newErrors[name];
      }
    }
    if (name === 'zone') {
      if (value.length > 15) {
        newErrors[name] = 'Zone must be 15 characters or less';
      } else {
        delete newErrors[name];
      }
    }
    setErrors(newErrors);
  };

  const handleCheckboxChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotalAmount = () => {
    // For team registration, use team pricing
    if (formData.teamRegistration) {
      return pricingSettings.pricePerTeam + pricingSettings.registrationFee;
    }
    return pricingSettings.registrationFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const totalAmount = calculateTotalAmount();
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    submitData.append('amount', totalAmount);
    if (screenshot) {
      submitData.append('screenshot', screenshot);
    }

    try {
      const response = await axios.post(`${API_URL}/donations`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      alert('Registration submitted successfully! Confirmation will be sent to your email.');
      
      setStep(1);
      setFormData({
        participantName: '',
        teammateName: '',
        address: '',
        contactNumber1: '',
        contactNumber2: '',
        email: '',
        whatsappNumber: '',
        zone: '',
        howKnown: '',
        otherHowKnown: '',
        diocese: '',
        previousParticipation: false,
        teamRegistration: true,
        paymentLinkUsed: '',
      });
      setScreenshot(null);
      setScreenshotPreview(null);
      setErrors({});
    } catch (error) {
      console.error('Error submitting donation:', error);
      let errorMessage = 'Error submitting registration. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotalAmount();

  const isStep1Complete = formData.participantName && formData.teammateName && formData.address && formData.contactNumber1 && formData.email && formData.whatsappNumber && formData.zone && formData.howKnown && formData.diocese && (formData.previousParticipation !== null) && formData.paymentLinkUsed && screenshot && Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 backdrop-blur-sm">
          {/* Header Section with Improved Layout */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 sm:px-8 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Logo and Organization Info */}
              <div className="flex items-center gap-4 flex-1">
                {logoUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={logoUrl} 
                      alt={orgName} 
                      className="h-20 w-20 lg:h-24 lg:w-24 object-contain rounded-2xl border-4 border-white/80 shadow-2xl" 
                    />
                  </div>
                )}
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {orgName || 'Quiz Registration'}
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base font-medium">
                    Join our quiz program and support our cause!
                  </p>
                </div>
              </div>

              {/* Support Our Cause Section */}
              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/30">
                  <Heart className="w-6 h-6 text-red-400" fill="currentColor" />
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base">
                      Support Our Cause 🎗️
                    </p>
                    <p className="text-blue-100 text-xs sm:text-sm max-w-xs">
                      Make a difference by purchasing tickets. Every contribution helps us achieve our mission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banners with Responsive Design */}
          {banners.length > 0 && (
            <div className="w-full overflow-hidden bg-gray-900">
              {banners.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-auto object-cover"
                    style={{ 
                      aspectRatio: '2560/510',
                      maxHeight: '510px',
                      minHeight: '200px'
                    }}
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  {error}
                </div>
              </div>
            )}

            {/* Progress Steps - Improved Design */}
            <div className="mb-8 sm:mb-12">
              <div className="flex justify-between items-center relative">
                <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full -z-10">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  ></div>
                </div>
                
                {[
                  { num: 1, label: 'Team Information', icon: '👥' },
                  { num: 2, label: 'Confirm & Submit', icon: '✓' }
                ].map((stepInfo) => (
                  <div key={stepInfo.num} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 transform ${
                        step > stepInfo.num
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 shadow-xl scale-110 rotate-12'
                          : step === stepInfo.num
                          ? 'bg-white border-blue-500 shadow-xl scale-110 -rotate-6'
                          : 'bg-white border-gray-300 shadow-md hover:scale-105'
                      }`}
                    >
                      {step > stepInfo.num ? (
                        <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <span className={`text-xl sm:text-2xl ${step === stepInfo.num ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                          {stepInfo.icon}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm mt-3 font-semibold text-center px-2 ${
                      step >= stepInfo.num 
                        ? 'text-gray-800' 
                        : 'text-gray-500'
                    }`}>
                      {stepInfo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Team Information */}
              {step === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      Team Registration
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                      Complete your team details to participate in our exciting quiz program and support our cause
                    </p>
                  </div>
                  
                  {/* Team Information Card */}
                  <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 sm:p-8 rounded-3xl border-2 border-blue-100 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 text-lg">👥</span>
                      </div>
                      Team Information
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Participant Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="participantName"
                            value={formData.participantName}
                            onChange={handleInputChange}
                            required
                            maxLength={25}
                            className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                              errors.participantName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            placeholder="Enter participant name"
                          />
                          {errors.participantName && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              ⚠️ {errors.participantName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Teammate Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="teammateName"
                            value={formData.teammateName}
                            onChange={handleInputChange}
                            required
                            maxLength={25}
                            className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                              errors.teammateName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            placeholder="Enter teammate name"
                          />
                          {errors.teammateName && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              ⚠️ {errors.teammateName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg hover:border-blue-300"
                            placeholder="Your complete address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Contact 1 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              name="contactNumber1"
                              value={formData.contactNumber1}
                              onChange={handleInputChange}
                              required
                              maxLength={11}
                              pattern="[0-9]*"
                              className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                                errors.contactNumber1 ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                              }`}
                              placeholder="Phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Contact 2
                            </label>
                            <input
                              type="tel"
                              name="contactNumber2"
                              value={formData.contactNumber2}
                              onChange={handleInputChange}
                              maxLength={11}
                              pattern="[0-9]*"
                              className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                                errors.contactNumber2 ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                              }`}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Email ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            placeholder="email@example.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              ⚠️ {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            WhatsApp Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleInputChange}
                            required
                            maxLength={11}
                            pattern="[0-9]*"
                            className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                              errors.whatsappNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            placeholder="WhatsApp number"
                          />
                          {errors.whatsappNumber && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              ⚠️ {errors.whatsappNumber}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Zone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="zone"
                              value={formData.zone}
                              onChange={handleInputChange}
                              required
                              maxLength={15}
                              className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg ${
                                errors.zone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                              }`}
                              placeholder="Zone"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Diocese <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="diocese"
                              value={formData.diocese}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg hover:border-blue-300"
                              placeholder="Diocese in Kerala"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            How did you know about us? <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="howKnown"
                            value={formData.howKnown}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg bg-white hover:border-blue-300"
                          >
                            <option value="">Select an option</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Friends">Friends</option>
                            <option value="Website">Website</option>
                            <option value="Other">Other</option>
                          </select>
                          {formData.howKnown === 'Other' && (
                            <input
                              type="text"
                              name="otherHowKnown"
                              value={formData.otherHowKnown}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-lg mt-3 hover:border-blue-300"
                              placeholder="Please specify how you heard about us"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Previous Quiz Participation <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-3 text-lg">
                              <input
                                type="radio"
                                checked={formData.previousParticipation}
                                onChange={() => handleCheckboxChange('previousParticipation', true)}
                                className="w-5 h-5 text-blue-600"
                              />
                              <span className="text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-3 text-lg">
                              <input
                                type="radio"
                                checked={!formData.previousParticipation}
                                onChange={() => handleCheckboxChange('previousParticipation', false)}
                                className="w-5 h-5 text-blue-600"
                              />
                              <span className="text-gray-700">No</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Payment Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pricing Information */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 rounded-3xl border-2 border-green-200 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <span className="text-green-600 text-lg">💰</span>
                        </div>
                        Registration Fee
                      </h3>
                      
                      <div className="text-center bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <p className="text-sm text-gray-600 mb-3 font-semibold">Pricing Structure</p>
                        <p className="text-base text-gray-800 mb-6 leading-relaxed">
                          {pricingSettings.pricingDescription}
                        </p>
                        <div className="flex justify-center items-baseline gap-4">
                          <div className="text-center">
                            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              €{totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 mt-2 font-semibold">Total Amount</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <p className="text-sm text-amber-800 text-center font-medium">
                          <span className="font-bold">Note:</span> This registration includes team participation for 2 people
                        </p>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-3xl border-2 border-purple-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-purple-600 text-lg">💳</span>
                          </div>
                          Payment Method
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Select Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="paymentLinkUsed"
                              value={formData.paymentLinkUsed}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 outline-none text-lg bg-white hover:border-purple-300"
                            >
                              <option value="">Choose a payment method</option>
                              {paymentLinks.map((link) => (
                                <option key={link.id} value={link.url}>
                                  {link.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {formData.paymentLinkUsed && (
                            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                              <div className="mb-6">
                                <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-lg border border-green-200">
                                  <p className="text-sm text-gray-600 mb-2 font-semibold">Amount to Pay</p>
                                  <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                                    €{totalAmount.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Team Registration + Fee
                                  </div>
                                </div>
                              </div>
                              <a
                                href={formData.paymentLinkUsed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg hover:scale-105 transform"
                              >
                                Pay Now - €{totalAmount.toFixed(2)}
                                <ArrowRight className="w-5 h-5" />
                              </a>
                              <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
                                After completing payment, take a screenshot and upload it below
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Screenshot Upload */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 text-lg">📸</span>
                          </div>
                          Payment Proof
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Upload Payment Screenshot <span className="text-red-500">*</span>
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-200 bg-white/50 cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotChange}
                              required
                              className="hidden"
                              id="screenshot-upload"
                            />
                            <label htmlFor="screenshot-upload" className="cursor-pointer block">
                              {screenshotPreview ? (
                                <div className="space-y-4">
                                  <img 
                                    src={screenshotPreview} 
                                    alt="Screenshot preview" 
                                    className="max-h-64 mx-auto rounded-xl shadow-lg border-2 border-green-200"
                                  />
                                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-lg">
                                    <Check className="w-6 h-6" />
                                    <span>{screenshot.name}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 group-hover:scale-105 transition-transform duration-200">
                                  <Upload className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 group-hover:text-blue-400" />
                                  <div>
                                    <p className="text-gray-700 font-semibold text-lg group-hover:text-blue-600">
                                      Click to upload payment screenshot
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                      PNG, JPG, JPEG up to 5MB
                                    </p>
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Complete}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 px-12 rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg sm:text-xl flex items-center justify-center gap-3 mx-auto group hover:scale-105 transform"
                    >
                      Review & Continue
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                    {!isStep1Complete && (
                      <p className="text-sm text-gray-500 mt-3">
                        Please complete all required fields to continue
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Review & Submit */}
              {step === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                      Review Your Registration
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                      Please verify all information before submitting your registration
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Team Information Review */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-lg">
                      <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 text-lg">👥</span>
                        </div>
                        Team Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Participant</span>
                            <p className="text-gray-900 font-semibold text-lg">{formData.participantName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Teammate</span>
                            <p className="text-gray-900 font-semibold text-lg">{formData.teammateName}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Address</span>
                          <p className="text-gray-900 font-semibold text-lg">{formData.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Contact Numbers</span>
                            <p className="text-gray-900 font-semibold">
                              {formData.contactNumber1} 
                              {formData.contactNumber2 && `, ${formData.contactNumber2}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">WhatsApp</span>
                            <p className="text-gray-900 font-semibold">{formData.whatsappNumber}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                          <p className="text-gray-900 font-semibold text-lg break-all">{formData.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Zone</span>
                            <p className="text-gray-900 font-semibold">{formData.zone}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Diocese</span>
                            <p className="text-gray-900 font-semibold">{formData.diocese}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Details Review */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-3xl border-2 border-purple-200 shadow-lg">
                      <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <span className="text-purple-600 text-lg">🎫</span>
                        </div>
                        Registration Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">How You Heard About Us</span>
                          <p className="text-gray-900 font-semibold text-lg">
                            {formData.howKnown} {formData.otherHowKnown && `(${formData.otherHowKnown})`}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Previous Participation</span>
                          <p className="text-gray-900 font-semibold text-lg">
                            {formData.previousParticipation ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Registration Type</span>
                          <p className="text-gray-900 font-semibold text-lg">Team (2 people)</p>
                        </div>
                        <div className="pt-4 border-t border-purple-200">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Total Amount</span>
                          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            €{totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Payment Method</span>
                          <p className="text-gray-900 font-semibold text-sm break-all">{formData.paymentLinkUsed}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Screenshot Uploaded</span>
                          <p className="text-gray-900 font-semibold text-sm">{screenshot?.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  {screenshotPreview && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-lg">
                      <h4 className="font-semibold text-xl text-gray-700 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <span className="text-green-600 text-lg">📸</span>
                        </div>
                        Payment Screenshot Preview
                      </h4>
                      <div className="flex justify-center">
                        <img 
                          src={screenshotPreview} 
                          alt="Screenshot preview" 
                          className="max-h-96 w-auto rounded-2xl shadow-lg border-2 border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-5 px-6 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 transform border-2 border-gray-300"
                    >
                      <ArrowLeft className="w-6 h-6" />
                      Back to Edit
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 px-6 rounded-2xl hover:shadow-2xl disabled:opacity-50 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transform"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-7 h-7" />
                          Confirm & Submit Registration
                        </>
                      )}
                    </button>
                  </div>

                  {/* Final Note */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 text-center">
                    <p className="text-amber-900 font-semibold text-lg flex items-center justify-center gap-3 mb-3">
                      <span className="text-2xl">🎫</span>
                      Registration Confirmation
                    </p>
                    <p className="text-amber-800 text-base">
                      Your registration will be confirmed after verification. Tickets and confirmation will be sent to your email.
                      <br />
                      Any questions? Contact us: <span className="font-bold">{contactPhone}</span>
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonationForm;