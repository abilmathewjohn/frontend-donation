import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

const DonationForm = () => {
  const [step, setStep] = useState(1);
  const [ticketPrice, setTicketPrice] = useState(2.00);
  const [tickets, setTickets] = useState(1);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [contactPhone, setContactPhone] = useState('+3XXXXXXXXX');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    paymentLinkUsed: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTicketPrice();
    fetchPaymentLinks();
    fetchContactPhone();
  }, []);

  const fetchTicketPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/donations/ticket-price`);
      setTicketPrice(Number(response.data.ticketPrice) || 2.00);
    } catch (error) {
      console.error('Error fetching ticket price:', error);
      setTicketPrice(2.00);
    }
  };

  const fetchPaymentLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-links/active`);
      setPaymentLinks(response.data);
    } catch (error) {
      console.error('Error fetching payment links:', error);
    }
  };

  const fetchContactPhone = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`);
      if (response.data) {
        setContactPhone(response.data.contactPhone);
      }
    } catch (error) {
      console.error('Error fetching contact phone:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    submitData.append('tickets', tickets);
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
      
      alert('Donation submitted successfully! Tickets will be sent to your email after confirmation.');
      
      setStep(1);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        paymentLinkUsed: '',
      });
      setTickets(1);
      setScreenshot(null);
      setScreenshotPreview(null);
    } catch (error) {
      console.error('Error submitting donation:', error);
      let errorMessage = 'Error submitting donation. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = tickets * ticketPrice;
  const ticketPercentage = (tickets / 50) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Donation Form</h1>
            <p className="text-blue-100 text-center mt-2 text-sm sm:text-base">Support our cause with your generous contribution</p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            {/* Progress Steps */}
            <div className="mb-8 sm:mb-12">
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                  <div 
                    className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  ></div>
                </div>
                
                {[
                  { num: 1, label: 'Your Info', icon: '👤' },
                  { num: 2, label: 'Payment', icon: '💳' },
                  { num: 3, label: 'Confirm', icon: '✓' }
                ].map((stepInfo) => (
                  <div key={stepInfo.num} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        step > stepInfo.num
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 shadow-lg scale-110'
                          : step === stepInfo.num
                          ? 'bg-white border-blue-600 shadow-lg scale-110'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {step > stepInfo.num ? (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <span className={`text-lg sm:text-xl ${step === stepInfo.num ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                          {stepInfo.icon}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm mt-2 font-medium text-center ${
                      step >= stepInfo.num ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {stepInfo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      Your Information
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Tell us a bit about yourself</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                        placeholder="+1234567890"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  {/* Enhanced Ticket Selector */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                    <label className="block text-sm font-semibold text-gray-800 mb-4 text-center">
                      Select Number of Tickets
                    </label>
                    
                    {/* Visual Progress Bar */}
                    <div className="mb-6">
                      <div className="relative h-12 bg-white rounded-xl shadow-inner overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out flex items-center justify-end px-4"
                          style={{ width: `${ticketPercentage}%` }}
                        >
                          {ticketPercentage > 15 && (
                            <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap">
                              {tickets} {tickets === 1 ? 'Ticket' : 'Tickets'}
                            </span>
                          )}
                        </div>
                        {ticketPercentage <= 15 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-600 font-bold text-sm sm:text-base">
                              {tickets} {tickets === 1 ? 'Ticket' : 'Tickets'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={tickets}
                      onChange={(e) => setTickets(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(99 102 241) ${ticketPercentage}%, rgb(229 231 235) ${ticketPercentage}%, rgb(229 231 235) 100%)`
                      }}
                    />
                    
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-3 mb-6">
                      <span>1</span>
                      <span>25</span>
                      <span>50</span>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        €{totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">€{ticketPrice.toFixed(2)} per ticket</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.fullName || !formData.email || !formData.phone || !formData.location}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base sm:text-lg flex items-center justify-center gap-2 group"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      Payment Information
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Complete your payment securely</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentLinkUsed"
                      value={formData.paymentLinkUsed}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none bg-white"
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
                    <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 rounded-2xl border-2 border-green-200">
                      <div className="mb-6">
                        <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-lg">
                          <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                          <div className="text-3xl sm:text-4xl font-bold text-gray-800">
                            €{totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {tickets} ticket{tickets > 1 ? 's' : ''} × €{ticketPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <a
                        href={formData.paymentLinkUsed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-base sm:text-lg"
                      >
                        Pay Now - €{totalAmount.toFixed(2)}
                        <ArrowRight className="w-5 h-5" />
                      </a>
                      <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
                        After completing payment, take a screenshot and upload it below
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition duration-200 bg-gray-50">
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
                              className="max-h-64 mx-auto rounded-xl shadow-lg"
                            />
                            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                              <Check className="w-5 h-5" />
                              <span className="text-sm sm:text-base">{screenshot.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
                            <div>
                              <p className="text-gray-700 font-medium text-sm sm:text-base">
                                Click to upload screenshot
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                PNG, JPG, JPEG up to 5MB
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!screenshot || !formData.paymentLinkUsed}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2 group"
                    >
                      Review & Submit
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      Review Your Donation
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Please verify all information before submitting</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Name</span>
                          <p className="text-gray-900 font-medium">{formData.fullName}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                          <p className="text-gray-900 font-medium break-all">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                          <p className="text-gray-900 font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Location</span>
                          <p className="text-gray-900 font-medium">{formData.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎫</span>
                        Donation Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Tickets</span>
                          <p className="text-gray-900 font-medium">{tickets} {tickets === 1 ? 'ticket' : 'tickets'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Total Amount</span>
                          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            €{totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Payment Method</span>
                          <p className="text-gray-900 font-medium text-sm break-all">{formData.paymentLinkUsed}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Screenshot</span>
                          <p className="text-gray-900 font-medium text-sm">{screenshot?.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {screenshotPreview && (
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">📸</span>
                        Payment Screenshot
                      </h4>
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot preview" 
                        className="max-h-80 w-full object-contain rounded-xl shadow-md"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-6 h-6" />
                          Submit Donation
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
                    <p className="text-amber-900 font-semibold text-base sm:text-lg flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">🎫</span>
                      Tickets will be sent after confirmation
                    </p>
                    <p className="text-amber-800 text-sm">
                      Any questions? Please contact: <span className="font-semibold">{contactPhone}</span>
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: none;
          transition: transform 0.2s;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default DonationForm;