import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Plans Management Component
const PlansManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    serviceType: 'all',
    planType: 'all',
    status: 'all'
  });
  
  const [filters, setFilters] = useState({
    serviceType: 'all',
    planType: 'all',
    status: 'all'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plan_type: 'standard',
    service_type: 'electricity',
    charge_type: 'recurring',
    charge_category: 'utility',
    base_price: 0,
    charges: 0,
    setup_fee: 0,
    billing_frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    deposit_multiplier: 2.0,
    features: [],
    terms_conditions: '',
    is_proration_enabled: false,
    status: 'active',
    is_for_admin: false,
    assigned_to_role: 'user',
    created_for_admin: null
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('🔍 Fetching plans from:', `${API}/plans`);
      const response = await axios.get(`${API}/plans`);
      console.log('✅ Plans response:', response.data);
      setPlans(response.data);
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up features array
      const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
      
      // Prepare submit data with proper date handling
      const submitData = {
        ...formData,
        features: cleanedFeatures,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        charges: parseFloat(formData.charges) || 0,
        base_price: parseFloat(formData.base_price) || 0,
        setup_fee: parseFloat(formData.setup_fee) || 0,
        deposit_multiplier: parseFloat(formData.deposit_multiplier) || 2.0
      };

      if (editingPlan) {
        // Update plan
        await axios.put(`${API}/plans/${editingPlan.id}`, submitData);
      } else {
        // Create new plan
        await axios.post(`${API}/plans`, submitData);
      }
      
      // Refresh plans list
      fetchPlans();
      resetForm();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      plan_type: 'standard',
      service_type: 'electricity',
      charge_type: 'recurring',
      charge_category: 'utility',
      base_price: 0,
      charges: 0,
      setup_fee: 0,
      billing_frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      deposit_multiplier: 2.0,
      features: [],
      terms_conditions: '',
      is_proration_enabled: false,
      status: 'active',
      is_for_admin: false,
      assigned_to_role: 'user',
      created_for_admin: null
    });
    setShowCreateForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setFormData({
      ...plan,
      features: plan.features.length > 0 ? plan.features : [],
      start_date: plan.start_date ? new Date(plan.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: plan.end_date ? new Date(plan.end_date).toISOString().split('T')[0] : ''
    });
    setEditingPlan(plan);
    setShowCreateForm(true);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const calculateDeposit = () => {
    return (parseFloat(formData.charges) || 0) * (parseFloat(formData.deposit_multiplier) || 2.0);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Apply filters function
  const applyFilters = () => {
    console.log('Applying plan filters:', filters);
    setAppliedFilters({...filters});
  };

  // Clear filters function
  const clearAllFilters = () => {
    const clearedFilters = {
      serviceType: 'all',
      planType: 'all',
      status: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setSelectedServiceType('all');
  };

  // Use applied filters for filtering
  const filteredPlans = plans.filter(plan => {
    const matchesServiceType = appliedFilters.serviceType === 'all' || plan.service_type === appliedFilters.serviceType;
    const matchesPlanType = appliedFilters.planType === 'all' || plan.plan_type === appliedFilters.planType;
    const matchesStatus = appliedFilters.status === 'all' || plan.status === appliedFilters.status;
    return matchesServiceType && matchesPlanType && matchesStatus;
  });
  
  console.log('📊 Plans data:', { 
    totalPlans: plans.length, 
    appliedFilters, 
    filteredPlans: filteredPlans.length,
    planIds: filteredPlans.map(p => p.id)
  });

  const getServiceTypeColor = (type) => {
    const colors = {
      electricity: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      water: 'bg-blue-100 text-blue-800 border-blue-200',
      gas: 'bg-orange-100 text-orange-800 border-orange-200',
      internet: 'bg-purple-100 text-purple-800 border-purple-200',
      saas: 'bg-green-100 text-green-800 border-green-200',
      facility: 'bg-gray-100 text-gray-800 border-gray-200',
      other: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getRoleText = () => {
    if (user.role === 'super_admin') {
      return 'Configure plans for the entire system and assign to admins';
    } else if (user.role === 'admin') {
      return 'Manage your assigned plans and create new ones for users';
    }
    return 'View available service plans';
  };

  const uniquePlanTypes = [...new Set(plans.map(p => p.plan_type))].filter(Boolean);
  const uniqueServiceTypes = [...new Set(plans.map(p => p.service_type))].filter(Boolean);
  const uniqueStatuses = [...new Set(plans.map(p => p.status))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Enhanced Service Plans Management</h2>
          <p className="text-slate-600 mt-1 text-sm">{getRoleText()}</p>
        </div>
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            data-testid="create-plan-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Plan</span>
            </div>
          </button>
        )}
      </div>

      {/* Filters with Apply Button */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-800">Filter Service Plans</h4>
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

        {/* Always Visible - Service Type Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Filter by Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => {
                setFilters({...filters, serviceType: e.target.value});
                setSelectedServiceType(e.target.value);
              }}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="service-type-filter"
            >
              <option value="all">All Services</option>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="gas">Gas</option>
              <option value="internet">Internet</option>
              <option value="saas">SaaS</option>
              <option value="facility">Facility</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Filter by Plan Type</label>
            <select
              value={filters.planType}
              onChange={(e) => setFilters({...filters, planType: e.target.value})}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="plan-type-filter"
            >
              <option value="all">All Plan Types</option>
              {uniquePlanTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="plan-status-filter"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-200 pt-3 mt-3 animate-in slide-in-from-top duration-200">
            <div className="text-sm text-slate-500 mb-2">Additional filters coming soon...</div>
          </div>
        )}

        {/* Apply Filter Button */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
              data-testid="apply-plan-filters-btn"
            >
              Apply Filters
            </button>
            {(JSON.stringify(filters) !== JSON.stringify(appliedFilters)) && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-lg font-medium">
                Filters changed - Click Apply
              </span>
            )}
          </div>
          {(appliedFilters.serviceType !== 'all' || appliedFilters.planType !== 'all' || appliedFilters.status !== 'all') && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg font-medium">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading plans...</p>
          </div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Plans Found</h3>
          <p className="text-slate-500 mb-4">
            {plans.length === 0 
              ? "No service plans have been created yet." 
              : "No plans match the selected filters."
            }
          </p>
          <p className="text-xs text-slate-400">Total plans available: {plans.length}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden" data-testid={`plan-card-${plan.id}`}>
            {/* Card Header - Reduced padding and font sizes */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">{plan.name}</h3>
                  <p className="text-emerald-100 text-xs">{plan.description}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded-full capitalize">
                      {plan.plan_type || 'standard'}
                    </span>
                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded-full capitalize">
                      {plan.charge_category || 'utility'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-lg font-bold">${plan.charges || plan.base_price}</div>
                  <div className="text-emerald-100 text-xs capitalize">per {plan.billing_frequency}</div>
                  {plan.base_price && plan.charges !== plan.base_price && (
                    <div className="text-emerald-200 text-xs">Base: ${plan.base_price}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Content - Reduced padding and font sizes */}
            <div className="p-4 space-y-3">
              {/* Service Type and Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getServiceTypeColor(plan.service_type)}`}>
                  {plan.service_type.charAt(0).toUpperCase() + plan.service_type.slice(1)}
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(plan.status)}`}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </span>
              </div>

              {/* Enhanced Pricing Details - Smaller fonts */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Setup Fee:</span>
                  <span className="font-medium text-slate-800">${plan.setup_fee}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Deposit:</span>
                  <span className="font-medium text-slate-800">
                    ${plan.calculated_deposit?.toFixed(2) || ((plan.charges || plan.base_price) * (plan.deposit_multiplier || 2.0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Billing:</span>
                  <span className="font-medium text-slate-800 capitalize">{plan.billing_frequency}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-medium text-slate-800 capitalize">{plan.charge_type.replace('_', ' ')}</span>
                </div>
                {plan.start_date && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium text-slate-800 text-xs">
                      {new Date(plan.start_date).toLocaleDateString()} - {plan.end_date ? new Date(plan.end_date).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                )}
                {plan.is_proration_enabled && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">Proration Enabled</span>
                  </div>
                )}
                {plan.is_for_admin && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-purple-600 font-medium">Admin Plan</span>
                  </div>
                )}
              </div>

              {/* Features - Smaller fonts */}
              {plan.features && plan.features.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-800 mb-1 text-xs">Features:</h4>
                  <div className="space-y-0.5">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-slate-500">+{plan.features.length - 3} more features</div>
                    )}
                  </div>
                </div>
              )}

              {/* Role Assignment Info */}
              {user.role === 'super_admin' && plan.created_for_admin && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-blue-600 font-medium">Assigned to Admin</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-slate-200">
                {user.role === 'user' ? (
                  <button className="flex-1 bg-emerald-50 text-emerald-600 py-2 px-4 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm" data-testid={`select-plan-${plan.id}`}>
                    Select Plan
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="flex-1 bg-emerald-50 text-emerald-600 py-2 px-4 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm" 
                      data-testid={`edit-plan-${plan.id}`}
                    >
                      Edit
                    </button>
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm" data-testid={`configure-plan-${plan.id}`}>
                      Configure
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Create/Edit Plan Modal with Fixed Header/Footer */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingPlan ? 'Edit Enhanced Service Plan' : 'Add New Enhanced Service Plan'}
                  </h3>
                  <p className="text-emerald-100 mt-1">
                    {editingPlan ? 'Update comprehensive plan information' : 'Create a new service plan with advanced configuration'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  data-testid="close-plan-modal"
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
                {/* Basic Information */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Plan Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Plan Type *</label>
                      <select
                        value={formData.plan_type}
                        onChange={(e) => setFormData({...formData, plan_type: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-plan-type"
                      >
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="commercial">Commercial</option>
                        <option value="management">Management</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Service Type *</label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-service-type"
                      >
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="gas">Gas</option>
                        <option value="internet">Internet</option>
                        <option value="saas">SaaS</option>
                        <option value="facility">Facility</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="plan-form-description"
                      />
                    </div>
                  </div>
                </div>

                {/* Charge Configuration */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Charge Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Charge Type *</label>
                      <select
                        value={formData.charge_type}
                        onChange={(e) => setFormData({...formData, charge_type: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-charge-type"
                      >
                        <option value="arrear">Arrear</option>
                        <option value="advance">Advance</option>
                        <option value="one_time">One Time</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Charge Category *</label>
                      <select
                        value={formData.charge_category}
                        onChange={(e) => setFormData({...formData, charge_category: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-charge-category"
                      >
                        <option value="utility">Utility</option>
                        <option value="administrative">Administrative</option>
                        <option value="service">Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="installation">Installation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Main Charges ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.charges}
                        onChange={(e) => setFormData({...formData, charges: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-charges"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Base Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="plan-form-base-price"
                      />
                    </div>
                  </div>
                </div>

                {/* Deposit & Billing Configuration */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Deposit & Billing Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Setup Fee ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.setup_fee}
                        onChange={(e) => setFormData({...formData, setup_fee: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="plan-form-setup-fee"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Deposit Multiplier *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.deposit_multiplier}
                        onChange={(e) => setFormData({...formData, deposit_multiplier: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-deposit-multiplier"
                      />
                      <p className="text-xs text-slate-500">
                        Calculated Deposit: ${calculateDeposit().toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Billing Frequency *</label>
                      <select
                        value={formData.billing_frequency}
                        onChange={(e) => setFormData({...formData, billing_frequency: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-billing-frequency"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="proration"
                        checked={formData.is_proration_enabled}
                        onChange={(e) => setFormData({...formData, is_proration_enabled: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        data-testid="plan-form-proration"
                      />
                      <label htmlFor="proration" className="text-sm font-medium text-slate-700">Enable Proration</label>
                    </div>
                  </div>
                </div>

                {/* Duration & Target Configuration */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Duration & Target Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-start-date"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="plan-form-end-date"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                        data-testid="plan-form-status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_for_admin"
                        checked={formData.is_for_admin}
                        onChange={(e) => setFormData({
                          ...formData, 
                          is_for_admin: e.target.checked,
                          assigned_to_role: e.target.checked ? 'admin' : 'user'
                        })}
                        className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        data-testid="plan-form-is-for-admin"
                      />
                      <label htmlFor="is_for_admin" className="text-sm font-medium text-slate-700">Plan for Admin</label>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Terms & Conditions</h4>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Terms & Conditions</label>
                    <textarea
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows="4"
                      data-testid="plan-form-terms"
                    />
                  </div>
                </div>

                {/* Features Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Features</h4>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      data-testid="add-feature-btn"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter feature description"
                          data-testid={`plan-form-feature-${index}`}
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`remove-feature-${index}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
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
                  data-testid="plan-form-submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingPlan ? 'Updating Plan...' : 'Creating Plan...'}
                    </div>
                  ) : (
                    editingPlan ? 'Update Enhanced Plan' : 'Create Enhanced Plan'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="plan-form-cancel"
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

export default PlansManagement;