import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Account Management Component with Advanced Filtering
const AccountManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [services, setServices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Enhanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    accountId: '',
    accountName: '',
    status: 'all',
    businessType: 'all'
  });
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    accountId: '',
    accountName: '',
    status: 'all',
    businessType: 'all'
  });
  
  // Advanced Search Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  
  const [formData, setFormData] = useState({
    profile_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    business_type: '',
    tax_id: '',
    deposit_paid: 0
  });

  useEffect(() => {
    fetchAccounts();
    fetchProfiles();
    fetchServices();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${API}/profiles`);
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAccount) {
        // Update account
        await axios.put(`${API}/accounts/${editingAccount.id}`, formData);
      } else {
        // Create new account
        await axios.post(`${API}/accounts`, formData);
      }
      
      fetchAccounts();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      profile_id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      business_type: '',
      tax_id: '',
      deposit_paid: 0
    });
    setShowAddForm(false);
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setFormData(account);
    setEditingAccount(account);
    setShowAddForm(true);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      accountId: '',
      accountName: '',
      status: 'all',
      businessType: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  // Apply filters function
  const applyFilters = () => {
    console.log('Applying account filters:', filters);
    setAppliedFilters({...filters});
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Count services under each account
  const getServiceCount = (accountId) => {
    return services.filter(service => service.account_id === accountId).length;
  };

  // Get profile info for account
  const getProfileInfo = (profileId) => {
    return profiles.find(profile => profile.id === profileId);
  };

  // Enhanced filtering and sorting logic - now using appliedFilters
  const filteredAndSortedAccounts = accounts
    .filter(account => {
      const matchesSearch = !appliedFilters.searchTerm || 
        account.name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        account.phone.includes(appliedFilters.searchTerm);
      
      const matchesAccountId = !appliedFilters.accountId || account.id.includes(appliedFilters.accountId);
      const matchesAccountName = !appliedFilters.accountName || account.name.toLowerCase().includes(appliedFilters.accountName.toLowerCase());
      const matchesStatus = appliedFilters.status === 'all' || 
        (appliedFilters.status === 'active' && account.is_active) ||
        (appliedFilters.status === 'inactive' && !account.is_active);
      const matchesBusinessType = appliedFilters.businessType === 'all' || account.business_type === appliedFilters.businessType;
      
      return matchesSearch && matchesAccountId && matchesAccountName && matchesStatus && matchesBusinessType;
    })
    .sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      
      switch (sorting.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'phone':
          return direction * a.phone.localeCompare(b.phone);
        case 'city':
          return direction * a.city.localeCompare(b.city);
        case 'deposit_paid':
          return direction * (a.deposit_paid - b.deposit_paid);
        case 'created_at':
        default:
          return direction * (new Date(a.created_at) - new Date(b.created_at));
      }
    });

  const uniqueBusinessTypes = [...new Set(accounts.map(a => a.business_type))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Account Management</h2>
          <p className="text-slate-600 mt-2 text-base">Manage customer accounts and billing information with advanced filtering</p>
        </div>
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-base"
            data-testid="add-account-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Account</span>
            </div>
          </button>
        )}
      </div>

      {/* Enhanced Filters and Search with Apply Button */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-slate-800">Search & Filter Accounts</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAdvancedSearch}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                showAdvancedFilters
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              data-testid="toggle-advanced-search"
            >
              {showAdvancedFilters ? 'Simple Search' : 'Advanced Search'}
            </button>
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200"
              data-testid="clear-all-filters"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Always Visible - First 3 Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* General Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Search</label>
            <input
              type="text"
              placeholder="Name, email, or phone..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="account-search"
            />
          </div>
          
          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="account-status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          
          {/* Business Type Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Business Type</label>
            <select
              value={filters.businessType}
              onChange={(e) => setFilters({...filters, businessType: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="account-business-type-filter"
            >
              <option value="all">All Types</option>
              {uniqueBusinessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account ID Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Account ID</label>
                <input
                  type="text"
                  placeholder="Filter by account ID..."
                  value={filters.accountId}
                  onChange={(e) => setFilters({...filters, accountId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="account-id-filter"
                />
              </div>
              
              {/* Account Name Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Account Name</label>
                <input
                  type="text"
                  placeholder="Filter by account name..."
                  value={filters.accountName}
                  onChange={(e) => setFilters({...filters, accountName: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="account-name-filter"
                />
              </div>
            </div>
          </div>
        )}

        {/* Apply Filter Button */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
              data-testid="apply-account-filters-btn"
            >
              Apply Filters
            </button>
            {(JSON.stringify(filters) !== JSON.stringify(appliedFilters)) && (
              <span className="text-sm text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-lg font-medium border border-amber-300 shadow-sm">
                Filters changed - Click Apply
              </span>
            )}
          </div>
          {(appliedFilters.searchTerm || appliedFilters.accountId || appliedFilters.accountName || appliedFilters.status !== 'all' || appliedFilters.businessType !== 'all') && (
            <span className="text-sm text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 px-3 py-1 rounded-lg font-medium border border-emerald-300 shadow-sm">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Accounts Table with Enhanced Sorting */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">All Accounts ({filteredAndSortedAccounts.length})</h3>
              <p className="text-slate-600 mt-1 text-base">Customer accounts with service counts and enhanced sorting</p>
            </div>
            <div className="text-base text-slate-500">
              Showing {filteredAndSortedAccounts.length} of {accounts.length} accounts
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Account</span>
                    {sorting.field === 'name' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Contact</span>
                    {sorting.field === 'email' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('city')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Location</span>
                    {sorting.field === 'city' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('deposit_paid')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Deposit</span>
                    {sorting.field === 'deposit_paid' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Services</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedAccounts.map((account) => {
                const profileInfo = getProfileInfo(account.profile_id);
                return (
                  <tr key={account.id} className="hover:bg-slate-50/60 transition-colors" data-testid={`account-row-${account.id}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-base">{account.name}</div>
                          <div className="text-slate-600 text-sm">{account.business_type || 'Business Account'}</div>
                          <div className="text-slate-400 text-xs font-mono">{account.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base">
                        <div className="text-slate-900 font-medium">{account.email}</div>
                        <div className="text-slate-600 text-sm">{account.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base">
                        <div className="text-slate-900 font-medium">{account.city}</div>
                        <div className="text-slate-600 text-sm">{account.state} {account.zipcode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base text-slate-900 font-semibold">
                      ${account.deposit_paid.toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-base font-bold text-blue-700">{getServiceCount(account.id)}</span>
                        </div>
                        <span className="text-sm text-slate-600 font-medium">services</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {profileInfo ? (
                        <div className="text-base">
                          <div className="text-slate-900 font-medium">{profileInfo.name}</div>
                          <div className="text-slate-600 text-sm">{profileInfo.profession}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No profile linked</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                        account.is_active 
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 border border-emerald-300' 
                          : 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border border-red-300'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => handleEdit(account)}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors" 
                          data-testid={`edit-account-${account.id}`}
                        >
                          Edit
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors" data-testid={`view-account-${account.id}`}>
                          View
                        </button>
                        {user.role === 'super_admin' && (
                          <button className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors" data-testid={`delete-account-${account.id}`}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Account Modal with Fixed Header/Footer */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingAccount ? 'Edit Account' : 'Create New Account'}
                  </h3>
                  <p className="text-blue-100 mt-1">
                    {editingAccount ? 'Update account details and billing information' : 'Set up a new customer account with complete onboarding'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  data-testid="close-account-modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form className="p-8">
                {/* Profile Selection */}
                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Link to Profile</h4>
                  <select
                    value={formData.profile_id}
                    onChange={(e) => setFormData({...formData, profile_id: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    data-testid="account-form-profile"
                  >
                    <option value="">Select Profile</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} - {profile.email} ({profile.profession})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Information */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Account Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Business Type</label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="account-form-business-type"
                      >
                        <option value="">Select Type</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Retail Store">Retail Store</option>
                        <option value="Office Building">Office Building</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Hospital">Hospital</option>
                        <option value="School">School</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Tax ID</label>
                      <input
                        type="text"
                        value={formData.tax_id}
                        onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="XX-XXXXXXX"
                        data-testid="account-form-tax-id"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Business Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Street Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-city"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">State *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-state"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">ZIP Code *</label>
                      <input
                        type="text"
                        value={formData.zipcode}
                        onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="account-form-zipcode"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Security Deposit Paid</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.deposit_paid}
                        onChange={(e) => setFormData({...formData, deposit_paid: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="account-form-deposit"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl border border-green-300 text-sm font-medium">
                        Deposit will be calculated based on selected service plans
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium disabled:opacity-50"
                  data-testid="account-form-submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingAccount ? 'Updating Account...' : 'Creating Account...'}
                    </div>
                  ) : (
                    editingAccount ? 'Update Account' : 'Create Account'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="account-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;