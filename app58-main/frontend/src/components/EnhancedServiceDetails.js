import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import EnhancedServiceCreation from './EnhancedServiceCreation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Service Details Component with AccountDetails styling and 3 sub-categories
const EnhancedServiceDetails = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Service Details State
  const [serviceInfo, setServiceInfo] = useState(null);
  const [selectedUserService, setSelectedUserService] = useState(null);
  const [showServiceList, setShowServiceList] = useState(false);
  
  // Enhanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    serviceId: '',
    serviceName: '',
    serviceType: 'all',
    status: 'all',
    priority: 'all',
    chargesRange: 'all'
  });
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    serviceId: '',
    serviceName: '',
    serviceType: 'all',
    status: 'all',
    priority: 'all',
    chargesRange: 'all'
  });
  
  // Advanced Search Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Service View State
  const [activeServiceView, setActiveServiceView] = useState('master_services');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(12);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  // Add Service Modal State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  useEffect(() => {
    initializeDummyServiceData();
    fetchServices();
    fetchPlans();
    fetchAccounts();
  }, []);

  // Initialize service data by categories
  const initializeDummyServiceData = () => {
    // This will be populated by backend data
    setServiceInfo({
      has_master_services: true,
      has_self_services: true,
      has_user_services: true,
      is_service_manager: true,
      show_user_services: true
    });
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch from API first
      if (token && !token.startsWith('demo-token')) {
        const response = await axios.get(`${API}/services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Services data fetched from API:', response.data);
        setServices(response.data || []);
      } else {
        // Use dummy data for demo mode or when API fails
        console.log('🔄 Using dummy service data for demo');
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
          {
            service_id: "serv_master_003",
            account_id: "acc_003",
            plan_id: "plan_master_003",
            service_category: "master_service",
            service_type: "gas",
            service_name: "Commercial Gas Service",
            description: "Natural gas service for commercial heating and operations",
            status: "active",
            connection_date: "2024-01-20",
            monthly_cost: 1200.00,
            consumption_limit: 25000,
            current_consumption: 18900,
            billing_cycle: "monthly",
            next_billing_date: "2024-10-20",
            contact_info: {
              primary_contact: "Mike Gasline",
              phone: "+1-555-0103",
              email: "mike.gasline@utility.com"
            },
            service_details: {
              pressure_rating: "2 PSI",
              meter_size: "4 inches",
              heating_value: "1,050 BTU/scf",
              connection_type: "Commercial"
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
          {
            service_id: "serv_self_003",
            account_id: "acc_013",
            plan_id: "plan_self_003",
            service_category: "self_service",
            service_type: "water",
            service_name: "Rainwater Collection System",
            description: "Self-managed rainwater collection with municipal backup",
            status: "active",
            connection_date: "2024-02-15",
            monthly_cost: 450.00,
            consumption_limit: 8000,
            current_consumption: 3200,
            billing_cycle: "monthly",
            next_billing_date: "2024-10-15",
            contact_info: {
              primary_contact: "Lisa Rain",
              phone: "+1-555-0203",
              email: "lisa.rain@rainwater.com"
            },
            service_details: {
              tank_capacity: "5,000 gallons",
              filtration_system: "Multi-stage UV",
              backup_connection: "Municipal",
              collection_area: "2,400 sq ft"
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
          },
          {
            service_id: "serv_user_003",
            account_id: "acc_023",
            plan_id: "plan_user_003",
            service_category: "user_service",
            service_type: "gas",
            service_name: "Residential Natural Gas",
            description: "Basic residential natural gas for heating and cooking",
            status: "active",
            connection_date: "2024-06-01",
            monthly_cost: 95.00,
            consumption_limit: 3000,
            current_consumption: 1800,
            billing_cycle: "monthly",
            next_billing_date: "2024-10-01",
            contact_info: {
              primary_contact: "James Kitchen",
              phone: "+1-555-0303",
              email: "james.kitchen@email.com"
            },
            service_details: {
              meter_type: "Diaphragm",
              pressure: "0.25 PSI",
              appliances: "Furnace, Water Heater, Stove",
              safety_shutoff: "Automatic"
            }
          },
          {
            service_id: "serv_user_004",
            account_id: "acc_024",
            plan_id: "plan_user_004",
            service_category: "user_service",
            service_type: "internet",
            service_name: "Home Internet Basic",
            description: "Standard home internet service",
            status: "active",
            connection_date: "2024-06-10",
            monthly_cost: 55.00,
            consumption_limit: null,
            current_consumption: 450,
            billing_cycle: "monthly",
            next_billing_date: "2024-10-10",
            contact_info: {
              primary_contact: "Linda Connect",
              phone: "+1-555-0304",
              email: "linda.connect@email.com"
            },
            service_details: {
              speed_download: "100 Mbps",
              speed_upload: "10 Mbps",
              data_cap: "1 TB",
              equipment_rental: "Modem/Router Combo"
            }
          }
        ];
        
        setServices(dummyServices);
        console.log('✅ Dummy services loaded:', dummyServices.length, 'services');
      }
    } catch (error) {
      console.error('❌ Error fetching services, using dummy data:', error);
      // Fallback to dummy data on API error
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
          }
        }
      ];
      setServices(dummyServices);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      serviceId: '',
      serviceName: '',
      serviceType: 'all',
      status: 'all',
      priority: 'all',
      chargesRange: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  // Apply filters function
  const applyFilters = () => {
    setAppliedFilters({...filters});
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get services by category
  const getServicesByCategory = (category) => {
    return services.filter(service => service.service_category === category);
  };

  // Get service type color
  const getServiceTypeColor = (type) => {
    const colors = {
      electricity: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      water: 'bg-blue-100 text-blue-700 border-blue-300',
      gas: 'bg-orange-100 text-orange-700 border-orange-300',
      internet: 'bg-purple-100 text-purple-700 border-purple-300',
      saas: 'bg-green-100 text-green-700 border-green-300',
      facility: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[type] || colors.facility;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-300',
      suspended: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      inactive: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[status] || colors.inactive;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-blue-100 text-blue-700 border-blue-300',
      low: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[priority] || colors.medium;
  };

  // Master Services Component
  const MasterServicesView = () => {
    const [masterServiceFilter, setMasterServiceFilter] = useState('all');
    const allMasterServices = getServicesByCategory('master_service');
    
    // Filter master services by type
    const filteredMasterServices = masterServiceFilter === 'all' 
      ? allMasterServices 
      : allMasterServices.filter(service => service.service_type === masterServiceFilter);
    
    // Get unique service types for master services
    const masterServiceTypes = [...new Set(allMasterServices.map(s => s.service_type))];
    
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Master Services</h3>
            <p className="text-slate-600 text-sm">System-level services managed by master admin</p>
            <p className="text-slate-500 text-xs">Total: {allMasterServices.length} services</p>
          </div>
          <div className="flex-1"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              ${allMasterServices.reduce((sum, service) => sum + (service.monthly_charges || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Total Monthly</div>
          </div>
        </div>

        {/* Service Type Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">Filter by Service Type:</label>
            <select
              value={masterServiceFilter}
              onChange={(e) => setMasterServiceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-service-type-filter"
            >
              <option value="all">All Types</option>
              {masterServiceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Showing:</span>
              <span className="text-sm font-medium text-purple-600">{filteredMasterServices.length} services</span>
            </div>
          </div>
        </div>

        {/* Service Cards Grid - Small Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMasterServices.map((service) => (
            <div 
              key={service.id} 
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white/50"
              onClick={() => {
                setSelectedUserService(service);
                setActiveServiceView('selected_service');
              }}
              data-testid={`master-service-${service.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {service.service_name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.status)}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">{service.service_name}</h4>
                <p className="text-xs text-slate-600 line-clamp-1">ID: {service.id}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getServiceTypeColor(service.service_type)}`}>
                    {service.service_type?.charAt(0).toUpperCase() + service.service_type?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(service.priority)}`}>
                    {service.priority}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-lg font-bold text-purple-600">
                    ${service.monthly_charges?.toLocaleString() || '0'}/mo
                  </div>
                  <div className="text-xs text-slate-500">{service.capacity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMasterServices.length === 0 && allMasterServices.length > 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No services match your filter</h3>
            <p className="text-slate-500">Try selecting a different service type or clear the filter.</p>
            <button
              onClick={() => setMasterServiceFilter('all')}
              className="mt-3 px-4 py-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Clear Filter
            </button>
          </div>
        )}
        
        {allMasterServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Master Services</h3>
            <p className="text-slate-500">No master services found.</p>
          </div>
        )}
      </div>
    );
  };

  // Self Services Component
  const SelfServicesView = () => {
    const [selfServiceFilter, setSelfServiceFilter] = useState('all');
    const allSelfServices = getServicesByCategory('self_service');
    
    // Filter self services by type
    const filteredSelfServices = selfServiceFilter === 'all' 
      ? allSelfServices 
      : allSelfServices.filter(service => service.service_type === selfServiceFilter);
    
    // Get unique service types for self services
    const selfServiceTypes = [...new Set(allSelfServices.map(s => s.service_type))];
    
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Self Services</h3>
            <p className="text-slate-600 text-sm">Services you can manage yourself</p>
            <p className="text-slate-500 text-xs">Total: {allSelfServices.length} services</p>
          </div>
          <div className="flex-1"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              ${allSelfServices.reduce((sum, service) => sum + (service.monthly_charges || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Total Monthly</div>
          </div>
        </div>

        {/* Service Type Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">Filter by Service Type:</label>
            <select
              value={selfServiceFilter}
              onChange={(e) => setSelfServiceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              data-testid="self-service-type-filter"
            >
              <option value="all">All Types</option>
              {selfServiceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Showing:</span>
              <span className="text-sm font-medium text-emerald-600">{filteredSelfServices.length} services</span>
            </div>
          </div>
        </div>

        {/* Service Cards Grid - Small Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSelfServices.map((service) => (
            <div 
              key={service.id} 
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white/50"
              onClick={() => {
                setSelectedUserService(service);
                setActiveServiceView('selected_service');
              }}
              data-testid={`self-service-${service.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {service.service_name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.status)}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">{service.service_name}</h4>
                <p className="text-xs text-slate-600 line-clamp-1">ID: {service.id}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getServiceTypeColor(service.service_type)}`}>
                    {service.service_type?.charAt(0).toUpperCase() + service.service_type?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(service.priority)}`}>
                    {service.priority}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-lg font-bold text-emerald-600">
                    ${service.monthly_charges?.toLocaleString() || '0'}/mo
                  </div>
                  <div className="text-xs text-slate-500">{service.capacity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredSelfServices.length === 0 && allSelfServices.length > 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No services match your filter</h3>
            <p className="text-slate-500">Try selecting a different service type or clear the filter.</p>
            <button
              onClick={() => setSelfServiceFilter('all')}
              className="mt-3 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Clear Filter
            </button>
          </div>
        )}
        
        {allSelfServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Self Services</h3>
            <p className="text-slate-500">No self services found.</p>
          </div>
        )}
      </div>
    );
  };

  // User Services List Component with enhanced filtering
  const UserServicesListView = () => {
    const userServices = getServicesByCategory('user_service');
    
    const [serviceFilters, setServiceFilters] = useState({
      searchTerm: '',
      serviceName: '',
      serviceId: '',
      serviceType: 'all',
      status: 'all',
      priority: 'all',
      chargesRange: 'all'
    });
    
    const [appliedServiceFilters, setAppliedServiceFilters] = useState({
      searchTerm: '',
      serviceName: '',
      serviceId: '',
      serviceType: 'all',
      status: 'all',
      priority: 'all',
      chargesRange: 'all'
    });
    
    const [serviceSorting, setServiceSorting] = useState({
      field: 'service_name',
      direction: 'asc'
    });
    
    const [showAdvancedServiceFilters, setShowAdvancedServiceFilters] = useState(false);

    // Apply service filters
    const applyServiceFilters = () => {
      setAppliedServiceFilters({...serviceFilters});
      setCurrentPage(1);
    };

    // Clear service filters
    const clearServiceFilters = () => {
      const clearedFilters = {
        searchTerm: '',
        serviceName: '',
        serviceId: '',
        serviceType: 'all',
        status: 'all',
        priority: 'all',
        chargesRange: 'all'
      };
      setServiceFilters(clearedFilters);
      setAppliedServiceFilters(clearedFilters);
      setCurrentPage(1);
    };

    // Handle service sorting
    const handleServiceSort = (field) => {
      setServiceSorting(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    // Enhanced filtering logic
    const filteredServices = userServices.filter(service => {
      const matchesGlobalSearch = !appliedServiceFilters.searchTerm || 
        service.service_name?.toLowerCase().includes(appliedServiceFilters.searchTerm.toLowerCase()) ||
        service.service_address?.toLowerCase().includes(appliedServiceFilters.searchTerm.toLowerCase()) ||
        service.id.toLowerCase().includes(appliedServiceFilters.searchTerm.toLowerCase());
      
      const matchesName = !appliedServiceFilters.serviceName || 
        service.service_name?.toLowerCase().includes(appliedServiceFilters.serviceName.toLowerCase());
      
      const matchesServiceId = !appliedServiceFilters.serviceId || 
        service.id.toLowerCase().includes(appliedServiceFilters.serviceId.toLowerCase());
      
      const matchesServiceType = appliedServiceFilters.serviceType === 'all' || 
        service.service_type === appliedServiceFilters.serviceType;
      
      const matchesStatus = appliedServiceFilters.status === 'all' || 
        service.status === appliedServiceFilters.status;
      
      const matchesPriority = appliedServiceFilters.priority === 'all' || 
        service.priority === appliedServiceFilters.priority;

      const matchesChargesRange = appliedServiceFilters.chargesRange === 'all' || 
        (appliedServiceFilters.chargesRange === 'low' && (service.monthly_charges || 0) < 500) ||
        (appliedServiceFilters.chargesRange === 'medium' && (service.monthly_charges || 0) >= 500 && (service.monthly_charges || 0) < 1500) ||
        (appliedServiceFilters.chargesRange === 'high' && (service.monthly_charges || 0) >= 1500);
      
      return matchesGlobalSearch && matchesName && matchesServiceId && matchesServiceType && 
             matchesStatus && matchesPriority && matchesChargesRange;
    });

    // Enhanced sorting logic
    const sortedServices = [...filteredServices].sort((a, b) => {
      const direction = serviceSorting.direction === 'asc' ? 1 : -1;
      
      switch (serviceSorting.field) {
        case 'service_name':
          return direction * (a.service_name || '').localeCompare(b.service_name || '');
        case 'service_type':
          return direction * (a.service_type || '').localeCompare(b.service_type || '');
        case 'monthly_charges':
          return direction * ((a.monthly_charges || 0) - (b.monthly_charges || 0));
        case 'status':
          return direction * (a.status || '').localeCompare(b.status || '');
        case 'priority':
          return direction * (a.priority || '').localeCompare(b.priority || '');
        case 'start_date':
          return direction * (new Date(a.start_date) - new Date(b.start_date));
        default:
          return direction * (a.service_name || '').localeCompare(b.service_name || '');
      }
    });

    // Pagination logic
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = sortedServices.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(sortedServices.length / servicesPerPage);

    const handleServiceSelect = (service) => {
      setSelectedUserService(service);
      setActiveServiceView('selected_service');
    };

    // Get unique values for dropdowns
    const uniqueServiceTypes = [...new Set(userServices.map(s => s.service_type))];
    const uniqueStatuses = [...new Set(userServices.map(s => s.status))];
    const uniquePriorities = [...new Set(userServices.map(s => s.priority))];

    return (
      <div className="space-y-4">
        {/* Enhanced Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-slate-800">Advanced Service Search & Filters</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedServiceFilters(!showAdvancedServiceFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvancedServiceFilters ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>
          </div>
          
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Global Search</label>
              <input
                type="text"
                placeholder="Search by name, address, ID..."
                value={serviceFilters.searchTerm}
                onChange={(e) => setServiceFilters({...serviceFilters, searchTerm: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="service-global-search"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Service Type</label>
              <select
                value={serviceFilters.serviceType}
                onChange={(e) => setServiceFilters({...serviceFilters, serviceType: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {uniqueServiceTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Status</label>
              <select
                value={serviceFilters.status}
                onChange={(e) => setServiceFilters({...serviceFilters, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={applyServiceFilters}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
                data-testid="apply-service-filters-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={clearServiceFilters}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedServiceFilters && (
            <div className="border-t border-slate-200 pt-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-3">Advanced Filters</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Service Name</label>
                  <input
                    type="text"
                    placeholder="Filter by service name"
                    value={serviceFilters.serviceName}
                    onChange={(e) => setServiceFilters({...serviceFilters, serviceName: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Service ID</label>
                  <input
                    type="text"
                    placeholder="Filter by service ID"
                    value={serviceFilters.serviceId}
                    onChange={(e) => setServiceFilters({...serviceFilters, serviceId: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Priority</label>
                  <select
                    value={serviceFilters.priority}
                    onChange={(e) => setServiceFilters({...serviceFilters, priority: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    {uniquePriorities.map(priority => (
                      <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Charges Range</label>
                  <select
                    value={serviceFilters.chargesRange}
                    onChange={(e) => setServiceFilters({...serviceFilters, chargesRange: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Charges</option>
                    <option value="low">Low (&lt; $500)</option>
                    <option value="medium">Medium ($500 - $1,500)</option>
                    <option value="high">High (&gt; $1,500)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Sort By</label>
                  <select
                    value={serviceSorting.field}
                    onChange={(e) => setServiceSorting({...serviceSorting, field: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="service_name">Service Name</option>
                    <option value="service_type">Service Type</option>
                    <option value="monthly_charges">Monthly Charges</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="start_date">Start Date</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {currentServices.length} of {sortedServices.length} services 
              {appliedServiceFilters.searchTerm || appliedServiceFilters.serviceName || appliedServiceFilters.serviceId ? ' (filtered)' : ''}
            </div>
            <div className="text-sm text-slate-500">
              Sorted by {serviceSorting.field.replace('_', ' ')} ({serviceSorting.direction})
            </div>
          </div>
        </div>

        {/* Service Grid - Small Cards */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">User Services ({filteredServices.length})</h3>
                <p className="text-slate-600 mt-1 text-sm">Click on any service to view detailed information</p>
              </div>
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentServices.map((service) => (
                <div 
                  key={service.id} 
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white/50"
                  onClick={() => handleServiceSelect(service)}
                  data-testid={`user-service-${service.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {service.service_name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.status)}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">{service.service_name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">ID: {service.id}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getServiceTypeColor(service.service_type)}`}>
                        {service.service_type?.charAt(0).toUpperCase() + service.service_type?.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(service.priority)}`}>
                        {service.priority}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-lg font-bold text-blue-600">
                        ${service.monthly_charges?.toLocaleString() || '0'}/mo
                      </div>
                      <div className="text-xs text-slate-500">{service.capacity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {indexOfFirstService + 1} to {Math.min(indexOfLastService, filteredServices.length)} of {filteredServices.length} services
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Selected Service Detail View
  const SelectedServiceView = () => {
    if (!selectedUserService) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => {
              setSelectedUserService(null);
              setActiveServiceView('user_services');
            }}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-slate-800">Service Details</h3>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {selectedUserService.service_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selectedUserService.service_name}</h3>
              <p className="text-slate-600 text-sm">{selectedUserService.service_description}</p>
              <p className="text-slate-500 text-xs">Service ID: {selectedUserService.id}</p>
            </div>
            <div className="flex-1"></div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600">
                {selectedUserService.is_active ? 'Active' : 'Suspended'}
              </div>
              <div className="text-sm text-slate-500">Status</div>
            </div>
          </div>
          
          {/* Service Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Service Name</label>
              <input 
                type="text" 
                value={selectedUserService.service_name || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Service Type</label>
              <input 
                type="text" 
                value={selectedUserService.service_type || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Monthly Charges</label>
              <input 
                type="text" 
                value={`$${selectedUserService.monthly_charges?.toLocaleString() || '0'}`} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Priority</label>
              <input 
                type="text" 
                value={selectedUserService.priority || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Capacity</label>
              <input 
                type="text" 
                value={selectedUserService.capacity || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Meter Number</label>
              <input 
                type="text" 
                value={selectedUserService.meter_number || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Service Address</label>
              <input 
                type="text" 
                value={selectedUserService.service_address || ''} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Start Date</label>
              <input 
                type="text" 
                value={new Date(selectedUserService.start_date).toLocaleDateString()} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm"
                readOnly
              />
            </div>
          </div>

          {/* Service Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-xl font-bold text-blue-700">${selectedUserService.monthly_charges?.toLocaleString() || '0'}</div>
              <div className="text-sm text-blue-600">Monthly Charges</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="text-xl font-bold text-emerald-700">{selectedUserService.capacity || 'N/A'}</div>
              <div className="text-sm text-emerald-600">Capacity</div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
              <div className="text-xl font-bold text-amber-700">{selectedUserService.priority || 'Medium'}</div>
              <div className="text-sm text-amber-600">Priority</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-xl font-bold text-purple-700">{selectedUserService.last_reading?.toLocaleString() || '0'}</div>
              <div className="text-sm text-purple-600">Last Reading</div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm">
              Edit Service
            </button>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-sm">
              View Plans
            </button>
            <button className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-2 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm">
              Export Data
            </button>
            {!selectedUserService.is_active ? (
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium text-sm">
                Activate Service
              </button>
            ) : (
              <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium text-sm">
                Suspend Service
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render content based on active view
  const renderServiceContent = () => {
    switch(activeServiceView) {
      case 'master_services':
        return <MasterServicesView />;
      case 'self_services':
        return <SelfServicesView />;
      case 'user_services':
        return <UserServicesListView />;
      case 'selected_service':
        return <SelectedServiceView />;
      default:
        return <MasterServicesView />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-slate-800">Service Details</h2>
          
          {/* Service Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {/* Master Services Button */}
            <button
              onClick={() => {
                setActiveServiceView('master_services');
                setSelectedUserService(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeServiceView === 'master_services'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              data-testid="master-services-tab"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Master Services</span>
              </div>
            </button>

            {/* Self Services Button */}
            <button
              onClick={() => {
                setActiveServiceView('self_services');
                setSelectedUserService(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeServiceView === 'self_services'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              data-testid="self-services-tab"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Self Services</span>
              </div>
            </button>

            {/* User Services Button */}
            {serviceInfo?.show_user_services && (
              <button
                onClick={() => {
                  setActiveServiceView('user_services');
                  setSelectedUserService(null);
                  setShowServiceList(true);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeServiceView === 'user_services'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                data-testid="user-services-tab"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>User Services</span>
                </div>
              </button>
            )}
          </div>
        </div>
        
        {/* Add Service Button */}
        <button
          onClick={() => setShowAddServiceModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-sm"
          data-testid="add-service-btn"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Service</span>
          </div>
        </button>
      </div>

      {/* Service Content */}
      {renderServiceContent()}

      {/* Enhanced Service Creation Modal */}
      {showAddServiceModal && (
        <EnhancedServiceCreation
          user={user}
          onClose={() => setShowAddServiceModal(false)}
          onServiceCreated={(newService) => {
            console.log('New service created:', newService);
            fetchServices(); // Refresh services list
            setShowAddServiceModal(false);
          }}
          creationType={activeServiceView === 'user_services' ? 'user' : 'self'}
        />
      )}
    </div>
  );
};

export default EnhancedServiceDetails;