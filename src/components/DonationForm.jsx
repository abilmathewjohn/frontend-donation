import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      setTicketPrice(response.data.ticketPrice);
    } catch (error) {
      console.error('Error fetching ticket price:', error);
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
      
      // Reset form
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
            
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= stepNumber
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="text-sm mt-2 font-medium text-gray-600">
                  {stepNumber === 1 && 'Your Info'}
                  {stepNumber === 2 && 'Payment'}
                  {stepNumber === 3 && 'Confirm'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Information</h2>
                  <p className="text-gray-600">Please provide your details to proceed with the donation</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Number of Tickets (1-50)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={tickets}
                    onChange={(e) => setTickets(parseInt(e.target.value))}
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span>1 Ticket</span>
                    <span className="font-semibold text-lg">{tickets} Tickets</span>
                    <span>50 Tickets</span>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-2xl font-bold text-blue-600">
                      Total: €{totalAmount.toFixed(2)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">€{ticketPrice} per ticket</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.fullName || !formData.email || !formData.phone || !formData.location}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Information</h2>
                  <p className="text-gray-600">Complete your payment and upload the confirmation</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Payment Method
                  </label>
                  <select
                    name="paymentLinkUsed"
                    value={formData.paymentLinkUsed}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                  <div className="text-center bg-green-50 p-6 rounded-xl border-2 border-green-200">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-800 mb-2">
                        €{totalAmount.toFixed(2)}
                      </div>
                      <div className="text-gray-600">
                        {tickets} ticket{tickets > 1 ? 's' : ''} × €{ticketPrice}
                      </div>
                    </div>
                    <a
                      href={formData.paymentLinkUsed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white py-4 px-8 rounded-xl hover:bg-green-700 transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                    >
                      Pay Now - €{totalAmount.toFixed(2)}
                    </a>
                    <p className="text-sm text-gray-600 mt-4">
                      You will be redirected to the payment page. After completing the payment, please take a screenshot and upload it below.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Payment Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      required
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label htmlFor="screenshot-upload" className="cursor-pointer">
                      {screenshotPreview ? (
                        <div className="space-y-4">
                          <img 
                            src={screenshotPreview} 
                            alt="Screenshot preview" 
                            className="max-h-48 mx-auto rounded-lg shadow-md"
                          />
                          <p className="text-green-600 font-semibold">
                            ✓ Screenshot selected: {screenshot.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-4xl">📸</div>
                          <p className="text-gray-600">
                            Click to upload payment confirmation screenshot
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-xl hover:bg-gray-600 transition duration-200 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!screenshot || !formData.paymentLinkUsed}
                    className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
                  >
                    Review & Submit
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Your Donation</h2>
                  <p className="text-gray-600">Please verify your information before submitting</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Name:</span>
                        <p className="text-gray-900">{formData.fullName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <p className="text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Location:</span>
                        <p className="text-gray-900">{formData.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Donation Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Tickets:</span>
                        <p className="text-gray-900">{tickets}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Amount:</span>
                        <p className="text-2xl font-bold text-blue-600">€{totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Payment Method:</span>
                        <p className="text-gray-900 truncate">{formData.paymentLinkUsed}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Screenshot:</span>
                        <p className="text-gray-900">{screenshot?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {screenshotPreview && (
                  <div className="bg-white p-4 rounded-xl border">
                    <h4 className="font-semibold text-gray-700 mb-3">Screenshot Preview:</h4>
                    <img 
                      src={screenshotPreview} 
                      alt="Screenshot preview" 
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-xl hover:bg-gray-600 transition duration-200 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Donation'
                    )}
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-yellow-800 font-semibold">
                    🎫 Tickets will be sent to your email after we confirm your payment.
                  </p>
                  <p className="text-yellow-700 mt-2">
                    Any questions? Please contact: {contactPhone}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;