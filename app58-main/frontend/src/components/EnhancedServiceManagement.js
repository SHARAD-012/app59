import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Service Management Component
const EnhancedServiceManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_id: '',
    plan_id: '',
    service_name: '',
    service_description: '',
    custom_price: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    service_address: '',
    installation_notes: '',
    meter_number: '',
    connection_type: '',
    capacity: '',
    status: 'active',
    last_reading: '',
    is_active: true
  });

  useEffect(() => {
    fetchAccounts();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchServices(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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

  const fetchServices = async (accountId) => {
    try {
      const response = await axios.get(`${API}/services?account_id=${accountId}`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        account_id: selectedAccount,
        custom_price: formData.custom_price ? parseFloat(formData.custom_price) : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        last_reading: formData.last_reading ? parseFloat(formData.last_reading) : null,
      };

      if (editingService) {
        // Note: service_id is NOT included in updates (all other fields are updatable)
        const updateData = { ...submitData };
        delete updateData.id; // Remove id from update data if present
        await axios.put(`${API}/services/${editingService.id}`, updateData);
      } else {
        await axios.post(`${API}/services`, submitData);
      }
      
      fetchServices(selectedAccount);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service: ' + (error.response?.data?.detail || error.message));
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
      custom_price: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      service_address: '',
      installation_notes: '',
      meter_number: '',
      connection_type: '',
      capacity: '',
      status: 'active',
      last_reading: '',
      is_active: true
    });
    setShowAddForm(false);
    setEditingService(null);
  };

  const handleEdit = (service) => {
    setFormData({
      account_id: service.account_id,
      plan_id: service.plan_id,
      service_name: service.service_name || '',
      service_description: service.service_description || '',
      custom_price: service.custom_price || '',
      start_date: new Date(service.start_date).toISOString().split('T')[0],
      end_date: service.end_date ? new Date(service.end_date).toISOString().split('T')[0] : '',
      service_address: service.service_address || '',
      installation_notes: service.installation_notes || '',
      meter_number: service.meter_number || '',
      connection_type: service.connection_type || '',
      capacity: service.capacity || '',
      status: service.status || 'active',
      last_reading: service.last_reading || '',
      is_active: service.is_active !== undefined ? service.is_active : true
    });
    setEditingService(service);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Enhanced Service Management</h2>
        {selectedAccount && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            data-testid="add-service-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Service</span>
            </div>
          </button>
        )}
      </div>

      {/* Account Selection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700 min-w-max">Select Account:</label>
          <select
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              setServices([]);
            }}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="account-selector"
          >
            <option value="">Select an account to view services</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Services List */}
      {selectedAccount && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Enhanced Account Services</h3>
            <p className="text-slate-600 mt-1">Comprehensive service management with partial update capability (all fields except service_id are updatable)</p>
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">No Services Found</h4>
              <p className="text-slate-500 mb-4">This account doesn't have any services yet.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
              >
                Add First Service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan & Pricing</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Technical Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`service-row-${service.id}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {service.service_name || 'Unnamed Service'}
                          </div>
                          <div className="text-sm text-slate-500 max-w-xs">
                            {service.service_description || service.plan?.service_type || 'No description'}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">{service.service_address}</div>
                          {service.installation_notes && (
                            <div className="text-xs text-emerald-600 mt-1 italic">{service.installation_notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {service.plan ? (
                          <div>
                            <div className="font-medium text-slate-900">{service.plan.name}</div>
                            <div className="text-sm text-slate-500 mb-1">{service.plan.description}</div>
                            <div className="space-y-1">
                              {service.custom_price ? (
                                <div className="text-sm">
                                  <span className="text-slate-900 font-medium">${service.custom_price}/mo</span>
                                  <span className="text-amber-600 text-xs ml-1">(Custom)</span>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <span className="text-slate-900 font-medium">${service.plan.charges || service.plan.base_price}/mo</span>
                                  <span className="text-slate-500 text-xs ml-1">(Plan rate)</span>
                                </div>
                              )}
                              {service.plan.calculated_deposit && (
                                <div className="text-xs text-slate-400">
                                  Deposit: ${service.plan.calculated_deposit.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No plan assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {service.meter_number && (
                            <div className="text-slate-700">
                              <span className="font-medium">Meter:</span> {service.meter_number}
                            </div>
                          )}
                          {service.connection_type && (
                            <div className="text-slate-600">
                              <span className="font-medium">Type:</span> {service.connection_type}
                            </div>
                          )}
                          {service.capacity && (
                            <div className="text-slate-600">
                              <span className="font-medium">Capacity:</span> {service.capacity}
                            </div>
                          )}
                          {service.last_reading !== null && service.last_reading !== undefined && (
                            <div className="text-emerald-600">
                              <span className="font-medium">Reading:</span> {service.last_reading}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-slate-700">{new Date(service.start_date).toLocaleDateString()}</div>
                          <div className="text-slate-500">to</div>
                          <div className="text-slate-700">{service.end_date ? new Date(service.end_date).toLocaleDateString() : 'Ongoing'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            service.status === 'active' ? 'bg-green-100 text-green-800' :
                            service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            service.status === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {service.status || 'active'}
                          </span>
                          {!service.is_active && (
                            <div className="text-xs text-red-600 font-medium">Inactive</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleEdit(service)}
                            className="text-emerald-600 hover:text-emerald-900 font-medium text-sm" 
                            data-testid={`edit-service-${service.id}`}
                          >
                            Edit
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 font-medium text-sm" data-testid={`view-service-${service.id}`}>
                            View
                          </button>
                          <button className="text-amber-600 hover:text-amber-900 font-medium text-sm" data-testid={`reading-service-${service.id}`}>
                            Reading
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Add/Edit Service Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingService ? 'Edit Enhanced Service' : 'Add New Enhanced Service'}
                  </h3>
                  <p className="text-emerald-100 mt-1">
                    {editingService ? 'Update comprehensive service configuration (all fields except service ID are updatable)' : 'Create a new enhanced service with detailed configuration'}
                  </p>
                  {editingService && (
                    <p className="text-emerald-200 text-sm mt-1">
                      Service ID: {editingService.id} (Read-only)
                    </p>
                  )}
                </div>
                <button 
                  onClick={resetForm}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Service Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Basic Service Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Name *</label>
                    <input
                      type="text"
                      value={formData.service_name}
                      onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Main Office Electricity"
                      required
                      data-testid="service-form-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Plan *</label>
                    <select
                      value={formData.plan_id}
                      onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                      data-testid="service-form-plan"
                    >
                      <option value="">Select a service plan</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.charges || plan.base_price}/mo ({plan.service_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-form-status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Pricing Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Custom Price (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.custom_price}
                      onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Override plan price if needed"
                      data-testid="service-form-custom-price"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      data-testid="service-form-active"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Service Active</label>
                  </div>
                </div>
              </div>

              {/* Duration Configuration */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Duration Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                      data-testid="service-form-start-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-form-end-date"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Technical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Meter Number</label>
                    <input
                      type="text"
                      value={formData.meter_number}
                      onChange={(e) => setFormData({...formData, meter_number: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., ELC-001-2024"
                      data-testid="service-form-meter"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Connection Type</label>
                    <input
                      type="text"
                      value={formData.connection_type}
                      onChange={(e) => setFormData({...formData, connection_type: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., three_phase, municipal"
                      data-testid="service-form-connection"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Capacity</label>
                    <input
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 100 kW, 500 gallons/day"
                      data-testid="service-form-capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Reading</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.last_reading}
                      onChange={(e) => setFormData({...formData, last_reading: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 15420.5"
                      data-testid="service-form-reading"
                    />
                  </div>
                </div>
              </div>

              {/* Address and Description */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Location & Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Address *</label>
                    <input
                      type="text"
                      value={formData.service_address}
                      onChange={(e) => setFormData({...formData, service_address: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter the service installation address"
                      required
                      data-testid="service-form-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Description</label>
                    <textarea
                      value={formData.service_description}
                      onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows="4"
                      placeholder="Detailed description of the service..."
                      data-testid="service-form-description"
                    />
                  </div>
                </div>
              </div>

              {/* Installation Notes */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Installation Notes</h4>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Installation Notes & Special Requirements</label>
                  <textarea
                    value={formData.installation_notes}
                    onChange={(e) => setFormData({...formData, installation_notes: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="4"
                    placeholder="Add any installation notes, special requirements, or technical specifications..."
                    data-testid="service-form-notes"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium disabled:opacity-50"
                  data-testid="service-form-submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingService ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingService ? 'Update Enhanced Service' : 'Create Enhanced Service'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  data-testid="service-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedServiceManagement;