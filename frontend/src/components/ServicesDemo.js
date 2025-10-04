import React, { useState, useEffect } from 'react';

const ServicesDemo = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Load dummy services data
    const dummyServices = [
      // Master Services
      {
        service_id: "serv_master_001",
        account_id: "acc_001",
        plan_id: "plan_master_001",
        service_category: "master_service",
        service_type: "electricity",
        service_name: "Premium Electricity Service",
        description: "High-capacity commercial electricity service with 24/7 monitoring",
        status: "active",
        connection_date: "2024-01-15",
        monthly_cost: 2500.00,
        consumption_limit: 50000,
        current_consumption: 35200,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-15",
        contact_info: {
          primary_contact: "John Master",
          phone: "+1-555-0101",
          email: "john.master@utility.com"
        },
        service_details: {
          voltage_rating: "480V",
          peak_demand: "150kW",
          power_factor: "0.95",
          connection_type: "Three-phase"
        }
      },
      {
        service_id: "serv_master_002",
        account_id: "acc_002",
        plan_id: "plan_master_002",
        service_category: "master_service",
        service_type: "water",
        service_name: "Industrial Water Supply",
        description: "High-volume water service for industrial operations",
        status: "active",
        connection_date: "2024-02-01",
        monthly_cost: 1800.00,
        consumption_limit: 100000,
        current_consumption: 78500,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-01",
        contact_info: {
          primary_contact: "Sarah Waters",
          phone: "+1-555-0102",
          email: "sarah.waters@utility.com"
        },
        service_details: {
          pressure_rating: "80 PSI",
          pipe_diameter: "8 inches",
          flow_rate: "500 GPM",
          water_quality: "Industrial Grade"
        }
      },
      // Self Services
      {
        service_id: "serv_self_001",
        account_id: "acc_011",
        plan_id: "plan_self_001",
        service_category: "self_service",
        service_type: "electricity",
        service_name: "Residential Solar + Grid",
        description: "Self-managed residential electricity with solar integration",
        status: "active",
        connection_date: "2024-03-10",
        monthly_cost: 850.00,
        consumption_limit: 15000,
        current_consumption: 8200,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-10",
        contact_info: {
          primary_contact: "Emma Green",
          phone: "+1-555-0201",
          email: "emma.green@selfservice.com"
        },
        service_details: {
          solar_capacity: "12kW",
          battery_storage: "Tesla Powerwall 2",
          grid_connection: "Net Metering",
          energy_exported: "3,400 kWh"
        }
      },
      {
        service_id: "serv_self_002",
        account_id: "acc_012",
        plan_id: "plan_self_002",
        service_category: "self_service",
        service_type: "internet",
        service_name: "Self-Managed Fiber Internet",
        description: "High-speed fiber internet with self-service portal management",
        status: "active",
        connection_date: "2024-04-05",
        monthly_cost: 120.00,
        consumption_limit: null,
        current_consumption: 2850,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-05",
        contact_info: {
          primary_contact: "Alex Fiber",
          phone: "+1-555-0202",
          email: "alex.fiber@selfnet.com"
        },
        service_details: {
          speed_download: "1 Gbps",
          speed_upload: "1 Gbps",
          data_transfer: "Unlimited",
          equipment: "Self-provided router"
        }
      },
      // User Services
      {
        service_id: "serv_user_001",
        account_id: "acc_021",
        plan_id: "plan_user_001",
        service_category: "user_service",
        service_type: "electricity",
        service_name: "Standard Residential Electric",
        description: "Basic residential electricity service",
        status: "active",
        connection_date: "2024-05-01",
        monthly_cost: 180.00,
        consumption_limit: 2000,
        current_consumption: 1450,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-01",
        contact_info: {
          primary_contact: "Robert User",
          phone: "+1-555-0301",
          email: "robert.user@email.com"
        },
        service_details: {
          voltage: "120/240V",
          service_size: "200 Amp",
          meter_type: "Digital Smart Meter",
          rate_schedule: "Residential Standard"
        }
      },
      {
        service_id: "serv_user_002",
        account_id: "acc_022",
        plan_id: "plan_user_002",
        service_category: "user_service",
        service_type: "water",
        service_name: "Basic Residential Water",
        description: "Standard residential water service",
        status: "active",
        connection_date: "2024-05-15",
        monthly_cost: 65.00,
        consumption_limit: 5000,
        current_consumption: 3200,
        billing_cycle: "monthly",
        next_billing_date: "2024-10-15",
        contact_info: {
          primary_contact: "Maria Resident",
          phone: "+1-555-0302",
          email: "maria.resident@email.com"
        },
        service_details: {
          meter_size: "5/8 inch",
          pressure: "60 PSI",
          service_line: "Copper",
          water_source: "Municipal Supply"
        }
      }
    ];

    setServices(dummyServices);
    setLoading(false);
  }, []);

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.service_category === activeCategory);

  const getServiceIcon = (type) => {
    switch(type) {
      case 'electricity': return '⚡';
      case 'water': return '💧';
      case 'gas': return '🔥';
      case 'internet': return '🌐';
      default: return '🔧';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch(category) {
      case 'master_service': return 'bg-purple-100 text-purple-800';
      case 'self_service': return 'bg-blue-100 text-blue-800';
      case 'user_service': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'master_service': return 'Master Service';
      case 'self_service': return 'Self Service';
      case 'user_service': return 'User Service';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Details</h1>
          <p className="text-slate-600">Comprehensive utility service management and monitoring</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Total Services</h3>
            <p className="text-3xl font-bold text-emerald-600">{services.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Master Services</h3>
            <p className="text-3xl font-bold text-purple-600">
              {services.filter(s => s.service_category === 'master_service').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Self Services</h3>
            <p className="text-3xl font-bold text-blue-600">
              {services.filter(s => s.service_category === 'self_service').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">User Services</h3>
            <p className="text-3xl font-bold text-green-600">
              {services.filter(s => s.service_category === 'user_service').length}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setActiveCategory('master_service')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'master_service' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Master Services ({services.filter(s => s.service_category === 'master_service').length})
            </button>
            <button
              onClick={() => setActiveCategory('self_service')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'self_service' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Self Services ({services.filter(s => s.service_category === 'self_service').length})
            </button>
            <button
              onClick={() => setActiveCategory('user_service')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'user_service' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              User Services ({services.filter(s => s.service_category === 'user_service').length})
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.service_id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getServiceIcon(service.service_type)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{service.service_name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(service.service_category)}`}>
                        {getCategoryName(service.service_category)}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-4">{service.description}</p>

                {/* Key Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Monthly Cost:</span>
                    <span className="font-semibold text-slate-900">${service.monthly_cost}</span>
                  </div>
                  
                  {service.consumption_limit && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Usage:</span>
                      <span className="font-semibold text-slate-900">
                        {service.current_consumption?.toLocaleString()} / {service.consumption_limit?.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Next Billing:</span>
                    <span className="font-semibold text-slate-900">{service.next_billing_date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Contact:</span>
                    <span className="font-semibold text-slate-900">{service.contact_info?.primary_contact}</span>
                  </div>
                </div>

                {/* Service Details */}
                {service.service_details && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="font-medium text-slate-900 mb-2">Technical Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(service.service_details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>
                          <div className="font-medium text-slate-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No services found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesDemo;