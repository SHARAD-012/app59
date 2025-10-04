import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Profile Management Component with Advanced Filtering
const ProfileManagement = ({ AuthContext, setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New state for profile information
  const [profileInfo, setProfileInfo] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [childUsers, setChildUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  
  // Enhanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    profileId: '',
    name: '',
    phone: '',
    status: 'all',
    profession: 'all'
  });
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    profileId: '',
    name: '',
    phone: '',
    status: 'all',
    profession: 'all'
  });
  
  // Advanced Search Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Profile View State - Modified logic
  const [activeProfileView, setActiveProfileView] = useState('my_profile');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    deposit_amount: 0
  });

  useEffect(() => {
    fetchProfileInfo();
    fetchProfiles();
    fetchAccounts();
    fetchServices();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const response = await axios.get(`${API}/users/me/profile-info`);
      setProfileInfo(response.data);
      setChildUsers(response.data.child_users || []);
    } catch (error) {
      console.error('Error fetching profile info:', error);
    }
  };

  const fetchUserProfileDetails = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}/profile-details`);
      setSelectedUserProfile(response.data);
      setActiveProfileView('selected_user');
    } catch (error) {
      console.error('Error fetching user profile details:', error);
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

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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
      if (editingProfile) {
        await axios.put(`${API}/profiles/${editingProfile.id}`, formData);
      } else {
        await axios.post(`${API}/profiles`, formData);
      }
      
      fetchProfiles();
      resetForm();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      profession: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      deposit_amount: 0
    });
    setShowAddForm(false);
    setEditingProfile(null);
  };

  const handleEdit = (profile) => {
    setFormData(profile);
    setEditingProfile(profile);
    setShowAddForm(true);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      profileId: '',
      name: '',
      phone: '',
      status: 'all',
      profession: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  // Apply filters function
  const applyFilters = () => {
    console.log('Applying profile filters:', filters);
    setAppliedFilters({...filters});
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Count accounts under each profile
  const getAccountCount = (profileId) => {
    return accounts.filter(account => account.profile_id === profileId).length;
  };

  // Count services under each profile (through accounts)
  const getServiceCount = (profileId) => {
    const profileAccounts = accounts.filter(account => account.profile_id === profileId);
    return services.filter(service => 
      profileAccounts.some(account => account.id === service.account_id)
    ).length;
  };

  // Enhanced filtering and sorting logic - now using appliedFilters
  const filteredAndSortedProfiles = profiles
    .filter(profile => {
      const matchesSearch = !appliedFilters.searchTerm || 
        profile.name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        profile.phone.includes(appliedFilters.searchTerm);
      
      const matchesProfileId = !appliedFilters.profileId || profile.id.includes(appliedFilters.profileId);
      const matchesName = !appliedFilters.name || profile.name.toLowerCase().includes(appliedFilters.name.toLowerCase());
      const matchesPhone = !appliedFilters.phone || profile.phone.includes(appliedFilters.phone);
      const matchesStatus = appliedFilters.status === 'all' || 
        (appliedFilters.status === 'active' && profile.is_active) ||
        (appliedFilters.status === 'inactive' && !profile.is_active);
      const matchesProfession = appliedFilters.profession === 'all' || profile.profession === appliedFilters.profession;
      
      return matchesSearch && matchesProfileId && matchesName && matchesPhone && matchesStatus && matchesProfession;
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
        case 'profession':
          return direction * a.profession.localeCompare(b.profession);
        case 'deposit_amount':
          return direction * (a.deposit_amount - b.deposit_amount);
        case 'created_at':
        default:
          return direction * (new Date(a.created_at) - new Date(b.created_at));
      }
    });

  const uniqueProfessions = [...new Set(profiles.map(p => p.profession))].filter(Boolean);

  // Master Profile Component
  const MasterProfileView = () => {
    const masterProfile = profileInfo?.master_profile;
    if (!masterProfile) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Master Profile</h3>
            <p className="text-slate-500">No master profile found for your account.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {masterProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Master Profile</h3>
            <p className="text-slate-600 text-sm">{masterProfile.profession}</p>
            <p className="text-slate-500 text-xs">Established: {masterProfile.established_year || 'N/A'}</p>
          </div>
          <div className="flex-1"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{masterProfile.total_customers?.toLocaleString() || 'N/A'}</div>
            <div className="text-sm text-slate-500">Total Customers</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Organization Name</label>
            <input 
              type="text" 
              value={masterProfile.name} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-org-name"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Master Email</label>
            <input 
              type="email" 
              value={masterProfile.email} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-email"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Master Phone</label>
            <input 
              type="tel" 
              value={masterProfile.phone} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-phone"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">License Number</label>
            <input 
              type="text" 
              value={masterProfile.license_number || 'N/A'} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-license"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Service Area</label>
            <input 
              type="text" 
              value={masterProfile.service_area || 'N/A'} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-service-area"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Annual Revenue</label>
            <input 
              type="text" 
              value={masterProfile.annual_revenue ? `$${masterProfile.annual_revenue.toLocaleString()}` : 'N/A'} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-revenue"
              readOnly
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Address</label>
            <input 
              type="text" 
              value={masterProfile.address} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-address"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">City, State, ZIP</label>
            <input 
              type="text" 
              value={`${masterProfile.city}, ${masterProfile.state} ${masterProfile.zipcode}`} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-location"
              readOnly
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 rounded-lg border border-emerald-200">
            <div className="text-lg font-bold text-emerald-700">{masterProfile.total_customers?.toLocaleString() || '0'}</div>
            <div className="text-xs text-emerald-600">Total Customers</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-700">${masterProfile.annual_revenue?.toLocaleString() || '0'}</div>
            <div className="text-xs text-blue-600">Annual Revenue</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-700">{masterProfile.established_year || 'N/A'}</div>
            <div className="text-xs text-purple-600">Established</div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
            <div className="text-lg font-bold text-amber-700">{childUsers.length}</div>
            <div className="text-xs text-amber-600">Child Users</div>
          </div>
        </div>

        {/* Buttons removed as requested */}
      </div>
    );
  };

  // Selected User Profile Component  
  const SelectedUserProfileView = () => {
    if (!selectedUserProfile) return null;
    
    const { user: selectedUser, profile: selectedProfile } = selectedUserProfile;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => {
              setSelectedUserProfile(null);
              setActiveProfileView('user_profile');
              setShowUserList(true);
            }}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-slate-800">User Profile Details</h3>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selectedUser.name}</h3>
              <p className="text-slate-600 text-sm">{selectedUser.title || 'N/A'}</p>
              <p className="text-slate-500 text-xs">{selectedUser.email}</p>
            </div>
            <div className="flex-1"></div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600 capitalize">{selectedUser.role.replace('_', ' ')}</div>
              <div className="text-sm text-slate-500">{selectedUser.department || 'N/A'}</div>
            </div>
          </div>
          
          {/* User Details */}
          <h4 className="text-md font-semibold text-slate-700 mb-4">User Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                type="text" 
                value={selectedUser.name} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input 
                type="email" 
                value={selectedUser.email} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Role</label>
              <input 
                type="text" 
                value={selectedUser.role.replace('_', ' ').toUpperCase()} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Department</label>
              <input 
                type="text" 
                value={selectedUser.department || 'N/A'} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Title</label>
              <input 
                type="text" 
                value={selectedUser.title || 'N/A'} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Status</label>
              <input 
                type="text" 
                value={selectedUser.is_active ? 'Active' : 'Inactive'} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                readOnly
              />
            </div>
          </div>
          
          {selectedProfile && (
            <>
              <h4 className="text-md font-semibold text-slate-700 mb-4">Organization Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Organization Name</label>
                  <input 
                    type="text" 
                    value={selectedProfile.name} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Organization Email</label>
                  <input 
                    type="email" 
                    value={selectedProfile.email} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Phone</label>
                  <input 
                    type="tel" 
                    value={selectedProfile.phone} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Industry</label>
                  <input 
                    type="text" 
                    value={selectedProfile.profession} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Employee Count</label>
                  <input 
                    type="text" 
                    value={selectedProfile.employee_count || 'N/A'} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Monthly Usage</label>
                  <input 
                    type="text" 
                    value={selectedProfile.monthly_usage ? `${selectedProfile.monthly_usage.toLocaleString()} kWh` : 'N/A'} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Address</label>
                  <input 
                    type="text" 
                    value={selectedProfile.address} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">City, State, ZIP</label>
                  <input 
                    type="text" 
                    value={`${selectedProfile.city}, ${selectedProfile.state} ${selectedProfile.zipcode}`} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    readOnly
                  />
                </div>
              </div>

              {/* Organization Stats */}
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{selectedProfile.employee_count || '0'}</div>
                  <div className="text-xs text-blue-600">Employees</div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 rounded-lg border border-emerald-200">
                  <div className="text-lg font-bold text-emerald-700">${selectedProfile.deposit_amount?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-emerald-600">Deposit</div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                  <div className="text-lg font-bold text-amber-700">{selectedProfile.monthly_usage?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-amber-600">Monthly kWh</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">{selectedProfile.is_active ? 'Active' : 'Inactive'}</div>
                  <div className="text-xs text-purple-600">Status</div>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-5 flex space-x-3">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-xs">
              Edit User Profile
            </button>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-xs">
              View Services
            </button>
            <button className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-xs">
              Send Message
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User List Component with enhanced filtering and sorting
  const UserListView = () => {
    const [userFilters, setUserFilters] = useState({
      searchTerm: '',
      name: '',
      profileId: '',
      mobileNumber: '',
      profileName: '',
      role: 'all',
      status: 'all'
    });
    
    const [appliedUserFilters, setAppliedUserFilters] = useState({
      searchTerm: '',
      name: '',
      profileId: '',
      mobileNumber: '',
      profileName: '',
      role: 'all',
      status: 'all'
    });
    
    const [userSorting, setUserSorting] = useState({
      field: 'name',
      direction: 'asc'
    });
    
    const [showAdvancedUserFilters, setShowAdvancedUserFilters] = useState(false);

    // Apply user filters
    const applyUserFilters = () => {
      setAppliedUserFilters({...userFilters});
      setCurrentPage(1); // Reset to first page when filtering
    };

    // Clear user filters
    const clearUserFilters = () => {
      const clearedFilters = {
        searchTerm: '',
        name: '',
        profileId: '',
        mobileNumber: '',
        profileName: '',
        role: 'all',
        status: 'all'
      };
      setUserFilters(clearedFilters);
      setAppliedUserFilters(clearedFilters);
      setCurrentPage(1);
    };

    // Handle user sorting
    const handleUserSort = (field) => {
      setUserSorting(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    // Enhanced filtering logic
    const filteredUsers = childUsers.filter(user => {
      const matchesGlobalSearch = !appliedUserFilters.searchTerm || 
        user.name.toLowerCase().includes(appliedUserFilters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(appliedUserFilters.searchTerm.toLowerCase()) ||
        (user.profile_name && user.profile_name.toLowerCase().includes(appliedUserFilters.searchTerm.toLowerCase())) ||
        user.id.toLowerCase().includes(appliedUserFilters.searchTerm.toLowerCase());
      
      const matchesName = !appliedUserFilters.name || 
        user.name.toLowerCase().includes(appliedUserFilters.name.toLowerCase());
      
      const matchesProfileId = !appliedUserFilters.profileId || 
        user.id.toLowerCase().includes(appliedUserFilters.profileId.toLowerCase());
      
      const matchesMobile = !appliedUserFilters.mobileNumber || 
        (user.phone && user.phone.includes(appliedUserFilters.mobileNumber));
      
      const matchesProfileName = !appliedUserFilters.profileName || 
        (user.profile_name && user.profile_name.toLowerCase().includes(appliedUserFilters.profileName.toLowerCase()));
      
      const matchesRole = appliedUserFilters.role === 'all' || user.role === appliedUserFilters.role;
      
      const matchesStatus = appliedUserFilters.status === 'all' || 
        (appliedUserFilters.status === 'active' && user.is_active) ||
        (appliedUserFilters.status === 'inactive' && !user.is_active);
      
      return matchesGlobalSearch && matchesName && matchesProfileId && matchesMobile && 
             matchesProfileName && matchesRole && matchesStatus;
    });

    // Enhanced sorting logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const direction = userSorting.direction === 'asc' ? 1 : -1;
      
      switch (userSorting.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'role':
          return direction * a.role.localeCompare(b.role);
        case 'profile_name':
          return direction * (a.profile_name || '').localeCompare(b.profile_name || '');
        case 'department':
          return direction * (a.department || '').localeCompare(b.department || '');
        case 'created_at':
          return direction * (new Date(a.created_at || 0) - new Date(b.created_at || 0));
        default:
          return direction * a.name.localeCompare(b.name);
      }
    });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const handleUserSelect = (userId) => {
      fetchUserProfileDetails(userId);
    };

    // Get unique values for dropdowns
    const uniqueRoles = [...new Set(childUsers.map(u => u.role))];
    const uniqueProfiles = [...new Set(childUsers.map(u => u.profile_name).filter(Boolean))];

    const getSortIcon = (field) => {
      if (userSorting.field !== field) {
        return (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      }
      
      return userSorting.direction === 'asc' ? (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l13 0m0 0l-4-4m4 4l-4 4" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20l13 0m0 0l-4 4m4-4l-4-4" />
        </svg>
      );
    };

    return (
      <div className="space-y-4">
        {/* Enhanced Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-slate-800">Advanced User Search & Filters</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedUserFilters(!showAdvancedUserFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvancedUserFilters ? 'Hide Advanced' : 'Show Advanced'}
              </button>
              <button
                onClick={() => setShowUserList(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Global Search</label>
              <input
                type="text"
                placeholder="Search by name, email, profile, ID..."
                value={userFilters.searchTerm}
                onChange={(e) => setUserFilters({...userFilters, searchTerm: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="user-global-search"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Sort By</label>
              <select
                value={userSorting.field}
                onChange={(e) => setUserSorting({...userSorting, field: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="profile_name">Profile</option>
                <option value="department">Department</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Order</label>
              <select
                value={userSorting.direction}
                onChange={(e) => setUserSorting({...userSorting, direction: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={applyUserFilters}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
                data-testid="apply-user-filters-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={clearUserFilters}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedUserFilters && (
            <div className="border-t border-slate-200 pt-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-3">Advanced Filters</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name"
                    value={userFilters.name}
                    onChange={(e) => setUserFilters({...userFilters, name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Profile ID</label>
                  <input
                    type="text"
                    placeholder="Filter by profile ID"
                    value={userFilters.profileId}
                    onChange={(e) => setUserFilters({...userFilters, profileId: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Filter by mobile"
                    value={userFilters.mobileNumber}
                    onChange={(e) => setUserFilters({...userFilters, mobileNumber: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Profile Name</label>
                  <select
                    value={userFilters.profileName}
                    onChange={(e) => setUserFilters({...userFilters, profileName: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Profiles</option>
                    {uniqueProfiles.map(profile => (
                      <option key={profile} value={profile}>{profile}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {currentUsers.length} of {sortedUsers.length} users 
              {appliedUserFilters.searchTerm || appliedUserFilters.name || appliedUserFilters.profileId || appliedUserFilters.mobileNumber ? ' (filtered)' : ''}
            </div>
            <div className="text-sm text-slate-500">
              Sorted by {userSorting.field.replace('_', ' ')} ({userSorting.direction})
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Users ({filteredUsers.length})</h3>
                <p className="text-slate-600 mt-1 text-sm">Click on any user to view their profile details</p>
              </div>
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {currentUsers.map((user) => (
              <div 
                key={user.id} 
                className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => handleUserSelect(user.id)}
                data-testid={`user-item-${user.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{user.name}</h4>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{user.profile_name}</div>
                        <div className="text-xs text-slate-500">Profile</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
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
  const MyProfileView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || profileInfo?.user_profile?.phone || '+1-555-0101',
      department: user.department || 'Administration',
      title: user.title || 'System Administrator',
      address: profileInfo?.user_profile?.address || '123 Admin Street',
      city: profileInfo?.user_profile?.city || 'San Francisco',
      state: profileInfo?.user_profile?.state || 'CA',
      zipcode: profileInfo?.user_profile?.zipcode || '94102',
      aadharNumber: profileInfo?.user_profile?.aadhar_number || '1234-5678-9012',
      profileId: user.id || 'PROF-001',
      kycStatus: profileInfo?.user_profile?.kyc_status || 'Pending'
    });

    // Calculate stats
    const totalUsers = childUsers.length;
    const totalDeposits = profiles.reduce((sum, profile) => sum + (profile.deposit_amount || 0), 0);
    const masterDeposit = profileInfo?.master_profile?.annual_revenue || 0;
    const activeAccounts = accounts.filter(acc => acc.is_active).length;

    const handleUpdate = async () => {
      try {
        console.log('Updating profile with:', profileData);
        // Here would be API call to update profile
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    };

    const handleExport = () => {
      const exportData = {
        user: user,
        profile: profileInfo?.user_profile,
        stats: { totalUsers, totalDeposits, masterDeposit, activeAccounts },
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `my-profile-${user.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Profile data exported successfully!');
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-6 mb-6">
          {/* Left side - Profile Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">My Profile</h3>
              <p className="text-slate-600 text-sm">{profileData.title}</p>
              <p className="text-slate-500 text-xs capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Right side - Management Statistics */}
          <div className="flex-1 max-w-2xl">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Management Statistics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 rounded-lg border border-emerald-200">
                <div className="text-lg font-bold text-emerald-700">{totalUsers}</div>
                <div className="text-xs text-emerald-600">Total Users</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">${totalDeposits.toLocaleString()}</div>
                <div className="text-xs text-blue-600">User Deposits</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="text-lg font-bold text-purple-700">${masterDeposit.toLocaleString()}</div>
                <div className="text-xs text-purple-600">Master Deposit</div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                <div className="text-lg font-bold text-amber-700">{activeAccounts}</div>
                <div className="text-xs text-amber-600">Active Accounts</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Full Name</label>
            <input 
              type="text" 
              value={profileData.name} 
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
              data-testid="profile-name-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Email</label>
            <input 
              type="email" 
              value={profileData.email} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
              data-testid="profile-email-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Phone</label>
            <input 
              type="tel" 
              value={profileData.phone} 
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Profile ID</label>
            <input 
              type="text" 
              value={profileData.profileId} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
              data-testid="profile-id-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Aadhar Number</label>
            <input 
              type="text" 
              value={profileData.aadharNumber} 
              onChange={(e) => setProfileData({...profileData, aadharNumber: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
              data-testid="profile-aadhar-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">KYC Status</label>
            <select 
              value={profileData.kycStatus} 
              onChange={(e) => setProfileData({...profileData, kycStatus: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
              data-testid="profile-kyc-input"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Under Review">Under Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Department</label>
            <input 
              type="text" 
              value={profileData.department} 
              onChange={(e) => setProfileData({...profileData, department: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Title</label>
            <input 
              type="text" 
              value={profileData.title} 
              onChange={(e) => setProfileData({...profileData, title: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Role</label>
            <input 
              type="text" 
              value={user.role.replace('_', ' ').toUpperCase()} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
              data-testid="profile-role-input"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Address</label>
            <input 
              type="text" 
              value={profileData.address} 
              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">City, State, ZIP</label>
            <input 
              type="text" 
              value={`${profileData.city}, ${profileData.state} ${profileData.zipcode}`} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
            />
          </div>
        </div>

        {/* Stats Section removed - moved up */}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-xs" 
                data-testid="update-profile-btn"
              >
                Update Profile
              </button>
              <button 
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab('account-details');
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-xs"
                data-testid="view-accounts-btn"
              >
                View Accounts
              </button>
              <button 
                onClick={handleExport}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-xs"
              >
                Export Profile
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg font-medium text-xs">
                Change Password
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleUpdate}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-xs"
              >
                Save Changes
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  setProfileData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || profileInfo?.user_profile?.phone || '+1-555-0101',
                    department: user.department || 'Administration',
                    title: user.title || 'System Administrator',
                    address: profileInfo?.user_profile?.address || '123 Admin Street',
                    city: profileInfo?.user_profile?.city || 'San Francisco',
                    state: profileInfo?.user_profile?.state || 'CA',
                    zipcode: profileInfo?.user_profile?.zipcode || '94102',
                    aadharNumber: profileInfo?.user_profile?.aadhar_number || '1234-5678-9012',
                    profileId: user.id || 'PROF-001',
                    kycStatus: profileInfo?.user_profile?.kyc_status || 'Pending'
                  });
                }}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-slate-800">Profile Management</h2>
          
          {/* Profile Navigation Buttons - Enhanced with reduced spacing and consistent green color */}
          <div className="flex items-center space-x-1">
            {/* Master Profile Button - Show if has master profile OR config override */}
            {(profileInfo?.has_master_profile || APP_CONFIG.profileConfig?.showAllProfileButtons) && (
              <button
                onClick={() => {
                  setActiveProfileView('master_profile');
                  setShowUserList(false);
                  setSelectedUserProfile(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 min-w-[120px] ${
                  activeProfileView === 'master_profile'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                data-testid="master-profile-btn"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Master Profile</span>
                </div>
              </button>
            )}
            
            {/* My Profile Button - Always show */}
            <button
              onClick={() => {
                setActiveProfileView('my_profile');
                setShowUserList(false);
                setSelectedUserProfile(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 min-w-[120px] ${
                activeProfileView === 'my_profile'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
              data-testid="my-profile-btn"
            >
              <div className="flex items-center justify-center space-x-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Profile</span>
              </div>
            </button>
            
            {/* User Profile Button - Show if conditions met OR config override */}
            {((!profileInfo?.is_end_user && profileInfo?.show_user_profiles) || APP_CONFIG.profileConfig?.showAllProfileButtons) && (
              <button
                onClick={() => {
                  setActiveProfileView('user_profile');
                  setShowUserList(true);
                  setSelectedUserProfile(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 min-w-[120px] ${
                  activeProfileView === 'user_profile' || activeProfileView === 'selected_user'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                data-testid="user-profile-btn"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>User Profile</span>
                </div>
              </button>
            )}
          </div>
        </div>
        
        {/* Add Profile Button - Always show on the right with same size as other buttons */}
        <div className="flex items-center space-x-1">
          {APP_CONFIG.profileConfig?.showAddProfileButton && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 min-w-[120px] bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg border border-amber-300"
              data-testid="add-profile-btn"
            >
              <div className="flex items-center justify-center space-x-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Profile</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Content Based on Active View */}
      {activeProfileView === 'master_profile' && (
        <MasterProfileView />
      )}

      {activeProfileView === 'my_profile' && (
        <MyProfileView />
      )}

      {activeProfileView === 'selected_user' && (
        <SelectedUserProfileView />
      )}

      {activeProfileView === 'user_profile' && showUserList && (
        <UserListView />
      )}

      {activeProfileView === 'user_profile' && !showUserList && !selectedUserProfile && ((!profileInfo?.is_end_user && profileInfo?.show_user_profiles) || APP_CONFIG.profileConfig?.showAllProfileButtons) && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">User Profile Management</h3>
          <p className="text-slate-500 mb-4">View and manage user profiles under your organization.</p>
          <button
            onClick={() => setShowUserList(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
            data-testid="show-user-list-btn"
          >
            View Users ({childUsers.length})
          </button>
        </div>
      )}

      {/* Show message if no content should be displayed - but only if config override is not enabled */}
      {profileInfo?.is_end_user && activeProfileView === 'user_profile' && !APP_CONFIG.profileConfig?.showAllProfileButtons && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">End User Account</h3>
          <p className="text-slate-500">This is an end user account. User profile management is not available.</p>
        </div>
      )}
      {/* Add/Edit Profile Modal with Fixed Header/Footer */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingProfile ? 'Edit Profile' : 'Add New Profile'}
                  </h3>
                  <p className="text-emerald-100 mt-1">
                    {editingProfile ? 'Update profile information' : 'Create a new customer profile'}
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  data-testid="close-profile-modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-email"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-phone"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Profession *</label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData({...formData, profession: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-profession"
                    >
                      <option value="">Select Profession</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Restaurant Manager">Restaurant Manager</option>
                      <option value="Retail Manager">Retail Manager</option>
                      <option value="Office Manager">Office Manager</option>
                      <option value="Factory Manager">Factory Manager</option>
                      <option value="Warehouse Manager">Warehouse Manager</option>
                      <option value="IT Manager">IT Manager</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-address"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-city"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-state"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.zipcode}
                      onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                      data-testid="profile-form-zipcode"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Security Deposit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      data-testid="profile-form-deposit"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-sm disabled:opacity-50"
                  data-testid="profile-form-submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingProfile ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingProfile ? 'Update Profile' : 'Create Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
                  data-testid="profile-form-cancel"
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

export default ProfileManagement;