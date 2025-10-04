import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubscriptionManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('self');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Enhanced Filter State
  const [filters, setFilters] = useState({
    searchTerm: '',
    account_id: '',
    plan_name: '',
    status: 'all',
    service_type: 'all'
  });
  
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    account_id: '',
    plan_name: '',
    status: 'all',
    service_type: 'all'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sorting state
  const [sorting, setSorting] = useState({
    field: 'start_date',
    direction: 'desc'
  });
  
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [deactivationDate, setDeactivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedNewPlan, setSelectedNewPlan] = useState('');
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Addon functionality state
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedAddon, setSelectedAddon] = useState('');
  const [addonActivationDate, setAddonActivationDate] = useState(new Date().toISOString().split('T')[0]);

  const itemsPerPage = 10;

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({...filters});
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      account_id: '',
      plan_name: '',
      status: 'all',
      service_type: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get unique service types for filter dropdown
  const uniqueServiceTypes = [...new Set(subscriptions.map(s => s.service_name.split(' ').pop()))];

  // Fetch subscriptions based on active tab
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'self' ? 'subscriptions/self' : 'subscriptions/users';
      const params = {
        page: 1,
        limit: 50, // Get more data for local filtering
        ...(appliedFilters.account_id && { account_id: appliedFilters.account_id }),
        ...(appliedFilters.plan_name && { plan_name: appliedFilters.plan_name })
      };

      const response = await axios.get(`${API}/${endpoint}`, { params });
      let data = response.data;

      // Apply local filtering
      if (appliedFilters.searchTerm) {
        data = data.filter(sub => 
          sub.account_name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
          sub.plan_name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
          sub.service_id.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
          sub.account_id.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())
        );
      }

      if (appliedFilters.status !== 'all') {
        data = data.filter(sub => sub.status === appliedFilters.status);
      }

      // Apply sorting
      data.sort((a, b) => {
        const direction = sorting.direction === 'asc' ? 1 : -1;
        switch (sorting.field) {
          case 'account_name':
            return direction * a.account_name.localeCompare(b.account_name);
          case 'plan_name':
            return direction * a.plan_name.localeCompare(b.plan_name);
          case 'amount':
            return direction * (a.amount - b.amount);
          case 'start_date':
          default:
            return direction * (new Date(a.start_date) - new Date(b.start_date));
        }
      });

      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription details
  const fetchSubscriptionDetails = async (subscriptionId) => {
    try {
      const response = await axios.get(`${API}/subscriptions/${subscriptionId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      // Try alternative ID formats if primary fails
      if (error.response?.status === 404) {
        console.log('Subscription not found, trying alternative formats...');
      }
      return null;
    }
  };

  // Fetch available addon plans
  const fetchAvailableAddons = async (serviceType) => {
    try {
      const response = await axios.get(`${API}/subscriptions/addon-plans/${serviceType}`);
      setAvailableAddons(response.data);
    } catch (error) {
      console.error('Error fetching addon plans:', error);
      setAvailableAddons([]);
    }
  };

  // Activate addon plan
  const handleActivateAddon = async () => {
    if (!selectedAddon) {
      alert('Please select an addon plan');
      return;
    }

    try {
      await axios.post(`${API}/subscriptions/activate-addon`, {
        base_service_id: selectedSubscription.service_id,
        addon_plan_id: selectedAddon,
        activation_date: addonActivationDate + 'T00:00:00Z'
      });
      
      setShowAddAddon(false);
      setSelectedSubscription(null);
      setSelectedAddon('');
      fetchSubscriptions();
      alert('Addon plan activated successfully');
    } catch (error) {
      console.error('Error activating addon:', error);
      alert('Error activating addon plan');
    }
  };

  // Fetch available plans for change
  const fetchAvailablePlans = async (currentPlanId) => {
    try {
      const response = await axios.get(`${API}/subscriptions/available-plans/${currentPlanId}`);
      setAvailablePlans(response.data);
    } catch (error) {
      console.error('Error fetching available plans:', error);
    }
  };

  // Handle deactivate subscription
  const handleDeactivate = async () => {
    try {
      // Use different endpoint for addon plans
      if (selectedSubscription.is_addon || selectedSubscription.plan_type === 2) {
        await axios.post(`${API}/subscriptions/deactivate-addon`, {
          addon_service_id: selectedSubscription.service_id,
          deactivation_date: deactivationDate + 'T00:00:00Z'
        });
      } else {
        await axios.post(`${API}/subscriptions/${selectedSubscription.id}/deactivate`, {
          service_id: selectedSubscription.service_id,
          deactivation_date: deactivationDate + 'T00:00:00Z'
        });
      }
      
      setShowDeactivate(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
      alert(`${selectedSubscription.is_addon ? 'Addon' : 'Subscription'} deactivated successfully`);
    } catch (error) {
      console.error('Error deactivating subscription:', error);
      alert(`Error deactivating ${selectedSubscription.is_addon ? 'addon' : 'subscription'}`);
    }
  };

  // Handle change plan
  const handleChangePlan = async () => {
    if (!selectedNewPlan) {
      alert('Please select a new plan');
      return;
    }

    try {
      await axios.post(`${API}/subscriptions/change-plan`, {
        current_service_id: selectedSubscription.service_id,
        new_plan_id: selectedNewPlan,
        activation_date: activationDate + 'T00:00:00Z'
      });
      
      setShowChangePlan(false);
      setSelectedSubscription(null);
      setSelectedNewPlan('');
      fetchSubscriptions();
      alert('Plan changed successfully');
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('Error changing plan');
    }
  };

  // Handle view details
  const handleViewDetails = async (subscription) => {
    try {
      const details = await fetchSubscriptionDetails(subscription.service_id || subscription.id);
      if (details) {
        setSelectedSubscription({ ...subscription, ...details });
        setShowDetails(true);
      } else {
        alert('Unable to fetch subscription details');
      }
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
      alert('Error loading subscription details');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [activeTab, appliedFilters, sorting]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || statusClasses.active;
  };

  // Pagination
  const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSubscriptions = subscriptions.slice(startIndex, startIndex + itemsPerPage);

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sorting.field !== field) return null;
    return sorting.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Subscription Management</h2>
              <p className="text-slate-600 mt-1 text-sm">Manage active subscriptions and service plans</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{subscriptions.length}</div>
            <div className="text-sm text-emerald-600">Total Subscriptions</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('self');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-sm ${
                activeTab === 'self'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              data-testid="self-plans-tab"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Self Plans</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-sm ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              data-testid="user-plans-tab"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>User Plans</span>
              </div>
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {activeTab === 'self' ? 'Your active subscriptions' : 'End-user subscriptions'}
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-slate-800">Advanced Search & Filters</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
        </div>
        
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Global Search</label>
            <input
              type="text"
              placeholder="Search by account, plan, service ID..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="global-search"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Sort By</label>
            <select
              value={sorting.field}
              onChange={(e) => setSorting({...sorting, field: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="start_date">Start Date</option>
              <option value="account_name">Account Name</option>
              <option value="plan_name">Plan Name</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Order</label>
            <select
              value={sorting.direction}
              onChange={(e) => setSorting({...sorting, direction: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-sm"
              data-testid="apply-filters-btn"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-200 pt-3">
            <h5 className="text-sm font-semibold text-slate-700 mb-3">Advanced Filters</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Account ID</label>
                <input
                  type="text"
                  placeholder="Filter by account ID"
                  value={filters.account_id}
                  onChange={(e) => setFilters({...filters, account_id: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="account-filter"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Plan Name</label>
                <input
                  type="text"
                  placeholder="Filter by plan name"
                  value={filters.plan_name}
                  onChange={(e) => setFilters({...filters, plan_name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="plan-filter"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Service Type</label>
                <select
                  value={filters.service_type}
                  onChange={(e) => setFilters({...filters, service_type: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="internet">Internet</option>
                  <option value="gas">Gas</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Summary */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {currentSubscriptions.length} of {subscriptions.length} subscriptions 
            {appliedFilters.searchTerm || appliedFilters.account_id || appliedFilters.plan_name ? ' (filtered)' : ''}
          </div>
          <div className="text-sm text-slate-500">
            Sorted by {sorting.field.replace('_', ' ')} ({sorting.direction})
          </div>
        </div>
      </div>

      {/* Enhanced Subscriptions Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {activeTab === 'self' ? 'Self Active Plans' : 'User Active Plans'} ({subscriptions.length})
              </h3>
              <p className="text-slate-600 mt-1 text-sm">
                {activeTab === 'self' 
                  ? 'Subscriptions managed by you' 
                  : 'Subscriptions for end users'
                }
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('account_id')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Account ID</span>
                          {getSortIndicator('account_id')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('account_name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {getSortIndicator('account_name')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Service ID</th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('plan_name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Plan Name</span>
                          {getSortIndicator('plan_name')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Amount</span>
                          {getSortIndicator('amount')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('start_date')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Start Date</span>
                          {getSortIndicator('start_date')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">End Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentSubscriptions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No subscriptions found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search terms</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 text-sm font-medium text-slate-800" data-testid={`account-${subscription.account_id}`}>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                {subscription.account_id.split('_')[1]}
                              </div>
                              <span>{subscription.account_id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-800" data-testid={`name-${subscription.id}`}>
                            <div>
                              <div className="font-medium">{subscription.account_name}</div>
                              <div className="text-xs text-slate-500">{subscription.service_name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-mono text-slate-600" data-testid={`service-${subscription.service_id}`}>
                            {subscription.service_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-800" data-testid={`plan-${subscription.id}`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                subscription.is_addon || subscription.plan_type === 2 ? 'bg-gradient-to-r from-blue-900 to-slate-700' :
                                subscription.plan_name.includes('Enterprise') ? 'bg-indigo-500' :
                                subscription.plan_name.includes('Commercial') ? 'bg-blue-500' :
                                subscription.plan_name.includes('Admin') ? 'bg-emerald-500' :
                                'bg-gray-500'
                              }`}></div>
                              <div className="flex flex-col">
                                <span className="font-medium">{subscription.plan_name}</span>
                                {(subscription.is_addon || subscription.plan_type === 2) && (
                                  <span className="text-xs font-medium bg-gradient-to-r from-blue-900 to-slate-700 bg-clip-text text-transparent">Addon Plan</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-800" data-testid={`amount-${subscription.id}`}>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600">${subscription.amount.toFixed(2)}</div>
                              <div className="text-xs text-slate-500">monthly</div>
                            </div>
                          </td>
                          <td className="px-4 py-4" data-testid={`status-${subscription.id}`}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(subscription.status)}`}>
                              {subscription.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600" data-testid={`start-${subscription.id}`}>
                            {formatDate(subscription.start_date)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600" data-testid={`end-${subscription.id}`}>
                            {subscription.end_date ? formatDate(subscription.end_date) : (
                              <span className="text-emerald-600 font-medium">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-4" data-testid={`actions-${subscription.id}`}>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(subscription)}
                                className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex items-center justify-center"
                                title="View Details"
                                data-testid={`view-${subscription.id}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {/* Deactivate button for all plans */}
                              <button
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowDeactivate(true);
                                }}
                                className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center justify-center"
                                title={subscription.is_addon || subscription.plan_type === 2 ? "Deactivate Addon" : "Deactivate Plan"}
                                data-testid={`deactivate-${subscription.id}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {/* Only show Add Addon button for base plans (plan_type = 1) */}
                              {!subscription.is_addon && subscription.plan_type === 1 && (
                                <button
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    // Extract service type from plan name or use a default mapping
                                    const serviceType = subscription.service_name.toLowerCase().includes('electricity') ? 'electricity' :
                                                      subscription.service_name.toLowerCase().includes('internet') ? 'internet' :
                                                      subscription.service_name.toLowerCase().includes('water') ? 'water' : 'electricity';
                                    fetchAvailableAddons(serviceType);
                                    setShowAddAddon(true);
                                  }}
                                  className="w-8 h-8 bg-gradient-to-r from-blue-900/10 to-slate-700/10 hover:from-blue-900/20 hover:to-slate-700/20 text-blue-900 rounded-lg transition-colors flex items-center justify-center border border-blue-900/20"
                                  title="Add Addon"
                                  data-testid={`add-addon-${subscription.id}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              )}
                              {/* Change Plan button for base plans only */}
                              {!subscription.is_addon && subscription.plan_type === 1 && (
                                <button
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    fetchAvailablePlans(subscription.plan_id);
                                    setShowChangePlan(true);
                                  }}
                                  className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors flex items-center justify-center"
                                  title="Change Plan"
                                  data-testid={`change-plan-${subscription.id}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, subscriptions.length)} of {subscriptions.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    data-testid="prev-page"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                            currentPage === pageNum
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    data-testid="next-page"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Subscription Details Modal */}
      {showDetails && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="details-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Subscription Details</h3>
                    <p className="text-blue-100 mt-1">{selectedSubscription.service_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                  data-testid="close-details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Service Information */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Service Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Service Name</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.service_name} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Service ID</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.service_id} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Service Category</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.service_category} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Service Address</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.service?.service_address || 'N/A'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Monthly Charges</label>
                    <input 
                      type="text" 
                      value={`$${selectedSubscription.amount.toFixed(2)}`} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-emerald-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-bold text-emerald-700"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Plan Information */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Plan Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Plan Name</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.plan_name} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-purple-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-purple-700"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Plan Type</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.plan?.plan_type || 'N/A'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Service Type</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.plan?.service_type || 'N/A'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="block text-sm font-semibold text-slate-700">Plan Description</label>
                    <textarea 
                      value={selectedSubscription.plan?.description || 'N/A'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      rows={2}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {selectedSubscription.plan?.features && selectedSubscription.plan.features.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Plan Features</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSubscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-green-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Account Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Account Name</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.account_name} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-amber-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-amber-700"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Account Email</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.account?.email || 'N/A'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Timeline */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Subscription Timeline</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Start Date</label>
                    <input 
                      type="text" 
                      value={formatDate(selectedSubscription.start_date)} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-green-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-green-700"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">End Date</label>
                    <input 
                      type="text" 
                      value={selectedSubscription.end_date ? formatDate(selectedSubscription.end_date) : 'Active - No End Date'} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Status</label>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold ${getStatusBadge(selectedSubscription.status)}`}>
                        {selectedSubscription.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="close-details-btn"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setShowDeactivate(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium"
                  data-testid="deactivate-from-details"
                >
                  {selectedSubscription.is_addon || selectedSubscription.plan_type === 2 ? 'Deactivate Addon' : 'Deactivate Plan'}
                </button>
                {/* Only show Change Plan for base plans (not addon plans) */}
                {!selectedSubscription.is_addon && selectedSubscription.plan_type !== 2 && (
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      fetchAvailablePlans(selectedSubscription.plan_id);
                      setShowChangePlan(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all font-medium"
                    data-testid="change-plan-from-details"
                  >
                    Change Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Deactivate Modal */}
      {showDeactivate && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="deactivate-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Deactivate Subscription</h3>
                    <p className="text-red-100 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeactivate(false)}
                  className="text-white hover:text-red-200 transition-colors"
                  data-testid="close-deactivate"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Confirm Deactivation</h4>
                <p className="text-slate-600 mb-4">
                  Are you sure you want to deactivate the subscription for <strong className="text-slate-800">{selectedSubscription.account_name}</strong>?
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>Service:</strong> {selectedSubscription.service_name}</div>
                    <div><strong>Plan:</strong> {selectedSubscription.plan_name}</div>
                    <div><strong>Monthly Amount:</strong> <span className="font-semibold text-emerald-600">${selectedSubscription.amount.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Deactivation Date</label>
                <input
                  type="date"
                  value={deactivationDate}
                  onChange={(e) => setDeactivationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  data-testid="deactivation-date"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDeactivate(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="cancel-deactivate"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium"
                  data-testid="confirm-deactivate"
                >
                  Deactivate Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Change Plan Modal */}
      {showChangePlan && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="change-plan-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Change Plan</h3>
                    <p className="text-emerald-100 text-sm">Switch to a different service plan</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePlan(false)}
                  className="text-white hover:text-emerald-200 transition-colors"
                  data-testid="close-change-plan"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Plan Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                  </svg>
                  <span>Current Plan</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-slate-600">Plan Name</label>
                    <p className="font-semibold text-slate-800">{selectedSubscription.plan_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Current Amount</label>
                    <p className="font-semibold text-emerald-600">${selectedSubscription.amount.toFixed(2)}/month</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Service</label>
                    <p className="font-semibold text-slate-800">{selectedSubscription.service_name}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Available Plans</span>
                </h4>
                
                {/* Available Plans */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {availablePlans.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No alternative plans available</h3>
                      <p className="text-slate-500">All available plans are already in use or not compatible</p>
                    </div>
                  ) : (
                    availablePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          selectedNewPlan === plan.id
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedNewPlan(plan.id)}
                        data-testid={`plan-option-${plan.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedNewPlan === plan.id 
                                  ? 'border-emerald-500 bg-emerald-500' 
                                  : 'border-slate-300'
                              } flex items-center justify-center`}>
                                {selectedNewPlan === plan.id && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <h5 className="font-bold text-slate-800">{plan.name}</h5>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                plan.plan_type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                plan.plan_type === 'commercial' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {plan.plan_type}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Service: {plan.service_type}</span>
                              <span>Billing: {plan.billing_frequency}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-emerald-600">${plan.charges.toFixed(2)}</div>
                            <div className="text-sm text-slate-500">{plan.billing_frequency}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {plan.charges > selectedSubscription.amount ? (
                                <span className="text-red-600">+${(plan.charges - selectedSubscription.amount).toFixed(2)}</span>
                              ) : plan.charges < selectedSubscription.amount ? (
                                <span className="text-green-600">-${(selectedSubscription.amount - plan.charges).toFixed(2)}</span>
                              ) : (
                                <span className="text-slate-500">Same price</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedNewPlan && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Activation Date</label>
                  <input
                    type="date"
                    value={activationDate}
                    onChange={(e) => setActivationDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    data-testid="activation-date"
                  />
                  <p className="text-sm text-slate-500">The new plan will be activated on this date, and the current plan will be deactivated.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowChangePlan(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="cancel-change-plan"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePlan}
                  disabled={!selectedNewPlan}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium"
                  data-testid="confirm-change-plan"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Addon Modal */}
      {showAddAddon && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="add-addon-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Add Addon Plan</h3>
                    <p className="text-purple-100 text-sm">Enhance your service with additional features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAddon(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                  data-testid="close-add-addon"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Plan Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                  </svg>
                  <span>Base Plan</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-slate-600">Plan Name</label>
                    <p className="font-semibold text-slate-800">{selectedSubscription.plan_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Current Amount</label>
                    <p className="font-semibold text-emerald-600">${selectedSubscription.amount.toFixed(2)}/month</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Service</label>
                    <p className="font-semibold text-slate-800">{selectedSubscription.service_name}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Available Addon Plans</span>
                </h4>
                
                {/* Available Addons */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {availableAddons.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No addon plans available</h3>
                      <p className="text-slate-500">No compatible addon plans found for this service type</p>
                    </div>
                  ) : (
                    availableAddons.map((addon) => (
                      <div
                        key={addon.id}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          selectedAddon === addon.id
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedAddon(addon.id)}
                        data-testid={`addon-option-${addon.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedAddon === addon.id 
                                  ? 'border-purple-500 bg-purple-500' 
                                  : 'border-slate-300'
                              } flex items-center justify-center`}>
                                {selectedAddon === addon.id && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <h5 className="font-bold text-slate-800">{addon.name}</h5>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                Addon
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{addon.description}</p>
                            
                            {/* Features */}
                            {addon.features && addon.features.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-xs font-semibold text-slate-700 mb-2">Features:</h6>
                                <div className="flex flex-wrap gap-1">
                                  {addon.features.slice(0, 3).map((feature, index) => (
                                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      {feature}
                                    </span>
                                  ))}
                                  {addon.features.length > 3 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                      +{addon.features.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Service: {addon.service_type}</span>
                              <span>Billing: {addon.billing_frequency}</span>
                              {addon.setup_fee > 0 && (
                                <span>Setup: ${addon.setup_fee.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-purple-600">${addon.charges.toFixed(2)}</div>
                            <div className="text-sm text-slate-500">{addon.billing_frequency}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              <span className="text-purple-600">Additional cost</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedAddon && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Activation Date</label>
                  <input
                    type="date"
                    value={addonActivationDate}
                    onChange={(e) => setAddonActivationDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="addon-activation-date"
                  />
                  <p className="text-sm text-slate-500">The addon will be activated on this date and billed separately.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowAddAddon(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="cancel-add-addon"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivateAddon}
                  disabled={!selectedAddon}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium"
                  data-testid="confirm-add-addon"
                >
                  Activate Addon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;