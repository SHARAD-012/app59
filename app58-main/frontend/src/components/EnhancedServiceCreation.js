import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedServiceCreation = ({ user, onClose, onServiceCreated, creationType = 'self' }) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  
  // Multi-step workflow state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  
  // Form state
  const [serviceData, setServiceData] = useState({
    profile_id: '',
    account_id: '',
    plan_id: '',
    
    // Service details
    service_name: '',
    service_description: '',
    service_category: creationType === 'self' ? 'self_service' : 'user_service',
    service_type: 'electricity',
    custom_price: '',
    monthly_charges: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    service_address: '',
    installation_notes: '',
    meter_number: '',
    connection_type: '',
    capacity: '',
    priority: 'medium',
    managed_by: user.id,
    assigned_to: creationType === 'self' ? 'admin' : 'user'
  });

  const [errors, setErrors] = useState({});
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-populate profile for self creation
  useEffect(() => {
    if (creationType === 'self' && profiles.length > 0) {
      const userProfile = profiles.find(p => p.created_by === user.id || p.email === user.email);
      if (userProfile) {
        setSelectedProfile(userProfile);
        setServiceData(prev => ({ ...prev, profile_id: userProfile.id }));
        filterAccountsByProfile(userProfile.id);
        setCurrentStep(2); // Skip profile selection for self
      }
    }
  }, [profiles, creationType, user]);

  // Filter accounts when profile changes
  useEffect(() => {
    if (selectedProfile) {
      filterAccountsByProfile(selectedProfile.id);
    }
  }, [selectedProfile, accounts]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch profiles
      const profilesResponse = await axios.get(`${API}/profiles`, { headers });
      setProfiles(profilesResponse.data);

      // Fetch accounts
      const accountsResponse = await axios.get(`${API}/accounts`, { headers });
      setAccounts(accountsResponse.data);

      // Fetch plans
      const plansResponse = await axios.get(`${API}/plans`, { headers });
      setPlans(plansResponse.data);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const filterAccountsByProfile = (profileId) => {
    const filtered = accounts.filter(account => account.profile_id === profileId);
    setFilteredAccounts(filtered);
    
    // Auto-select account if only one available
    if (filtered.length === 1) {
      setSelectedAccount(filtered[0]);
      setServiceData(prev => ({ ...prev, account_id: filtered[0].id }));
      if (creationType === 'self') {
        setCurrentStep(3); // Skip account selection if only one account
      }
    }
  };

  const handleNext = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!serviceData.profile_id) {
        newErrors.profile_id = 'Please select a profile';
        setErrors(newErrors);
        return;
      }
    } else if (currentStep === 2) {
      if (!serviceData.account_id) {
        newErrors.account_id = 'Please select an account';
        setErrors(newErrors);
        return;
      }
    } else if (currentStep === 3) {
      // Validate service details
      const requiredFields = ['service_name', 'service_type', 'service_address'];
      requiredFields.forEach(field => {
        if (!serviceData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    } else if (currentStep === 4) {
      if (!serviceData.plan_id) {
        newErrors.plan_id = 'Please select a plan';
        setErrors(newErrors);
        return;
      }
      // Calculate security deposit
      if (selectedPlan) {
        const deposit = selectedPlan.charges * (selectedPlan.deposit_multiplier || 2.0);
        setSecurityDeposit(deposit);
      }
    }
    
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClear = () => {
    setServiceData({
      profile_id: creationType === 'self' ? serviceData.profile_id : '',
      account_id: '',
      plan_id: '',
      service_name: '',
      service_description: '',
      service_category: creationType === 'self' ? 'self_service' : 'user_service',
      service_type: 'electricity',
      custom_price: '',
      monthly_charges: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      service_address: '',
      installation_notes: '',
      meter_number: '',
      connection_type: '',
      capacity: '',
      priority: 'medium',
      managed_by: user.id,
      assigned_to: creationType === 'self' ? 'admin' : 'user'
    });
    setSelectedAccount(null);
    setSelectedPlan(null);
    setErrors({});
    setCurrentStep(creationType === 'self' ? 2 : 1);
    setShowPaymentStep(false);
  };

  const handleCreateService = () => {
    // Show preview step
    setCurrentStep(5);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    
    try {
      const servicePayload = {
        account_id: serviceData.account_id,
        plan_id: serviceData.plan_id,
        service_name: serviceData.service_name,
        service_description: serviceData.service_description,
        service_category: serviceData.service_category,
        service_type: serviceData.service_type,
        custom_price: serviceData.custom_price ? parseFloat(serviceData.custom_price) : null,
        monthly_charges: serviceData.monthly_charges ? parseFloat(serviceData.monthly_charges) : null,
        start_date: new Date(serviceData.start_date).toISOString(),
        end_date: serviceData.end_date ? new Date(serviceData.end_date).toISOString() : null,
        service_address: serviceData.service_address,
        installation_notes: serviceData.installation_notes,
        meter_number: serviceData.meter_number,
        connection_type: serviceData.connection_type,
        capacity: serviceData.capacity,
        priority: serviceData.priority,
        managed_by: serviceData.managed_by,
        assigned_to: serviceData.assigned_to,
        is_active: true
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/services`, servicePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Service created successfully:', response.data);
      setShowPaymentStep(true);

    } catch (error) {
      console.error('Error creating service:', error);
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Error creating service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = () => {
    // For now, just simulate payment success
    alert(`Payment of $${securityDeposit.toFixed(2)} processed successfully! Service has been activated.`);
    
    if (onServiceCreated) {
      onServiceCreated();
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Get service types for dropdown
  const getServiceTypes = () => [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' },
    { value: 'gas', label: 'Gas' },
    { value: 'internet', label: 'Internet' },
    { value: 'saas', label: 'SaaS' },
    { value: 'facility', label: 'Facility' },
    { value: 'other', label: 'Other' }
  ];

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setServiceData(prev => ({ ...prev, profile_id: profile.id }));
    setSelectedAccount(null);
    setServiceData(prev => ({ ...prev, account_id: '' }));
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setServiceData(prev => ({ ...prev, account_id: account.id }));
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setServiceData(prev => ({ ...prev, plan_id: plan.id }));
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Select Profile";
      case 2: return "Select Account";
      case 3: return "Service Details";
      case 4: return "Select Plan";
      case 5: return "Review & Confirm";
      default: return "Create Service";
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = creationType === 'self' ? 4 : 5; // Skip profile step for self
    const adjustedStep = creationType === 'self' ? currentStep + 1 : currentStep;
    
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === adjustedStep;
            const isCompleted = stepNumber < adjustedStep;
            
            return (
              <React.Fragment key={stepNumber}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive ? 'bg-emerald-500 text-white' :
                  isCompleted ? 'bg-emerald-200 text-emerald-800' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < totalSteps && (
                  <div className={`w-8 h-1 ${
                    stepNumber < adjustedStep ? 'bg-emerald-200' : 'bg-slate-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  if (showPaymentStep) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Service Created Successfully!</h3>
              <p className="text-emerald-100 mt-2">Security deposit payment required to activate</p>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Security Deposit Required</h4>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                ${securityDeposit.toFixed(2)}
              </div>
              <p className="text-sm text-slate-600">
                {selectedPlan?.deposit_multiplier || 2.0}x plan charges (${selectedPlan?.charges || 0})
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleMakePayment}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
                data-testid="make-payment-btn"
              >
                Make Payment
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Pay Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{getStepTitle()}</h3>
              <p className="text-emerald-100 mt-1">Step {creationType === 'self' ? currentStep + 1 : currentStep} of {creationType === 'self' ? 4 : 5}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              data-testid="close-service-modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {renderStepIndicator()}

          {/* Step 1: Profile Selection (only for user services) */}
          {currentStep === 1 && creationType !== 'self' && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Profile</h4>
                <p className="text-slate-600">Choose the profile for which you want to create a service</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {profiles.map(profile => (
                  <div
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedProfile?.id === profile.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                    data-testid={`profile-option-${profile.id}`}
                  >
                    <h5 className="font-semibold text-slate-800">{profile.name}</h5>
                    <p className="text-sm text-slate-600">{profile.profession}</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                ))}
              </div>
              {errors.profile_id && <p className="text-red-500 text-sm text-center">{errors.profile_id}</p>}
            </div>
          )}

          {/* Step 2: Account Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Account</h4>
                <p className="text-slate-600">
                  {selectedProfile ? `Choose an account for ${selectedProfile.name}` : 'Choose your account'}
                </p>
              </div>
              
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-600">No accounts found for the selected profile</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredAccounts.map(account => (
                    <div
                      key={account.id}
                      onClick={() => handleAccountSelect(account)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedAccount?.id === account.id 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                      data-testid={`account-option-${account.id}`}
                    >
                      <h5 className="font-semibold text-slate-800">{account.name}</h5>
                      <p className="text-sm text-slate-600">{account.business_type}</p>
                      <p className="text-xs text-slate-500">{account.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {errors.account_id && <p className="text-red-500 text-sm text-center">{errors.account_id}</p>}
            </div>
          )}

          {/* Step 3: Service Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Service Details</h4>
                <p className="text-slate-600">Enter the service information and basic details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Service Name *</label>
                  <input
                    type="text"
                    value={serviceData.service_name}
                    onChange={(e) => setServiceData({...serviceData, service_name: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.service_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter service name..."
                    data-testid="service-name-input"
                  />
                  {errors.service_name && <p className="text-red-500 text-sm">{errors.service_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Service Type *</label>
                  <select
                    value={serviceData.service_type}
                    onChange={(e) => setServiceData({...serviceData, service_type: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.service_type ? 'border-red-500' : 'border-slate-300'
                    }`}
                    data-testid="service-type-select"
                  >
                    {getServiceTypes().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.service_type && <p className="text-red-500 text-sm">{errors.service_type}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Service Description</label>
                  <textarea
                    value={serviceData.service_description}
                    onChange={(e) => setServiceData({...serviceData, service_description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter service description..."
                    rows="3"
                    data-testid="service-description-input"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Service Address *</label>
                  <input
                    type="text"
                    value={serviceData.service_address}
                    onChange={(e) => setServiceData({...serviceData, service_address: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.service_address ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter service address..."
                    data-testid="service-address-input"
                  />
                  {errors.service_address && <p className="text-red-500 text-sm">{errors.service_address}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Meter Number</label>
                  <input
                    type="text"
                    value={serviceData.meter_number}
                    onChange={(e) => setServiceData({...serviceData, meter_number: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter meter number..."
                    data-testid="meter-number-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Connection Type</label>
                  <input
                    type="text"
                    value={serviceData.connection_type}
                    onChange={(e) => setServiceData({...serviceData, connection_type: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., single_phase, fiber, municipal..."
                    data-testid="connection-type-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Capacity</label>
                  <input
                    type="text"
                    value={serviceData.capacity}
                    onChange={(e) => setServiceData({...serviceData, capacity: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 50 kW, 1000 gallons/day..."
                    data-testid="capacity-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Priority</label>
                  <select
                    value={serviceData.priority}
                    onChange={(e) => setServiceData({...serviceData, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    data-testid="priority-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Plan</h4>
                <p className="text-slate-600">Choose a service plan for this service</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {plans.filter(plan => plan.service_type === serviceData.service_type || plan.service_type === 'all').map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedPlan?.id === plan.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                    data-testid={`plan-option-${plan.id}`}
                  >
                    <h5 className="font-semibold text-slate-800">{plan.name}</h5>
                    <p className="text-sm text-slate-600">{plan.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-emerald-600">${plan.charges}/mo</span>
                      <span className="text-xs text-slate-500 capitalize">{plan.service_type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Security Deposit: ${(plan.charges * (plan.deposit_multiplier || 2.0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {errors.plan_id && <p className="text-red-500 text-sm text-center">{errors.plan_id}</p>}
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Review & Confirm</h4>
                <p className="text-slate-600">Please review all details before creating the service</p>
              </div>
              
              <div className="space-y-4">
                {/* Profile & Account Info */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">Account Information</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedProfile && (
                      <>
                        <div>
                          <span className="text-slate-600">Profile:</span>
                          <span className="ml-2 font-medium">{selectedProfile.name}</span>
                        </div>
                      </>
                    )}
                    {selectedAccount && (
                      <div>
                        <span className="text-slate-600">Account:</span>
                        <span className="ml-2 font-medium">{selectedAccount.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">Service Details</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Service Name:</span>
                      <span className="ml-2 font-medium">{serviceData.service_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Service Type:</span>
                      <span className="ml-2 font-medium capitalize">{serviceData.service_type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600">Address:</span>
                      <span className="ml-2 font-medium">{serviceData.service_address}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                {selectedPlan && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h5 className="font-semibold text-slate-800 mb-2">Plan Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Plan:</span>
                        <span className="ml-2 font-medium">{selectedPlan.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Monthly Charge:</span>
                        <span className="ml-2 font-medium">${selectedPlan.charges}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-600">Security Deposit Required:</span>
                        <span className="ml-2 font-medium text-emerald-600">
                          ${(selectedPlan.charges * (selectedPlan.deposit_multiplier || 2.0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  data-testid="previous-step-btn"
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                data-testid="clear-form-btn"
              >
                Clear
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                data-testid="cancel-service-btn"
              >
                Cancel
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
                  data-testid="next-step-btn"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="create-service-btn"
                >
                  {loading ? 'Creating...' : 'Create Service'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedServiceCreation;