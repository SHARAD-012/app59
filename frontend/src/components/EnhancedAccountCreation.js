import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedAccountCreation = ({ AuthContext, onClose, onAccountCreated }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  
  // Form state
  const [accountData, setAccountData] = useState({
    // Role-based selection
    creation_type: 'self', // 'self' or 'user' (only for admin/parent users)
    profile_id: '',
    
    // Account details
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    business_type: '',
    tax_id: '',
    deposit_paid: 0.0,
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProfiles(response.data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['profile_id', 'name', 'email', 'phone', 'address', 'city', 'state', 'zipcode'];
      const newErrors = {};
      
      requiredFields.forEach(field => {
        if (!accountData[field]) {
          newErrors[field] = 'This field is required';
        }
      });

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (accountData.email && !emailRegex.test(accountData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const accountPayload = {
        profile_id: accountData.profile_id,
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        address: accountData.address,
        city: accountData.city,
        state: accountData.state,
        zipcode: accountData.zipcode,
        business_type: accountData.business_type || 'General',
        tax_id: accountData.tax_id || null,
        deposit_paid: parseFloat(accountData.deposit_paid) || 0.0,
        is_active: accountData.is_active
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/accounts`, accountPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Account created successfully:', response.data);
      alert('Account created successfully!');
      
      if (onAccountCreated) {
        onAccountCreated(response.data);
      }
      
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error creating account:', error);
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Error creating account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles based on creation type
  const getAvailableProfiles = () => {
    if (accountData.creation_type === 'self') {
      // For self, show profiles that the user can access
      return profiles.filter(profile => 
        profile.created_by === user.id || 
        (user.role === 'admin' || user.role === 'super_admin')
      );
    } else {
      // For user, show all available profiles
      return profiles;
    }
  };

  // Check if user can create for others (admin/super_admin only)
  const canCreateForOthers = user.role === 'admin' || user.role === 'super_admin';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Create New Account</h3>
              <p className="text-blue-100 mt-1">Add a new account to the system</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role-based Account Type Selection */}
          {canCreateForOthers && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-md font-semibold text-slate-800 mb-3">Account Creation Type</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="creation_type"
                    value="self"
                    checked={accountData.creation_type === 'self'}
                    onChange={(e) => setAccountData({...accountData, creation_type: e.target.value})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <div className="font-medium text-slate-800">Self Account</div>
                    <div className="text-sm text-slate-600">Create account for yourself</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="creation_type"
                    value="user"
                    checked={accountData.creation_type === 'user'}
                    onChange={(e) => setAccountData({...accountData, creation_type: e.target.value})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <div className="font-medium text-slate-800">User Account</div>
                    <div className="text-sm text-slate-600">Create account for a user</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Profile Selection */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-3">Profile Selection</h4>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {accountData.creation_type === 'self' ? 'Select Your Profile' : 'Select User Profile'} *
              </label>
              <select
                value={accountData.profile_id}
                onChange={(e) => setAccountData({...accountData, profile_id: e.target.value})}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.profile_id ? 'border-red-500' : 'border-slate-300'
                }`}
                required
              >
                <option value="">Select a profile...</option>
                {getAvailableProfiles().map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.profession}
                  </option>
                ))}
              </select>
              {errors.profile_id && <p className="text-red-500 text-sm">{errors.profile_id}</p>}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="text-md font-semibold text-slate-800 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Account Name *</label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter account name..."
                  required
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Email *</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter email address..."
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Phone *</label>
                <input
                  type="tel"
                  value={accountData.phone}
                  onChange={(e) => setAccountData({...accountData, phone: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter phone number..."
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Business Type</label>
                <input
                  type="text"
                  value={accountData.business_type}
                  onChange={(e) => setAccountData({...accountData, business_type: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare..."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Address *</label>
                <input
                  type="text"
                  value={accountData.address}
                  onChange={(e) => setAccountData({...accountData, address: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter street address..."
                  required
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">City *</label>
                <input
                  type="text"
                  value={accountData.city}
                  onChange={(e) => setAccountData({...accountData, city: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter city..."
                  required
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">State *</label>
                <input
                  type="text"
                  value={accountData.state}
                  onChange={(e) => setAccountData({...accountData, state: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter state..."
                  required
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">ZIP Code *</label>
                <input
                  type="text"
                  value={accountData.zipcode}
                  onChange={(e) => setAccountData({...accountData, zipcode: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.zipcode ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter ZIP code..."
                  required
                />
                {errors.zipcode && <p className="text-red-500 text-sm">{errors.zipcode}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Tax ID</label>
                <input
                  type="text"
                  value={accountData.tax_id}
                  onChange={(e) => setAccountData({...accountData, tax_id: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tax ID (optional)..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Initial Deposit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={accountData.deposit_paid}
                  onChange={(e) => setAccountData({...accountData, deposit_paid: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountData.is_active}
                    onChange={(e) => setAccountData({...accountData, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-700">Active Account</span>
                </label>
                <p className="text-xs text-slate-500">Uncheck to create an inactive account</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedAccountCreation;