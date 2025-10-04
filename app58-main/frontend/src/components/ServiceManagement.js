import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import EnhancedServiceCreation from './EnhancedServiceCreation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Service Management Component with Professional Styling and Improved Font Sizes
const ServiceManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Enhanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    serviceId: '',
    serviceName: '',
    serviceType: 'all',
    planStatus: 'all',
    profileId: '',
    accountId: ''
  });
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    serviceId: '',
    serviceName: '',
    serviceType: 'all',
    planStatus: 'all',
    profileId: '',
    accountId: ''
  });

  // Advanced filters toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  
  const [formData, setFormData] = useState({
    account_id: '',
    plan_id: '',
    service_name: '',
    service_description: '',
    custom_price: null,
    start_date: new Date().toISOString().split('T')[0],
    service_address: '',
    installation_notes: ''
  });

  const [onboardingData, setOnboardingData] = useState({
    selectedAccount: null,
    selectedPlan: null,
    serviceDetails: {
      service_name: '',
      service_description: '',
      service_address: '',
      installation_notes: '',
      custom_price: null,
      start_date: new Date().toISOString().split('T')[0]
    },
    step: 1
  });

  useEffect(() => {
    fetchServices();
    fetchPlans();
    fetchAccounts();
    fetchProfiles();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        custom_price: formData.custom_price ? parseFloat(formData.custom_price) : null,
        start_date: new Date(formData.start_date).toISOString(),
      };

      if (editingService) {
        await axios.put(`${API}/services/${editingService.id}`, serviceData);
      } else {
        await axios.post(`${API}/services`, serviceData);
      }
      
      fetchServices();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      const serviceData = {
        account_id: onboardingData.selectedAccount.id,
        plan_id: onboardingData.selectedPlan.id,
        ...onboardingData.serviceDetails,
        custom_price: onboardingData.serviceDetails.custom_price ? parseFloat(onboardingData.serviceDetails.custom_price) : null,
        start_date: new Date(onboardingData.serviceDetails.start_date).toISOString(),
      };

      await axios.post(`${API}/services`, serviceData);
      
      fetchServices();
      resetOnboarding();
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_id: '',
      plan_id: '',
      service_name: '',
      service_description: '',
      custom_price: null,
      start_date: new Date().toISOString().split('T')[0],
      service_address: '',
      installation_notes: ''
    });
    setShowCreateForm(false);
    setEditingService(null);
    setSelectedPlan(null);
  };

  const resetOnboarding = () => {
    setOnboardingData({
      selectedAccount: null,
      selectedPlan: null,
      serviceDetails: {
        service_name: '',
        service_description: '',
        service_address: '',
        installation_notes: '',
        custom_price: null,
        start_date: new Date().toISOString().split('T')[0]
      },
      step: 1
    });
    setShowOnboardingFlow(false);
  };

  const handleEdit = (service) => {
    setFormData({
      account_id: service.account_id,
      plan_id: service.plan_id,
      service_name: service.service_name || '',
      service_description: service.service_description || '',
      custom_price: service.custom_price,
      start_date: new Date(service.start_date).toISOString().split('T')[0],
      service_address: service.service_address,
      installation_notes: service.installation_notes
    });
    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailView(true);
  };

  // Apply filters function
  const applyFilters = () => {
    console.log('Applying service filters:', filters);
    setAppliedFilters({...filters});
  };

  // Clear filters function
  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      serviceId: '',
      serviceName: '',
      serviceType: 'all',
      planStatus: 'all',
      profileId: '',
      accountId: ''
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  // Toggle advanced filters
  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get appropriate plans based on service type, profile, and plan status
  const getFilteredPlans = (serviceType = '', profileId = '', planStatus = '') => {
    return plans.filter(plan => {
      const matchesServiceType = !serviceType || serviceType === 'all' || plan.service_type === serviceType;
      const matchesPlanStatus = !planStatus || planStatus === 'all' || plan.status === planStatus;
      
      // For profile-based filtering, check if plan is available for the profile's role
      const matchesProfile = !profileId || profileId === 'all' || (
        plan.assigned_to_role === 'user' || 
        (plan.assigned_to_role === 'admin' && ['admin', 'super_admin'].includes(user.role))
      );
      
      return matchesServiceType && matchesPlanStatus && matchesProfile;
    });
  };

  const getServiceTypeColor = (type) => {
    const colors = {
      electricity: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border border-yellow-300 shadow-sm',
      water: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border border-blue-300 shadow-sm',
      gas: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border border-orange-300 shadow-sm',
      internet: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border border-purple-300 shadow-sm',
      saas: 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300 shadow-sm',
      facility: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border border-gray-300 shadow-sm',
      other: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-900 border border-pink-300 shadow-sm'
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 border border-emerald-300 shadow-sm'
      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border border-red-300 shadow-sm';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border border-red-300',
      medium: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border border-amber-300',
      low: 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const calculateTotalCost = (plan, customPrice) => {
    const basePrice = customPrice || plan?.base_price || 0;
    const setupFee = plan?.setup_fee || 0;
    return basePrice + setupFee;
  };

  // Enhanced filtering and sorting logic - now using appliedFilters
  const filteredAndSortedServices = services
    .filter(service => {
      const matchesSearch = !appliedFilters.searchTerm || 
        service.service_name?.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        service.service_address?.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        service.account?.name?.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase());
      
      const matchesServiceId = !appliedFilters.serviceId || service.id.includes(appliedFilters.serviceId);
      const matchesServiceName = !appliedFilters.serviceName || service.service_name?.toLowerCase().includes(appliedFilters.serviceName.toLowerCase());
      const matchesServiceType = appliedFilters.serviceType === 'all' || service.plan?.service_type === appliedFilters.serviceType;
      const matchesPlanStatus = appliedFilters.planStatus === 'all' || service.plan?.status === appliedFilters.planStatus;
      const matchesProfileId = !appliedFilters.profileId || service.account?.profile_id === appliedFilters.profileId;
      const matchesAccountId = !appliedFilters.accountId || service.account_id === appliedFilters.accountId;
      
      return matchesSearch && matchesServiceId && matchesServiceName && matchesServiceType && matchesPlanStatus && matchesProfileId && matchesAccountId;
    })
    .sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      
      switch (sorting.field) {
        case 'service_name':
          return direction * (a.service_name || '').localeCompare(b.service_name || '');
        case 'service_type':
          return direction * (a.plan?.service_type || '').localeCompare(b.plan?.service_type || '');
        case 'price':
          return direction * ((a.custom_price || a.plan?.base_price || 0) - (b.custom_price || b.plan?.base_price || 0));
        case 'start_date':
          return direction * (new Date(a.start_date) - new Date(b.start_date));
        case 'created_at':
        default:
          return direction * (new Date(a.created_at) - new Date(b.created_at));
      }
    });

  const uniqueServiceTypes = [...new Set(plans.map(p => p.service_type))].filter(Boolean);
  const uniquePlanStatuses = [...new Set(plans.map(p => p.status))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            {user.role === 'user' ? 'My Services' : 'Service Management'}
          </h2>
          <p className="text-slate-600 mt-2 text-base">
            {user.role === 'user' 
              ? 'Manage your active services and subscriptions with advanced filtering' 
              : 'Create and manage customer services with intelligent plan selection'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowEnhancedCreation(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-base"
            data-testid="create-service-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Create Service</span>
            </div>
          </button>
          <button 
            onClick={() => setShowOnboardingFlow(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-base"
            data-testid="start-onboarding-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Quick Onboarding</span>
            </div>
          </button>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-base"
            data-testid="add-service-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Simple Add</span>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Filters with Professional Styling */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-slate-800">Search & Filter Services</h4>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAdvancedSearch}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${showAdvancedFilters
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              data-testid="toggle-advanced-filters"
            >
              {showAdvancedFilters ? 'Simple Search' : 'Advanced Filters'}
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200"
              data-testid="clear-all-service-filters"
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
              placeholder="Service name, address, account..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="service-search"
            />
          </div>
          
          {/* Service Type Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="service-type-filter"
            >
              <option value="all">All Types</option>
              {uniqueServiceTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          
          {/* Plan Status Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Plan Status</label>
            <select
              value={filters.planStatus}
              onChange={(e) => setFilters({...filters, planStatus: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="plan-status-filter"
            >
              <option value="all">All Status</option>
              {uniquePlanStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Service ID Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Service ID</label>
                <input
                  type="text"
                  placeholder="Filter by service ID..."
                  value={filters.serviceId}
                  onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="service-id-filter"
                />
              </div>
              
              {/* Service Name Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Service Name</label>
                <input
                  type="text"
                  placeholder="Filter by service name..."
                  value={filters.serviceName}
                  onChange={(e) => setFilters({...filters, serviceName: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="service-name-filter"
                />
              </div>
              
              {/* Profile Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Profile</label>
                <select
                  value={filters.profileId}
                  onChange={(e) => setFilters({...filters, profileId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="profile-filter"
                >
                  <option value="">All Profiles</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Account Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Account</label>
                <select
                  value={filters.accountId}
                  onChange={(e) => setFilters({...filters, accountId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="account-filter"
                >
                  <option value="">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Apply Filter Button */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
              data-testid="apply-service-filters-btn"
            >
              Apply Filters
            </button>
            {(JSON.stringify(filters) !== JSON.stringify(appliedFilters)) && (
              <span className="text-sm text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-lg font-medium border border-amber-300">
                Filters changed - Click Apply
              </span>
            )}
          </div>
          {(appliedFilters.searchTerm || appliedFilters.serviceId || appliedFilters.serviceName || appliedFilters.serviceType !== 'all' || appliedFilters.planStatus !== 'all' || appliedFilters.profileId || appliedFilters.accountId) && (
            <span className="text-sm text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 px-3 py-1 rounded-lg font-medium border border-emerald-300">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Services Table with Enhanced Professional Styling */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">All Services ({filteredAndSortedServices.length})</h3>
              <p className="text-slate-600 mt-1 text-base">Services with intelligent filtering and sorting capabilities</p>
            </div>
            <div className="text-base text-slate-500">
              Showing {filteredAndSortedServices.length} of {services.length} services
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('service_name')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Service</span>
                    {sorting.field === 'service_name' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('service_type')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Type</span>
                    {sorting.field === 'service_type' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Price</span>
                    {sorting.field === 'price' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button
                    onClick={() => handleSort('start_date')}
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900"
                  >
                    <span>Start Date</span>
                    {sorting.field === 'start_date' && (
                      <svg className={`w-4 h-4 ${sorting.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Account</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/60 transition-colors" data-testid={`service-row-${service.id}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-md">
                        {(service.service_name || service.plan?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-base">{service.service_name || service.plan?.name || 'Service Plan'}</div>
                        <div className="text-slate-600 text-sm">{service.service_address}</div>
                        <div className="text-slate-400 text-xs font-mono">{service.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getServiceTypeColor(service.plan?.service_type)}`}>
                      {service.plan?.service_type?.charAt(0).toUpperCase() + (service.plan?.service_type?.slice(1) || '')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-base">
                      <div className="font-semibold text-slate-900">
                        ${service.custom_price || service.plan?.base_price || 0}/month
                      </div>
                      <div className="text-slate-600 text-sm">Setup: ${service.plan?.setup_fee || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-base text-slate-900">
                    {new Date(service.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    {service.account ? (
                      <div className="text-base">
                        <div className="text-slate-900 font-medium">{service.account.name}</div>
                        <div className="text-slate-600 text-sm">{service.account.business_type}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No account info</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(service.is_active)}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleEdit(service)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors" 
                        data-testid={`edit-service-${service.id}`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewDetails(service)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors" 
                        data-testid={`view-service-${service.id}`}
                      >
                        Details
                      </button>
                      {user.role === 'super_admin' && (
                        <button className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors" data-testid={`delete-service-${service.id}`}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Service Detail View Modal - Professional Design */}
      {showDetailView && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Service Details</h3>
                  <p className="text-slate-300 mt-1 text-base">Comprehensive service information and configuration</p>
                </div>
                <button 
                  onClick={() => setShowDetailView(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-8">
                {/* Service Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">Service Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Service Name</label>
                          <p className="text-base font-semibold text-slate-900">{selectedService.service_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Service ID</label>
                          <p className="text-sm font-mono text-slate-700">{selectedService.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Service Type</label>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getServiceTypeColor(selectedService.plan?.service_type)}`}>
                            {selectedService.plan?.service_type?.charAt(0).toUpperCase() + (selectedService.plan?.service_type?.slice(1) || '')}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Status</label>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusColor(selectedService.is_active)}`}>
                            {selectedService.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">Pricing Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Monthly Rate</label>
                          <p className="text-xl font-bold text-green-700">${selectedService.custom_price || selectedService.plan?.base_price || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Setup Fee</label>
                          <p className="text-base font-semibold text-slate-900">${selectedService.plan?.setup_fee || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Billing Frequency</label>
                          <p className="text-base text-slate-900 capitalize">{selectedService.plan?.billing_frequency || 'Monthly'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">Account Details</h4>
                      <div className="space-y-3">
                        {selectedService.account ? (
                          <>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Account Name</label>
                              <p className="text-base font-semibold text-slate-900">{selectedService.account.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Business Type</label>
                              <p className="text-base text-slate-900">{selectedService.account.business_type}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Contact Email</label>
                              <p className="text-base text-slate-900">{selectedService.account.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Phone</label>
                              <p className="text-base text-slate-900">{selectedService.account.phone}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-base text-slate-500">No account information available</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">Service Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Service Address</label>
                          <p className="text-base text-slate-900">{selectedService.service_address || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Start Date</label>
                          <p className="text-base text-slate-900">{new Date(selectedService.start_date).toLocaleDateString()}</p>
                        </div>
                        {selectedService.end_date && (
                          <div>
                            <label className="text-sm font-medium text-slate-600">End Date</label>
                            <p className="text-base text-slate-900">{new Date(selectedService.end_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(selectedService.service_description || selectedService.installation_notes) && (
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedService.service_description && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">Description</label>
                          <p className="text-base text-slate-900 mt-1">{selectedService.service_description}</p>
                        </div>
                      )}
                      {selectedService.installation_notes && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">Installation Notes</label>
                          <p className="text-base text-slate-900 mt-1">{selectedService.installation_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plan Information */}
                {selectedService.plan && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Plan Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Plan Name</label>
                        <p className="text-base font-semibold text-slate-900">{selectedService.plan.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Plan Description</label>
                        <p className="text-base text-slate-900">{selectedService.plan.description}</p>
                      </div>
                      {selectedService.plan.features && selectedService.plan.features.length > 0 && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600">Features</label>
                          <ul className="mt-2 space-y-1">
                            {selectedService.plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-base text-slate-900">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetailView(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailView(false);
                    handleEdit(selectedService);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-base"
                >
                  Edit Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the modals remain the same but with improved font sizes */}
      {/* Service Onboarding Flow - Enhanced with intelligent plan selection */}
      {showOnboardingFlow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Intelligent Service Onboarding</h3>
                  <p className="text-blue-100 mt-1 text-base">Smart plan selection based on service type, profile, and plan status</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-base">Step {onboardingData.step} of 3</div>
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className={`w-3 h-3 rounded-full ${step <= onboardingData.step ? 'bg-white' : 'bg-white/30'}`}></div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={resetOnboarding}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Step 1: Account Selection */}
              {onboardingData.step === 1 && (
                <div>
                  <h4 className="text-2xl font-semibold text-slate-800 mb-4">Select Customer Account</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                      <div 
                        key={account.id}
                        onClick={() => setOnboardingData({...onboardingData, selectedAccount: account})}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          onboardingData.selectedAccount?.id === account.id
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                        data-testid={`onboarding-account-${account.id}`}
                      >
                        <h5 className="font-semibold text-slate-800 text-base">{account.name}</h5>
                        <p className="text-slate-600 text-sm">{account.email}</p>
                        <p className="text-slate-500 text-sm">{account.city}, {account.state}</p>
                        <p className="text-slate-400 text-xs mt-1">{account.business_type}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => onboardingData.selectedAccount && setOnboardingData({...onboardingData, step: 2})}
                      disabled={!onboardingData.selectedAccount}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                      data-testid="next-to-step2"
                    >
                      Next: Select Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Intelligent Plan Selection */}
              {onboardingData.step === 2 && (
                <div>
                  <h4 className="text-2xl font-semibold text-slate-800 mb-4">Choose Service Plan</h4>
                  <p className="text-slate-600 mb-6 text-base">Plans filtered by service type, profile compatibility, and status</p>
                  
                  {/* Plan Selection Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-6 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Service Type</label>
                      <select
                        value={filters.serviceType}
                        onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                      >
                        <option value="all">All Types</option>
                        {uniqueServiceTypes.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Plan Status</label>
                      <select
                        value={filters.planStatus}
                        onChange={(e) => setFilters({...filters, planStatus: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm text-slate-600">
                        Showing appropriate plans for selected account
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredPlans(filters.serviceType, onboardingData.selectedAccount?.profile_id, filters.planStatus).map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setOnboardingData({...onboardingData, selectedPlan: plan})}
                        className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${
                          onboardingData.selectedPlan?.id === plan.id
                            ? 'border-emerald-500 shadow-lg transform scale-105'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                        data-testid={`onboarding-plan-${plan.id}`}
                      >
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
                          <h5 className="font-bold text-base">{plan.name}</h5>
                          <p className="text-emerald-100 text-sm">{plan.description}</p>
                          <div className="mt-2">
                            <span className="text-2xl font-bold">${plan.base_price}</span>
                            <span className="text-emerald-100 text-sm">/{plan.billing_frequency}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Setup Fee:</span>
                              <span className="font-medium">${plan.setup_fee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Service Type:</span>
                              <span className="capitalize font-medium">{plan.service_type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Status:</span>
                              <span className={`capitalize font-medium ${
                                plan.status === 'active' ? 'text-green-600' : 
                                plan.status === 'draft' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                          </div>
                          {plan.features && plan.features.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium mb-1">Features:</div>
                              {plan.features.slice(0, 2).map((feature, index) => (
                                <div key={index} className="text-xs text-slate-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setOnboardingData({...onboardingData, step: 1})}
                      className="bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors text-base font-medium"
                      data-testid="back-to-step1"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => onboardingData.selectedPlan && setOnboardingData({...onboardingData, step: 3})}
                      disabled={!onboardingData.selectedPlan}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                      data-testid="next-to-step3"
                    >
                      Next: Configure Service
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Service Configuration */}
              {onboardingData.step === 3 && (
                <div>
                  <h4 className="text-2xl font-semibold text-slate-800 mb-4">Configure Service Details</h4>
                  
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
                    <h5 className="font-semibold text-slate-800 mb-3 text-lg">Order Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-600">Customer:</div>
                        <div className="font-medium text-base">{onboardingData.selectedAccount?.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Service Plan:</div>
                        <div className="font-medium text-base">{onboardingData.selectedPlan?.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Monthly Rate:</div>
                        <div className="font-medium text-base">${onboardingData.selectedPlan?.base_price}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Setup Fee:</div>
                        <div className="font-medium text-base">${onboardingData.selectedPlan?.setup_fee}</div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Service Name *</label>
                        <input
                          type="text"
                          value={onboardingData.serviceDetails.service_name}
                          onChange={(e) => setOnboardingData({
                            ...onboardingData,
                            serviceDetails: {...onboardingData.serviceDetails, service_name: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          placeholder="Enter service name"
                          required
                          data-testid="onboarding-service-name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Service Address *</label>
                        <input
                          type="text"
                          value={onboardingData.serviceDetails.service_address}
                          onChange={(e) => setOnboardingData({
                            ...onboardingData,
                            serviceDetails: {...onboardingData.serviceDetails, service_address: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          required
                          data-testid="onboarding-service-address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={onboardingData.serviceDetails.start_date}
                          onChange={(e) => setOnboardingData({
                            ...onboardingData,
                            serviceDetails: {...onboardingData.serviceDetails, start_date: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          required
                          data-testid="onboarding-start-date"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Custom Price (Optional)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-base">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={onboardingData.serviceDetails.custom_price || ''}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData,
                              serviceDetails: {...onboardingData.serviceDetails, custom_price: e.target.value}
                            })}
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                            placeholder={`Default: ${onboardingData.selectedPlan?.base_price}`}
                            data-testid="onboarding-custom-price"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Service Description</label>
                      <textarea
                        value={onboardingData.serviceDetails.service_description}
                        onChange={(e) => setOnboardingData({
                          ...onboardingData,
                          serviceDetails: {...onboardingData.serviceDetails, service_description: e.target.value}
                        })}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        placeholder="Brief service description"
                        data-testid="onboarding-service-description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Installation Notes</label>
                      <textarea
                        value={onboardingData.serviceDetails.installation_notes}
                        onChange={(e) => setOnboardingData({
                          ...onboardingData,
                          serviceDetails: {...onboardingData.serviceDetails, installation_notes: e.target.value}
                        })}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        placeholder="Any special installation requirements or notes"
                        data-testid="onboarding-installation-notes"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setOnboardingData({...onboardingData, step: 2})}
                      className="bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors text-base font-medium"
                      data-testid="back-to-step2"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleOnboardingComplete}
                      disabled={loading || !onboardingData.serviceDetails.service_name || !onboardingData.serviceDetails.service_address}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                      data-testid="complete-onboarding"
                    >
                      {loading ? 'Creating Service...' : 'Complete Setup'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regular Add/Edit Service Modal with Fixed Header/Footer and Improved Font Sizes */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <p className="text-emerald-100 mt-1 text-base">
                    {editingService ? 'Update service configuration' : 'Create a new service for a customer account'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  data-testid="close-service-modal"
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Customer Account *</label>
                      <select
                        value={formData.account_id}
                        onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        required
                        data-testid="service-form-account"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} - {account.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Service Plan *</label>
                      <select
                        value={formData.plan_id}
                        onChange={(e) => {
                          const selected = plans.find(p => p.id === e.target.value);
                          setFormData({...formData, plan_id: e.target.value});
                          setSelectedPlan(selected);
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        required
                        data-testid="service-form-plan"
                      >
                        <option value="">Select Plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - ${plan.base_price}/{plan.billing_frequency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Service Name *</label>
                      <input
                        type="text"
                        value={formData.service_name}
                        onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        required
                        data-testid="service-form-name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Service Address *</label>
                      <input
                        type="text"
                        value={formData.service_address}
                        onChange={(e) => setFormData({...formData, service_address: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        required
                        data-testid="service-form-address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                        required
                        data-testid="service-form-start-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Price (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-base">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.custom_price || ''}
                          onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
                          className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                          placeholder={selectedPlan ? `Default: ${selectedPlan.base_price}` : 'Enter custom price'}
                          data-testid="service-form-custom-price"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Description</label>
                    <textarea
                      value={formData.service_description}
                      onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                      placeholder="Brief service description"
                      data-testid="service-form-description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Installation Notes</label>
                    <textarea
                      value={formData.installation_notes}
                      onChange={(e) => setFormData({...formData, installation_notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                      placeholder="Any special installation requirements or notes"
                      data-testid="service-form-notes"
                    />
                  </div>

                  {/* Cost Summary */}
                  {selectedPlan && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                      <h4 className="font-semibold text-slate-800 mb-3 text-lg">Cost Summary</h4>
                      <div className="space-y-2 text-base">
                        <div className="flex justify-between">
                          <span>Monthly Rate:</span>
                          <span className="font-medium">${formData.custom_price || selectedPlan.base_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Setup Fee:</span>
                          <span className="font-medium">${selectedPlan.setup_fee}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 text-lg">
                          <span>Total Initial Cost:</span>
                          <span>${calculateTotalCost(selectedPlan, formData.custom_price)}</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium disabled:opacity-50 text-base"
                  data-testid="service-form-submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingService ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingService ? 'Update Service' : 'Create Service'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-base"
                  data-testid="service-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Service Creation Modal */}
      <EnhancedServiceCreation
        isOpen={showEnhancedCreation}
        onClose={() => setShowEnhancedCreation(false)}
        AuthContext={AuthContext}
        onServiceCreated={fetchServices}
      />
    </div>
  );
};

export default ServiceManagement;