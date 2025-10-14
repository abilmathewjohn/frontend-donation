import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

const DonationForm = () => {
  const [step, setStep] = useState(1);
  const [pricingSettings, setPricingSettings] = useState({
    pricePerPerson: 10.00,
    pricePerTeam: 20.00,
    registrationFee: 0.00,
    pricingDescription: '1 team = 2 persons = €20.00 (€10 per person)'
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
        
        setPricingSettings({
          pricePerPerson: parseFloat(response.data.pricePerPerson) || 10.00,
          pricePerTeam: parseFloat(response.data.pricePerTeam) || 20.00,
          registrationFee: parseFloat(response.data.registrationFee) || 0.00,
          pricingDescription: response.data.pricingDescription || '1 team = 2 persons = €20.00 (€10 per person)'
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
    // Only add registration fee if it's greater than 0
    const registrationFee = parseFloat(pricingSettings.registrationFee) || 0;
    const pricePerTeam = parseFloat(pricingSettings.pricePerTeam) || 0;
    
    return registrationFee > 0 ? pricePerTeam + registrationFee : pricePerTeam;
  };

  const getAmountBreakdown = () => {
    const registrationFee = parseFloat(pricingSettings.registrationFee) || 0;
    const pricePerTeam = parseFloat(pricingSettings.pricePerTeam) || 0;
    
    return {
      pricePerTeam,
      registrationFee,
      total: registrationFee > 0 ? pricePerTeam + registrationFee : pricePerTeam
    };
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
      
      alert('Team registration submitted successfully! Confirmation will be sent to your email.');
      
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
      console.error('Error submitting registration:', error);
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
  const amountBreakdown = getAmountBreakdown();

  const isStep1Complete = formData.participantName && formData.teammateName && formData.address && formData.contactNumber1 && formData.email && formData.whatsappNumber && formData.zone && formData.howKnown && formData.diocese && (formData.previousParticipation !== null) && formData.paymentLinkUsed && screenshot && Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-rose-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 px-6 py-6">
            <div className="flex items-center justify-center gap-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={orgName} 
                  className="h-16 w-16 lg:h-20 lg:w-20 object-contain rounded-xl bg-white p-2 shadow-lg" 
                />
              )}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-md">
                  {orgName || 'Quiz Registration'}
                </h1>
                <p className="text-white/90 text-sm sm:text-base font-medium mt-1">
                </p>
              </div>
            </div>
          </div>

          {/* Banners */}
          {banners.length > 0 && (
            <div className="w-full bg-gray-100">
              {banners.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '400px' }}
                />
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex justify-between items-center relative max-w-md mx-auto">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                  <div 
                    className="h-1 bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  ></div>
                </div>
                
                {[
                  { num: 1, label: 'Team Info' },
                  { num: 2, label: 'Review' }
                ].map((stepInfo) => (
                  <div key={stepInfo.num} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step > stepInfo.num
                          ? 'bg-green-500 text-white'
                          : step === stepInfo.num
                          ? 'bg-orange-400 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {step > stepInfo.num ? <Check className="w-5 h-5" /> : stepInfo.num}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= stepInfo.num ? 'text-gray-800' : 'text-gray-400'}`}>
                      {stepInfo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                      Team Registration
                    </h2>
                    <p className="text-gray-600">
                      Complete your team details (2 persons per team)
                    </p>
                  </div>
                  
                  {/* Team Information */}
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-xl">👥</span>
                      Team Information (2 Persons)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Team Captain Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="participantName"
                          value={formData.participantName}
                          onChange={handleInputChange}
                          required
                          maxLength={25}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.participantName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Team captain name"
                        />
                        {errors.participantName && (
                          <p className="text-red-500 text-xs mt-1">{errors.participantName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Teammate Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="teammateName"
                          value={formData.teammateName}
                          onChange={handleInputChange}
                          required
                          maxLength={25}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.teammateName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Teammate name"
                        />
                        {errors.teammateName && (
                          <p className="text-red-500 text-xs mt-1">{errors.teammateName}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                          placeholder="Your address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Number 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="contactNumber1"
                          value={formData.contactNumber1}
                          onChange={handleInputChange}
                          required
                          maxLength={11}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.contactNumber1 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Number 2
                        </label>
                        <input
                          type="tel"
                          name="contactNumber2"
                          value={formData.contactNumber2}
                          onChange={handleInputChange}
                          maxLength={11}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.contactNumber2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleInputChange}
                          required
                          maxLength={11}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.whatsappNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="WhatsApp number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="zone"
                          value={formData.zone}
                          onChange={handleInputChange}
                          required
                          maxLength={15}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none ${
                            errors.zone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Zone"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Diocese <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="diocese"
                          value={formData.diocese}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                          placeholder="Diocese"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          How did you know about us? <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="howKnown"
                          value={formData.howKnown}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none mt-2"
                            placeholder="Please specify"
                          />
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Previous Quiz Participation <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={formData.previousParticipation}
                              onChange={() => handleCheckboxChange('previousParticipation', true)}
                              className="w-4 h-4 text-orange-400"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={!formData.previousParticipation}
                              onChange={() => handleCheckboxChange('previousParticipation', false)}
                              className="w-4 h-4 text-orange-400"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Registration Fee */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        Registration Fee
                      </h3>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2">{pricingSettings.pricingDescription}</p>
                        
                        {/* Amount Breakdown */}
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span>Team Registration (2 persons):</span>
                            <span className="font-semibold">€{amountBreakdown.pricePerTeam.toFixed(2)}</span>
                          </div>
                          {amountBreakdown.registrationFee > 0 && (
                            <div className="flex justify-between">
                              <span>Registration Fee:</span>
                              <span className="font-semibold">€{amountBreakdown.registrationFee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total Amount:</span>
                              <span className="text-green-600">€{amountBreakdown.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800 text-center">
                          <strong>Note:</strong> Registration for 2 people (1 team)
                        </p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-xl">💳</span>
                          Payment Method
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Payment Method <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="paymentLinkUsed"
                            value={formData.paymentLinkUsed}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
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
                          <div className="text-center bg-white p-4 rounded-lg mt-4">
                            <div className="mb-3">
                              <p className="text-sm text-gray-600">Amount to Pay</p>
                              <p className="text-2xl font-bold text-gray-800">€{amountBreakdown.total.toFixed(2)}</p>
                            </div>
                            <a
                              href={formData.paymentLinkUsed}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all font-semibold"
                            >
                              Pay Now - €{amountBreakdown.total.toFixed(2)}
                              <ArrowRight className="w-4 h-4" />
                            </a>
                            <p className="text-xs text-gray-600 mt-2">
                              Upload payment screenshot below
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Screenshot Upload */}
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-xl">📸</span>
                          Payment Proof
                        </h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white cursor-pointer hover:border-blue-400 transition-all">
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
                              <div className="space-y-2">
                                <img 
                                  src={screenshotPreview} 
                                  alt="Screenshot preview" 
                                  className="max-h-48 mx-auto rounded-lg"
                                />
                                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                  <Check className="w-5 h-5" />
                                  <span className="text-sm">{screenshot.name}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                <div>
                                  <p className="text-gray-700 font-semibold">
                                    Click to upload screenshot
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG up to 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Complete}
                      className="bg-gradient-to-r from-orange-400 to-amber-400 text-white py-4 px-8 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center justify-center gap-2 mx-auto"
                    >
                      Review & Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    {!isStep1Complete && (
                      <p className="text-sm text-gray-500 mt-2">
                        Please complete all required fields
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                      Review Your Team Registration
                    </h2>
                    <p className="text-gray-600">
                      Please verify all information before submitting
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Information */}
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        Team Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Team Captain</span>
                            <p className="text-gray-900 font-semibold">{formData.participantName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Teammate</span>
                            <p className="text-gray-900 font-semibold">{formData.teammateName}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Address</span>
                          <p className="text-gray-900 font-semibold">{formData.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Contact</span>
                            <p className="text-gray-900 font-semibold text-sm">
                              {formData.contactNumber1} 
                              {formData.contactNumber2 && `, ${formData.contactNumber2}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">WhatsApp</span>
                            <p className="text-gray-900 font-semibold text-sm">{formData.whatsappNumber}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                          <p className="text-gray-900 font-semibold text-sm break-all">{formData.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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

                    {/* Registration Details */}
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🎫</span>
                        Registration Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">How You Heard</span>
                          <p className="text-gray-900 font-semibold">
                            {formData.howKnown} {formData.otherHowKnown && `(${formData.otherHowKnown})`}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Previous Participation</span>
                          <p className="text-gray-900 font-semibold">
                            {formData.previousParticipation ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Registration Type</span>
                          <p className="text-gray-900 font-semibold">Team (2 people)</p>
                        </div>
                        
                        {/* Amount Breakdown in Review */}
                        <div className="pt-3 border-t border-purple-200">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Team Registration:</span>
                              <span className="font-semibold">€{amountBreakdown.pricePerTeam.toFixed(2)}</span>
                            </div>
                            {amountBreakdown.registrationFee > 0 && (
                              <div className="flex justify-between">
                                <span>Registration Fee:</span>
                                <span className="font-semibold">€{amountBreakdown.registrationFee.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-gray-200 pt-1 mt-1">
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total Amount:</span>
                                <span className="text-green-600">€{amountBreakdown.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Payment Method</span>
                          <p className="text-gray-900 font-semibold text-sm break-all">{formData.paymentLinkUsed}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Screenshot</span>
                          <p className="text-gray-900 font-semibold text-sm">{screenshot?.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  {screenshotPreview && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📸</span>
                        Payment Screenshot
                      </h4>
                      <div className="flex justify-center">
                        <img 
                          src={screenshotPreview} 
                          alt="Screenshot preview" 
                          className="max-h-80 w-auto rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2 border border-gray-300"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Edit
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirm & Submit
                        </>
                      )}
                    </button>
                  </div>

                  {/* Final Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-amber-900 font-semibold flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl">🎫</span>
                      Registration Confirmation
                    </p>
                    <p className="text-amber-800 text-sm">
                      Your team registration will be confirmed after verification. Team ID will be sent to your email.
                      <br />
                      Questions? Contact: <span className="font-bold">{contactPhone}</span>
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Copyright Footer */}
          <div className="bg-gray-100 border-t border-gray-200 py-6 px-8 text-center">
            <div className="text-gray-600 text-sm">
              <p>&copy; {new Date().getFullYear()} {orgName || 'Fedus'}. All rights reserved.</p>
              <p className="mt-1 text-gray-500 text-xs">
                Team Registration System | Designed for seamless event management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;