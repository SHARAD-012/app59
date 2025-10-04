import React, { useState, useContext, useEffect } from 'react';
import EnhancedInvoiceDetails from './EnhancedInvoiceDetails';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Billing Management Component with Role-Based Filtering and Profile-style Design
const BillingManagement = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Main category state - now using the requested categories
  const [activeInvoiceCategory, setActiveInvoiceCategory] = useState('bill_generation');
  
  // Bill Generation State
  const [billSchedules, setBillSchedules] = useState([]);
  const [billRuns, setBillRuns] = useState([]);
  const [billedAccounts, setBilledAccounts] = useState([]);
  const [billCycles, setBillCycles] = useState([]);
  
  // Bill Generation Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    bill_cycle_id: '',
    bill_run_name: '',
    bill_date: '',
    account_ids: []
  });
  
  // Bill Generation Filters
  const [billScheduleFilters, setBillScheduleFilters] = useState({
    searchTerm: '',
    status: 'all'
  });
  
  const [billRunFilters, setBillRunFilters] = useState({
    bill_cycle_id: '',
    bill_run_id: '',
    status: 'all'
  });
  
  const [billedAccountFilters, setBilledAccountFilters] = useState({
    bill_cycle_id: '',
    bill_run_id: '',
    account_id: ''
  });
  
  // Pagination for bill generation sections  
  const [billSchedulePage, setBillSchedulePage] = useState(1);
  const [billRunPage, setBillRunPage] = useState(1);
  const [billedAccountPage, setBilledAccountPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Sub-category state for Bill Generation
  const [activeBillGenTab, setActiveBillGenTab] = useState('bill_schedule');
  
  // Payment functionality state
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showUnpaidInvoicesModal, setShowUnpaidInvoicesModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  
  // Enhanced Filtering State - ProfileManagement style with categories
  const [selfInvoiceFilters, setSelfInvoiceFilters] = useState({
    searchTerm: '',
    accountName: '',
    month: '',
    invoiceId: '',
    paidStatus: 'all'
  });
  
  const [appliedSelfInvoiceFilters, setAppliedSelfInvoiceFilters] = useState({
    searchTerm: '',
    accountName: '',
    month: '',
    invoiceId: '',
    paidStatus: 'all'
  });
  
  const [userInvoiceFilters, setUserInvoiceFilters] = useState({
    searchTerm: '',
    accountName: '',
    month: '',
    invoiceId: '',
    paidStatus: 'all'
  });
  
  const [appliedUserInvoiceFilters, setAppliedUserInvoiceFilters] = useState({
    searchTerm: '',
    accountName: '',
    month: '',
    invoiceId: '',
    paidStatus: 'all'
  });

  // Advanced search toggles - ProfileManagement style
  const [showAdvancedSelfFilters, setShowAdvancedSelfFilters] = useState(false);
  const [showAdvancedUserFilters, setShowAdvancedUserFilters] = useState(false);
  
  // Missing state variables for the current structure
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoiceFilters, setInvoiceFilters] = useState({
    searchTerm: '',
    invoiceId: '',
    status: 'all',
    accountId: '',
    profileId: '',
    profileName: ''
  });
  const [appliedInvoiceFilters, setAppliedInvoiceFilters] = useState({
    searchTerm: '',
    invoiceId: '',
    status: 'all',
    accountId: '',
    profileId: '',
    profileName: ''
  });
  const [showAdvancedInvoiceFilters, setShowAdvancedInvoiceFilters] = useState(false);
  const [profileBillFilters, setProfileBillFilters] = useState({
    searchTerm: '',
    profileId: '',
    profileName: ''
  });
  const [accountBillFilters, setAccountBillFilters] = useState({
    searchTerm: '',
    profileId: '',
    accountId: ''
  });
  
  // Pagination state - ProfileManagement style
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  
  // Invoice details modal state
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    fetchInvoices();
    fetchAccounts();
    fetchProfiles();
    fetchServices();
    calculateOutstandingBalance();
    // Fetch bill generation data
    fetchBillCycles();
    fetchBillSchedules();
    fetchBillRuns();
    fetchBilledAccounts();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Enhanced mock invoice data with more variety for the new categories
      const mockInvoices = [
        // Self Invoices
        {
          id: 'inv_self_001',
          invoice_number: 'SELF-000123',
          account_id: 'acc_001',
          account_name: 'Tech Solutions Inc',
          profile_id: 'prof_001',
          total_amount: 295.50,
          status: 'paid',
          paid_status: true,
          due_date: new Date('2024-02-15'),
          created_at: new Date('2024-01-15'),
          month: 'January 2024',
          category: 'self',
          charges: 'Monthly Service Fee',
          items: [
            { description: 'Electricity Service', amount: 250.00 },
            { description: 'Setup Fee', amount: 45.50 }
          ]
        },
        {
          id: 'inv_self_002',
          invoice_number: 'SELF-000124',
          account_id: 'acc_001',
          account_name: 'Green Restaurant',
          profile_id: 'prof_001',
          total_amount: 187.25,
          status: 'overdue',
          paid_status: false,
          due_date: new Date('2024-03-10'),
          created_at: new Date('2024-02-10'),
          month: 'February 2024',
          category: 'self',
          charges: 'Utility Services',
          items: [
            { description: 'Water Service', amount: 85.00 },
            { description: 'Late Fee', amount: 102.25 }
          ]
        },
        {
          id: 'inv_self_003',
          invoice_number: 'SELF-000125',
          account_id: 'acc_002',
          account_name: 'Smith Enterprises',
          profile_id: 'prof_002',
          total_amount: 425.80,
          status: 'sent',
          paid_status: false,
          due_date: new Date('2024-04-15'),
          created_at: new Date('2024-03-15'),
          month: 'March 2024',
          category: 'self',
          charges: 'Internet & Equipment',
          items: [
            { description: 'Internet Service', amount: 120.00 },
            { description: 'Equipment Rental', amount: 305.80 }
          ]
        },
        // User Invoices
        {
          id: 'inv_user_001',
          invoice_number: 'USER-000123',
          account_id: 'acc_003',
          account_name: 'Johnson LLC',
          profile_id: 'prof_003',
          total_amount: 345.75,
          status: 'sent',
          paid_status: false,
          due_date: new Date('2024-04-20'),
          created_at: new Date('2024-03-20'),
          month: 'March 2024',
          category: 'user',
          charges: 'Gas Services',
          items: [
            { description: 'Gas Service', amount: 150.00 },
            { description: 'Maintenance Fee', amount: 195.75 }
          ]
        },
        {
          id: 'inv_user_002',
          invoice_number: 'USER-000124',
          account_id: 'acc_004',
          account_name: 'Metro Solutions',
          profile_id: 'prof_004',
          total_amount: 678.90,
          status: 'paid',
          paid_status: true,
          due_date: new Date('2024-02-28'),
          created_at: new Date('2024-01-28'),
          month: 'February 2024',
          category: 'user',
          charges: 'Commercial Package',
          items: [
            { description: 'Electricity Service', amount: 450.00 },
            { description: 'Water Service', amount: 150.00 },
            { description: 'Waste Management', amount: 78.90 }
          ]
        },
        {
          id: 'inv_user_003',
          invoice_number: 'USER-000125',
          account_id: 'acc_005',
          account_name: 'Bright Consulting',
          profile_id: 'prof_005',
          total_amount: 234.60,
          status: 'overdue',
          paid_status: false,
          due_date: new Date('2024-03-05'),
          created_at: new Date('2024-02-05'),
          month: 'February 2024',
          category: 'user',
          charges: 'Basic Package',
          items: [
            { description: 'Electricity Service', amount: 180.00 },
            { description: 'Service Fee', amount: 54.60 }
          ]
        }
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const calculateOutstandingBalance = () => {
    // Calculate outstanding balance for current user/accounts
    let outstanding = 0;
    if (user.role === 'user') {
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      const unpaidInvoices = invoices.filter(invoice => 
        userAccountIds.includes(invoice.account_id) && 
        invoice.status !== 'paid'
      );
      outstanding = unpaidInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    } else {
      const unpaidInvoices = invoices.filter(invoice => invoice.status !== 'paid');
      outstanding = unpaidInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    }
    setOutstandingBalance(outstanding);
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

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Bill Generation Fetch Functions
  const fetchBillCycles = async () => {
    try {
      const response = await axios.get(`${API}/billing/cycles`);
      setBillCycles(response.data);
    } catch (error) {
      console.error('Error fetching bill cycles:', error);
    }
  };

  const fetchBillSchedules = async () => {
    try {
      const response = await axios.get(`${API}/billing/schedules`);
      setBillSchedules(response.data);
    } catch (error) {
      console.error('Error fetching bill schedules:', error);
    }
  };

  const fetchBillRuns = async () => {
    try {
      const response = await axios.get(`${API}/billing/runs`, {
        params: billRunFilters
      });
      setBillRuns(response.data);
    } catch (error) {
      console.error('Error fetching bill runs:', error);
    }
  };

  const fetchBilledAccounts = async () => {
    try {
      const response = await axios.get(`${API}/billing/accounts`, {
        params: billedAccountFilters
      });
      setBilledAccounts(response.data);
    } catch (error) {
      console.error('Error fetching billed accounts:', error);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/billing/schedules`, scheduleForm);
      if (response.data) {
        alert('Bill schedule created successfully!');
        setShowScheduleModal(false);
        setScheduleForm({
          bill_cycle_id: '',
          bill_run_name: '',
          bill_date: '',
          account_ids: []
        });
        fetchBillSchedules();
        fetchBillRuns();
      }
    } catch (error) {
      console.error('Error creating bill schedule:', error);
      alert('Failed to create bill schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAccount = async (accountBillId) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API}/billing/accounts/${accountBillId}/approve`);
      if (response.data) {
        alert('Account bill approved successfully!');
        fetchBilledAccounts();
        fetchBillRuns();
      }
    } catch (error) {
      console.error('Error approving account bill:', error);
      alert('Failed to approve account bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filter functions - ProfileManagement style
  const applySelfInvoiceFilters = () => {
    console.log('Applying self invoice filters:', selfInvoiceFilters);
    setAppliedSelfInvoiceFilters({...selfInvoiceFilters});
    setCurrentPage(1); // Reset to first page when filtering
  };

  const applyUserInvoiceFilters = () => {
    console.log('Applying user invoice filters:', userInvoiceFilters);
    setAppliedUserInvoiceFilters({...userInvoiceFilters});
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear filter functions - ProfileManagement style
  const clearSelfInvoiceFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      accountName: '',
      month: '',
      invoiceId: '',
      paidStatus: 'all'
    };
    setSelfInvoiceFilters(clearedFilters);
    setAppliedSelfInvoiceFilters(clearedFilters);
    setCurrentPage(1);
  };

  const clearUserInvoiceFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      accountName: '',
      month: '',
      invoiceId: '',
      paidStatus: 'all'
    };
    setUserInvoiceFilters(clearedFilters);
    setAppliedUserInvoiceFilters(clearedFilters);
    setCurrentPage(1);
  };

  // Invoice and payment details functions
  const handleViewInvoiceDetails = (invoice) => {
    setSelectedInvoiceDetails(invoice);
    setShowInvoiceDetailsModal(true);
  };

  const handleViewPaymentDetails = (invoice) => {
    // Mock payment details - in real app this would come from backend
    const mockPaymentDetails = {
      payment_id: `pay_${invoice.id}`,
      payment_method: 'Credit Card',
      card_last_four: '****1234',
      payment_date: new Date(invoice.due_date),
      transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}`,
      payment_gateway: 'Stripe',
      amount_paid: invoice.total_amount,
      payment_status: 'completed',
      reference_number: `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      invoice: invoice
    };
    setSelectedPaymentDetails(mockPaymentDetails);
    setShowPaymentDetailsModal(true);
  };

  // Missing functions for the current structure
  const applyInvoiceFilters = () => {
    console.log('Applying invoice filters:', invoiceFilters);
    setAppliedInvoiceFilters({...invoiceFilters});
    setCurrentPage(1);
  };

  const clearAllInvoiceFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      invoiceId: '',
      status: 'all',
      accountId: '',
      profileId: '',
      profileName: ''
    };
    setInvoiceFilters(clearedFilters);
    setAppliedInvoiceFilters(clearedFilters);
    setCurrentPage(1);
  };

  const applyProfileBillFilters = () => {
    console.log('Applying profile bill filters:', profileBillFilters);
    // In a real app, this would filter the profiles
  };

  const applyAccountBillFilters = () => {
    console.log('Applying account bill filters:', accountBillFilters);
    // In a real app, this would filter the accounts
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Payment functionality
  const handleMakePaymentClick = () => {
    setShowPaymentDropdown(true);
  };

  const handlePaymentTypeSelect = (type) => {
    setSelectedPaymentType(type);
    if (type === 'invoice') {
      setShowUnpaidInvoicesModal(true);
    }
    setShowPaymentDropdown(false);
  };

  const getUnpaidInvoices = () => {
    let unpaidInvoices = invoices.filter(invoice => invoice.status !== 'paid');
    
    if (user.role === 'user') {
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      unpaidInvoices = unpaidInvoices.filter(invoice => userAccountIds.includes(invoice.account_id));
    }
    
    if (selectedAccount) {
      unpaidInvoices = unpaidInvoices.filter(invoice => invoice.account_id === selectedAccount);
    }
    
    return unpaidInvoices;
  };

  const handleInvoiceSelect = (invoiceId, selected) => {
    setSelectedInvoices(prev => {
      if (selected) {
        return [...prev, invoiceId];
      } else {
        return prev.filter(id => id !== invoiceId);
      }
    });
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      // Mock payment processing
      console.log('Processing payment for invoices:', selectedInvoices);
      console.log('Payment type:', selectedPaymentType);
      console.log('Selected account:', selectedAccount);
      
      // In real app, this would make API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close modal and refresh data
      setShowUnpaidInvoicesModal(false);
      setSelectedInvoices([]);
      setSelectedAccount('');
      setSelectedPaymentType('');
      
      // Refresh data
      fetchInvoices();
      calculateOutstandingBalance();
      
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get profile info
  const getProfileInfo = (profileId) => {
    return profiles.find(profile => profile.id === profileId);
  };

  // Get account info
  const getAccountInfo = (accountId) => {
    return accounts.find(account => account.id === accountId);
  };

  // Count accounts under profile
  const getAccountCountForProfile = (profileId) => {
    return accounts.filter(account => account.profile_id === profileId).length;
  };

  // Count services under profile (through accounts)
  const getServiceCountForProfile = (profileId) => {
    const profileAccounts = accounts.filter(account => account.profile_id === profileId);
    return services.filter(service => 
      profileAccounts.some(account => account.id === service.account_id)
    ).length;
  };

  // Count invoices for account
  const getInvoiceCountForAccount = (accountId) => {
    return invoices.filter(invoice => invoice.account_id === accountId).length;
  };

  // Enhanced filtering for invoices based on user role - using applied filters
  const getFilteredInvoices = () => {
    let filtered = [...invoices];

    // Role-based filtering
    if (user.role === 'user') {
      // Users see only their own invoices
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      filtered = filtered.filter(invoice => userAccountIds.includes(invoice.account_id));
    }

    // Apply search and filters using appliedInvoiceFilters
    filtered = filtered.filter(invoice => {
      const matchesSearch = !appliedInvoiceFilters.searchTerm || 
        invoice.invoice_number.toLowerCase().includes(appliedInvoiceFilters.searchTerm.toLowerCase()) ||
        invoice.total_amount.toString().includes(appliedInvoiceFilters.searchTerm);
      
      const matchesInvoiceId = !appliedInvoiceFilters.invoiceId || invoice.id.includes(appliedInvoiceFilters.invoiceId);
      const matchesStatus = appliedInvoiceFilters.status === 'all' || invoice.status === appliedInvoiceFilters.status;
      
      // Role-specific filters
      let roleFilter = true;
      if (user.role === 'admin' && appliedInvoiceFilters.accountId) {
        roleFilter = invoice.account_id === appliedInvoiceFilters.accountId;
      } else if (user.role === 'super_admin') {
        if (appliedInvoiceFilters.profileId) {
          roleFilter = invoice.profile_id === appliedInvoiceFilters.profileId;
        }
        if (appliedInvoiceFilters.profileName) {
          const profile = getProfileInfo(invoice.profile_id);
          roleFilter = roleFilter && profile?.name.toLowerCase().includes(appliedInvoiceFilters.profileName.toLowerCase());
        }
      }
      
      return matchesSearch && matchesInvoiceId && matchesStatus && roleFilter;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      
      switch (sorting.field) {
        case 'invoice_number':
          return direction * a.invoice_number.localeCompare(b.invoice_number);
        case 'total_amount':
          return direction * (a.total_amount - b.total_amount);
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'due_date':
          return direction * (new Date(a.due_date) - new Date(b.due_date));
        case 'created_at':
        default:
          return direction * (new Date(a.created_at) - new Date(b.created_at));
      }
    });
  };

  // Enhanced filtering functions for Self Invoices - ProfileManagement style
  const getFilteredSelfInvoices = () => {
    let filtered = invoices.filter(invoice => invoice.category === 'self');
    
    // Role-based filtering
    if (user.role === 'user') {
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      filtered = filtered.filter(invoice => userAccountIds.includes(invoice.account_id));
    }
    
    // Apply filters using appliedSelfInvoiceFilters
    filtered = filtered.filter(invoice => {
      const matchesSearch = !appliedSelfInvoiceFilters.searchTerm || 
        invoice.invoice_number.toLowerCase().includes(appliedSelfInvoiceFilters.searchTerm.toLowerCase()) ||
        invoice.account_name.toLowerCase().includes(appliedSelfInvoiceFilters.searchTerm.toLowerCase()) ||
        invoice.charges.toLowerCase().includes(appliedSelfInvoiceFilters.searchTerm.toLowerCase());
      
      const matchesAccountName = !appliedSelfInvoiceFilters.accountName || 
        invoice.account_name.toLowerCase().includes(appliedSelfInvoiceFilters.accountName.toLowerCase());
      
      const matchesMonth = !appliedSelfInvoiceFilters.month || 
        invoice.month.toLowerCase().includes(appliedSelfInvoiceFilters.month.toLowerCase());
      
      const matchesInvoiceId = !appliedSelfInvoiceFilters.invoiceId || 
        invoice.invoice_number.toLowerCase().includes(appliedSelfInvoiceFilters.invoiceId.toLowerCase());
      
      const matchesPaidStatus = appliedSelfInvoiceFilters.paidStatus === 'all' || 
        (appliedSelfInvoiceFilters.paidStatus === 'paid' && invoice.paid_status) ||
        (appliedSelfInvoiceFilters.paidStatus === 'unpaid' && !invoice.paid_status);
      
      return matchesSearch && matchesAccountName && matchesMonth && matchesInvoiceId && matchesPaidStatus;
    });
    
    return filtered.sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      return direction * (new Date(a.created_at) - new Date(b.created_at));
    });
  };

  // Enhanced filtering functions for User Invoices - ProfileManagement style
  const getFilteredUserInvoices = () => {
    let filtered = invoices.filter(invoice => invoice.category === 'user');
    
    // Role-based filtering
    if (user.role === 'user') {
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      filtered = filtered.filter(invoice => userAccountIds.includes(invoice.account_id));
    }
    
    // Apply filters using appliedUserInvoiceFilters
    filtered = filtered.filter(invoice => {
      const matchesSearch = !appliedUserInvoiceFilters.searchTerm || 
        invoice.invoice_number.toLowerCase().includes(appliedUserInvoiceFilters.searchTerm.toLowerCase()) ||
        invoice.account_name.toLowerCase().includes(appliedUserInvoiceFilters.searchTerm.toLowerCase()) ||
        invoice.charges.toLowerCase().includes(appliedUserInvoiceFilters.searchTerm.toLowerCase());
      
      const matchesAccountName = !appliedUserInvoiceFilters.accountName || 
        invoice.account_name.toLowerCase().includes(appliedUserInvoiceFilters.accountName.toLowerCase());
      
      const matchesMonth = !appliedUserInvoiceFilters.month || 
        invoice.month.toLowerCase().includes(appliedUserInvoiceFilters.month.toLowerCase());
      
      const matchesInvoiceId = !appliedUserInvoiceFilters.invoiceId || 
        invoice.invoice_number.toLowerCase().includes(appliedUserInvoiceFilters.invoiceId.toLowerCase());
      
      const matchesPaidStatus = appliedUserInvoiceFilters.paidStatus === 'all' || 
        (appliedUserInvoiceFilters.paidStatus === 'paid' && invoice.paid_status) ||
        (appliedUserInvoiceFilters.paidStatus === 'unpaid' && !invoice.paid_status);
      
      return matchesSearch && matchesAccountName && matchesMonth && matchesInvoiceId && matchesPaidStatus;
    });
    
    return filtered.sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      return direction * (new Date(a.created_at) - new Date(b.created_at));
    });
  };

  const uniqueStatuses = ['paid', 'sent', 'overdue', 'draft', 'cancelled'];

  // Render Bill Generation Content
  const renderBillGenerationContent = () => {
    switch(activeBillGenTab) {
      case 'bill_schedule':
        return renderBillScheduleTab();
      case 'view_bill':
        return renderViewBillTab();
      case 'approve_bill':
        return renderApproveBillTab();
      default:
        return renderBillScheduleTab();
    }
  };

  // Bill Schedule Tab
  const renderBillScheduleTab = () => {
    const filteredSchedules = billSchedules.filter(schedule => {
      return (!billScheduleFilters.searchTerm || 
        schedule.bill_run_name.toLowerCase().includes(billScheduleFilters.searchTerm.toLowerCase()) ||
        schedule.bill_cycle_name.toLowerCase().includes(billScheduleFilters.searchTerm.toLowerCase())) &&
        (billScheduleFilters.status === 'all' || schedule.status === billScheduleFilters.status);
    });

    const paginatedSchedules = filteredSchedules.slice(
      (billSchedulePage - 1) * itemsPerPage,
      billSchedulePage * itemsPerPage
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header with Schedule Now Button */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Bill Schedule Management</h3>
            <p className="text-slate-600 text-sm">Manage automated billing schedules and recurring charges</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg font-medium"
            data-testid="schedule-now-btn"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Schedule Now</span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <input
                type="text"
                placeholder="Search schedules..."
                value={billScheduleFilters.searchTerm}
                onChange={(e) => setBillScheduleFilters({...billScheduleFilters, searchTerm: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={billScheduleFilters.status}
                onChange={(e) => setBillScheduleFilters({...billScheduleFilters, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBillSchedules}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg font-medium text-sm w-full"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bill Schedules Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <h4 className="text-lg font-bold text-purple-800">Default Bill Schedule Details ({filteredSchedules.length})</h4>
          </div>
          
          <div className="divide-y divide-slate-200">
            {paginatedSchedules.map((schedule) => (
              <div key={schedule.id} className="p-6 hover:bg-slate-50 transition-colors" data-testid={`schedule-${schedule.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Schedule Name</div>
                          <div className="text-slate-900 font-medium">{schedule.bill_run_name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Bill Cycle</div>
                          <div className="text-slate-900 font-medium">{schedule.bill_cycle_name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Scheduled Date</div>
                          <div className="text-slate-900 font-medium">{new Date(schedule.bill_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Accounts</div>
                          <div className="text-slate-900 font-medium">{schedule.account_count} accounts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      schedule.status === 'processing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      schedule.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </div>
                    
                    <button className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors" title="View Details">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredSchedules.length > itemsPerPage && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing {((billSchedulePage - 1) * itemsPerPage) + 1} to {Math.min(billSchedulePage * itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} schedules
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBillSchedulePage(Math.max(1, billSchedulePage - 1))}
                  disabled={billSchedulePage === 1}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setBillSchedulePage(billSchedulePage + 1)}
                  disabled={billSchedulePage * itemsPerPage >= filteredSchedules.length}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Bill Schedules Found</h3>
              <p className="text-slate-500 mb-4">Create your first bill schedule to get started.</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg font-medium"
              >
                Create Schedule
              </button>
            </div>
          )}
        </div>

        {/* Schedule Now Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Schedule New Bill Run</h3>
                    <p className="text-purple-100 text-sm">Configure billing schedule details</p>
                  </div>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-white hover:text-purple-200 transition-colors"
                    data-testid="close-schedule-modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bill Cycle Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Bill Cycle *</label>
                    <select
                      value={scheduleForm.bill_cycle_id}
                      onChange={(e) => setScheduleForm({...scheduleForm, bill_cycle_id: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      data-testid="bill-cycle-select"
                    >
                      <option value="">Select Bill Cycle</option>
                      {billCycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>{cycle.name} ({cycle.frequency})</option>
                      ))}
                    </select>
                  </div>

                  {/* Bill Run Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Bill Run Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., March 2024 Bills"
                      value={scheduleForm.bill_run_name}
                      onChange={(e) => setScheduleForm({...scheduleForm, bill_run_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      data-testid="bill-run-name"
                    />
                  </div>

                  {/* Bill Date Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Bill Date *</label>
                    <input
                      type="date"
                      value={scheduleForm.bill_date}
                      onChange={(e) => setScheduleForm({...scheduleForm, bill_date: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      data-testid="bill-date"
                    />
                  </div>
                </div>

                {/* Account Selection Note */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-800">Account Selection</h4>
                      <p className="text-xs text-purple-700 mt-1">This schedule will bill all accounts associated with the selected bill cycle. Specific account targeting can be configured in advanced settings.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setScheduleForm({
                        bill_cycle_id: '',
                        bill_run_name: '',
                        bill_date: '',
                        account_ids: []
                      });
                    }}
                    className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium"
                    data-testid="cancel-schedule"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setScheduleForm({
                          bill_cycle_id: '',
                          bill_run_name: '',
                          bill_date: '',
                          account_ids: []
                        });
                      }}
                      className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium"
                      data-testid="clear-schedule-form"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleCreateSchedule}
                      disabled={!scheduleForm.bill_cycle_id || !scheduleForm.bill_run_name || !scheduleForm.bill_date || loading}
                      className={`px-8 py-3 rounded-xl font-medium transition-all ${
                        !scheduleForm.bill_cycle_id || !scheduleForm.bill_run_name || !scheduleForm.bill_date || loading
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                      data-testid="create-schedule-btn"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Schedule'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // View Bill Tab
  const renderViewBillTab = () => {
    const filteredRuns = billRuns.filter(run => {
      return (!billRunFilters.bill_cycle_id || run.bill_cycle_id === billRunFilters.bill_cycle_id) &&
        (!billRunFilters.bill_run_id || run.id === billRunFilters.bill_run_id) &&
        (billRunFilters.status === 'all' || run.status === billRunFilters.status);
    });

    const paginatedRuns = filteredRuns.slice(
      (billRunPage - 1) * itemsPerPage,
      billRunPage * itemsPerPage
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-800">View Generated Bills</h3>
          <p className="text-slate-600 text-sm">Review and manage bill runs with detailed statistics</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Bill Cycle ID</label>
              <select
                value={billRunFilters.bill_cycle_id}
                onChange={(e) => setBillRunFilters({...billRunFilters, bill_cycle_id: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cycles</option>
                {billCycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Bill Run ID</label>
              <select
                value={billRunFilters.bill_run_id}
                onChange={(e) => setBillRunFilters({...billRunFilters, bill_run_id: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Runs</option>
                {billRuns.map(run => (
                  <option key={run.id} value={run.id}>{run.run_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={billRunFilters.status}
                onChange={(e) => setBillRunFilters({...billRunFilters, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBillRuns}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm w-full"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bill Runs Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h4 className="text-lg font-bold text-blue-800">Bill Run Data ({filteredRuns.length})</h4>
          </div>
          
          <div className="divide-y divide-slate-200">
            {paginatedRuns.map((run) => (
              <div key={run.id} className="p-6 hover:bg-slate-50 transition-colors" data-testid={`bill-run-${run.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Run Name</div>
                          <div className="text-slate-900 font-medium">{run.run_name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Bill Cycle</div>
                          <div className="text-slate-900 font-medium">{run.bill_cycle_name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Total Accounts</div>
                          <div className="text-slate-900 font-medium">{run.total_accounts}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Bills Generated</div>
                          <div className="text-slate-900 font-medium">{run.bills_generated}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">Bills Approved</div>
                          <div className="text-slate-900 font-medium">{run.bills_approved}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Run Date: {new Date(run.run_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      run.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      run.status === 'processing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                    </div>
                    
                    <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredRuns.length > itemsPerPage && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing {((billRunPage - 1) * itemsPerPage) + 1} to {Math.min(billRunPage * itemsPerPage, filteredRuns.length)} of {filteredRuns.length} runs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBillRunPage(Math.max(1, billRunPage - 1))}
                  disabled={billRunPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setBillRunPage(billRunPage + 1)}
                  disabled={billRunPage * itemsPerPage >= filteredRuns.length}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredRuns.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Bill Runs Found</h3>
              <p className="text-slate-500">No bill runs match your current filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Approve Bill Tab
  const renderApproveBillTab = () => {
    const filteredAccounts = billedAccounts.filter(account => {
      return (!billedAccountFilters.bill_cycle_id || 
        billRuns.find(r => r.id === account.bill_run_id)?.bill_cycle_id === billedAccountFilters.bill_cycle_id) &&
        (!billedAccountFilters.bill_run_id || account.bill_run_id === billedAccountFilters.bill_run_id) &&
        (!billedAccountFilters.account_id || account.account_id === billedAccountFilters.account_id);
    });

    const paginatedAccounts = filteredAccounts.slice(
      (billedAccountPage - 1) * itemsPerPage,
      billedAccountPage * itemsPerPage
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-800">Bill Approval Workflow</h3>
          <p className="text-slate-600 text-sm">Review and approve billed accounts individually</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Bill Cycle ID</label>
              <select
                value={billedAccountFilters.bill_cycle_id}
                onChange={(e) => setBilledAccountFilters({...billedAccountFilters, bill_cycle_id: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Cycles</option>
                {billCycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Bill Run ID</label>
              <select
                value={billedAccountFilters.bill_run_id}
                onChange={(e) => setBilledAccountFilters({...billedAccountFilters, bill_run_id: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Runs</option>
                {billRuns.map(run => (
                  <option key={run.id} value={run.id}>{run.run_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Account</label>
              <select
                value={billedAccountFilters.account_id}
                onChange={(e) => setBilledAccountFilters({...billedAccountFilters, account_id: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBilledAccounts}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium text-sm w-full"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Billed Accounts Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <h4 className="text-lg font-bold text-green-800">Billed Accounts Data ({filteredAccounts.length})</h4>
          </div>
          
          <div className="divide-y divide-slate-200">
            {paginatedAccounts.map((account) => {
              const billRun = billRuns.find(r => r.id === account.bill_run_id);
              
              return (
                <div key={account.id} className="p-6 hover:bg-slate-50 transition-colors" data-testid={`billed-account-${account.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Account Name</div>
                            <div className="text-slate-900 font-medium">{account.account_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Charges</div>
                            <div className="text-slate-900 font-medium">${account.charges.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Bill Date</div>
                            <div className="text-slate-900 font-medium">{new Date(account.bill_date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Due Date</div>
                            <div className="text-slate-900 font-medium">{new Date(account.due_date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Bill Run</div>
                            <div className="text-slate-900 font-medium">{billRun?.run_name || 'Unknown'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.status === 'approved' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </div>
                      
                      {account.status === 'billed' && (
                        <button
                          onClick={() => handleApproveAccount(account.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium text-sm"
                          data-testid={`approve-account-${account.id}`}
                        >
                          {loading ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                      
                      <button className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors" title="View Details">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {filteredAccounts.length > itemsPerPage && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing {((billedAccountPage - 1) * itemsPerPage) + 1} to {Math.min(billedAccountPage * itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBilledAccountPage(Math.max(1, billedAccountPage - 1))}
                  disabled={billedAccountPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setBilledAccountPage(billedAccountPage + 1)}
                  disabled={billedAccountPage * itemsPerPage >= filteredAccounts.length}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Billed Accounts Found</h3>
              <p className="text-slate-500">No billed accounts match your current filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header - ProfileManagement style */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-slate-800">Invoice Management</h2>
          
          {/* Main Category Navigation Buttons - ProfileManagement style */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveInvoiceCategory('bill_generation');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[140px] ${
                activeInvoiceCategory === 'bill_generation'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
              data-testid="bill-generation-btn"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                </svg>
                <span>Bill Generation</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveInvoiceCategory('self_invoices');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[140px] ${
                activeInvoiceCategory === 'self_invoices'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
              data-testid="self-invoices-btn"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Self Invoices</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveInvoiceCategory('user_invoices');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[140px] ${
                activeInvoiceCategory === 'user_invoices'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
              data-testid="user-invoices-btn"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>User Invoices</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Outstanding Balance - simplified */}
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Outstanding Balance</div>
          <div className={`text-lg font-bold ${
            outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            ${outstandingBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Bill Generation Section */}
      {activeInvoiceCategory === 'bill_generation' && (
        <div className="space-y-4">
          {/* Bill Generation Sub-tabs - ProfileManagement style */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">Bill Generation Tools</h4>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveBillGenTab('bill_schedule')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeBillGenTab === 'bill_schedule'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                data-testid="bill-schedule-tab"
              >
                Bill Schedule
              </button>
              <button
                onClick={() => setActiveBillGenTab('view_bill')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeBillGenTab === 'view_bill'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                data-testid="view-bill-tab"
              >
                View Bill
              </button>
              <button
                onClick={() => setActiveBillGenTab('approve_bill')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeBillGenTab === 'approve_bill'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
                data-testid="approve-bill-tab"
              >
                Approve Bill
              </button>
            </div>
          </div>

          {/* Bill Generation Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            {renderBillGenerationContent()}
          </div>
        </div>
      )}

      {/* Self Invoices Section */}
      {activeInvoiceCategory === 'self_invoices' && (
        <div className="space-y-4">
          {/* Self Invoice Filters - ProfileManagement style */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">Advanced Self Invoice Search & Filters</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAdvancedSelfFilters(!showAdvancedSelfFilters)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    showAdvancedSelfFilters
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid="toggle-advanced-self-filters"
                >
                  {showAdvancedSelfFilters ? 'Simple Search' : 'Advanced Search'}
                </button>
                <button
                  onClick={clearSelfInvoiceFilters}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  data-testid="clear-self-filters"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Basic Search - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Global Search</label>
                <input
                  type="text"
                  placeholder="Search by invoice, account, charges..."
                  value={selfInvoiceFilters.searchTerm}
                  onChange={(e) => setSelfInvoiceFilters({...selfInvoiceFilters, searchTerm: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="self-global-search"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Paid Status</label>
                <select
                  value={selfInvoiceFilters.paidStatus}
                  onChange={(e) => setSelfInvoiceFilters({...selfInvoiceFilters, paidStatus: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Month</label>
                <input
                  type="text"
                  placeholder="Filter by month..."
                  value={selfInvoiceFilters.month}
                  onChange={(e) => setSelfInvoiceFilters({...selfInvoiceFilters, month: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={applySelfInvoiceFilters}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium text-sm"
                  data-testid="apply-self-filters-btn"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearSelfInvoiceFilters}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedSelfFilters && (
              <div className="border-t border-slate-200 pt-3">
                <h5 className="text-sm font-semibold text-slate-700 mb-3">Advanced Filters</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Account Name</label>
                    <input
                      type="text"
                      placeholder="Filter by account name"
                      value={selfInvoiceFilters.accountName}
                      onChange={(e) => setSelfInvoiceFilters({...selfInvoiceFilters, accountName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Invoice ID</label>
                    <input
                      type="text"
                      placeholder="Filter by invoice ID"
                      value={selfInvoiceFilters.invoiceId}
                      onChange={(e) => setSelfInvoiceFilters({...selfInvoiceFilters, invoiceId: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Results Summary */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {getFilteredSelfInvoices().length} self invoices
                {(appliedSelfInvoiceFilters.searchTerm || appliedSelfInvoiceFilters.accountName || appliedSelfInvoiceFilters.month || appliedSelfInvoiceFilters.invoiceId || appliedSelfInvoiceFilters.paidStatus !== 'all') ? ' (filtered)' : ''}
              </div>
              {(JSON.stringify(selfInvoiceFilters) !== JSON.stringify(appliedSelfInvoiceFilters)) && (
                <span className="text-sm text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-lg font-medium border border-amber-300 shadow-sm">
                  Filters changed - Click Apply
                </span>
              )}
            </div>
          </div>

          {/* Self Invoices Table */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b border-emerald-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-emerald-800">Self Invoices ({getFilteredSelfInvoices().length})</h3>
                  <p className="text-emerald-600 mt-1 text-sm">Your personal invoices with account details and payment status</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {getFilteredSelfInvoices().map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-emerald-50/30 transition-colors" data-testid={`self-invoice-${invoice.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Account Name</div>
                            <div className="text-slate-900 font-medium">{invoice.account_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Month</div>
                            <div className="text-slate-900 font-medium">{invoice.month}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Charges</div>
                            <div className="text-slate-900 font-medium">${invoice.total_amount.toFixed(2)}</div>
                            <div className="text-xs text-slate-500">{invoice.charges}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Due Date</div>
                            <div className="text-slate-900 font-medium">{new Date(invoice.due_date).toLocaleDateString()}</div>
                            <div className={`text-xs font-medium ${
                              new Date(invoice.due_date) < new Date() && !invoice.paid_status 
                                ? 'text-red-500' : 'text-slate-500'
                            }`}>
                              {new Date(invoice.due_date) < new Date() && !invoice.paid_status 
                                ? 'Overdue' : 'On time'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.paid_status 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {invoice.paid_status ? 'Paid' : 'Unpaid'}
                      </div>
                      
                      <button 
                        onClick={() => handleViewInvoiceDetails(invoice)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors" 
                        data-testid={`view-self-invoice-${invoice.id}`}
                        title="View Invoice Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* View Payment button removed as requested */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Self Invoices */}
            {getFilteredSelfInvoices().length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Self Invoices Found</h3>
                <p className="text-slate-500">No invoices match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Invoices Section */}
      {activeInvoiceCategory === 'user_invoices' && (
        <div className="space-y-4">
          {/* User Invoice Filters - ProfileManagement style */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">Advanced User Invoice Search & Filters</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAdvancedUserFilters(!showAdvancedUserFilters)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    showAdvancedUserFilters
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid="toggle-advanced-user-filters"
                >
                  {showAdvancedUserFilters ? 'Simple Search' : 'Advanced Search'}
                </button>
                <button
                  onClick={clearUserInvoiceFilters}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  data-testid="clear-user-filters"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Basic Search - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Global Search</label>
                <input
                  type="text"
                  placeholder="Search by invoice, account, charges..."
                  value={userInvoiceFilters.searchTerm}
                  onChange={(e) => setUserInvoiceFilters({...userInvoiceFilters, searchTerm: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="user-global-search"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Paid Status</label>
                <select
                  value={userInvoiceFilters.paidStatus}
                  onChange={(e) => setUserInvoiceFilters({...userInvoiceFilters, paidStatus: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Month</label>
                <input
                  type="text"
                  placeholder="Filter by month..."
                  value={userInvoiceFilters.month}
                  onChange={(e) => setUserInvoiceFilters({...userInvoiceFilters, month: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={applyUserInvoiceFilters}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-sm"
                  data-testid="apply-user-filters-btn"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearUserInvoiceFilters}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg font-medium text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedUserFilters && (
              <div className="border-t border-slate-200 pt-3">
                <h5 className="text-sm font-semibold text-slate-700 mb-3">Advanced Filters</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Account Name</label>
                    <input
                      type="text"
                      placeholder="Filter by account name"
                      value={userInvoiceFilters.accountName}
                      onChange={(e) => setUserInvoiceFilters({...userInvoiceFilters, accountName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Invoice ID</label>
                    <input
                      type="text"
                      placeholder="Filter by invoice ID"
                      value={userInvoiceFilters.invoiceId}
                      onChange={(e) => setUserInvoiceFilters({...userInvoiceFilters, invoiceId: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Results Summary */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {getFilteredUserInvoices().length} user invoices
                {(appliedUserInvoiceFilters.searchTerm || appliedUserInvoiceFilters.accountName || appliedUserInvoiceFilters.month || appliedUserInvoiceFilters.invoiceId || appliedUserInvoiceFilters.paidStatus !== 'all') ? ' (filtered)' : ''}
              </div>
              {(JSON.stringify(userInvoiceFilters) !== JSON.stringify(appliedUserInvoiceFilters)) && (
                <span className="text-sm text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-lg font-medium border border-amber-300 shadow-sm">
                  Filters changed - Click Apply
                </span>
              )}
            </div>
          </div>

          {/* User Invoices Table */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-800">User Invoices ({getFilteredUserInvoices().length})</h3>
                  <p className="text-blue-600 mt-1 text-sm">All user invoices with account details and payment status</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {getFilteredUserInvoices().map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-blue-50/30 transition-colors" data-testid={`user-invoice-${invoice.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Account Name</div>
                            <div className="text-slate-900 font-medium">{invoice.account_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Month</div>
                            <div className="text-slate-900 font-medium">{invoice.month}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Charges</div>
                            <div className="text-slate-900 font-medium">${invoice.total_amount.toFixed(2)}</div>
                            <div className="text-xs text-slate-500">{invoice.charges}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Due Date</div>
                            <div className="text-slate-900 font-medium">{new Date(invoice.due_date).toLocaleDateString()}</div>
                            <div className={`text-xs font-medium ${
                              new Date(invoice.due_date) < new Date() && !invoice.paid_status 
                                ? 'text-red-500' : 'text-slate-500'
                            }`}>
                              {new Date(invoice.due_date) < new Date() && !invoice.paid_status 
                                ? 'Overdue' : 'On time'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.paid_status 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {invoice.paid_status ? 'Paid' : 'Unpaid'}
                      </div>
                      
                      <button 
                        onClick={() => handleViewInvoiceDetails(invoice)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors" 
                        data-testid={`view-user-invoice-${invoice.id}`}
                        title="View Invoice Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* View Payment button removed as requested */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for User Invoices */}
            {getFilteredUserInvoices().length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No User Invoices Found</h3>
                <p className="text-slate-500">No invoices match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Invoice Details Modal */}
      {showInvoiceDetailsModal && selectedInvoiceDetails && (
        <EnhancedInvoiceDetails 
          invoice={selectedInvoiceDetails}
          onClose={() => setShowInvoiceDetailsModal(false)}
          showPaymentAction={selectedInvoiceDetails.category === 'self' || user.role === 'user'}
          onPayNow={(paymentData) => {
            // Handle payment navigation or processing
            console.log('Payment requested for:', paymentData);
            setShowInvoiceDetailsModal(false);
            // You can add navigation to payment page or open payment modal here
            alert(`Payment requested for ${paymentData.invoice_number} - Amount: $${paymentData.amount}`);
          }}
        />
      )}

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Payment Details</h3>
                  <p className="text-green-100 text-sm">Complete payment information</p>
                </div>
                <button
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                  data-testid="close-payment-details-modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Payment Header */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-800">Payment Successful</h4>
                      <p className="text-green-600 text-sm">For {selectedPaymentDetails.invoice.invoice_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">${selectedPaymentDetails.amount_paid.toFixed(2)}</div>
                    <div className="text-green-600 text-sm">Amount Paid</div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h6 className="text-sm font-bold text-slate-700 mb-3">Payment Information</h6>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment ID:</span>
                      <span className="text-slate-800 font-medium font-mono">{selectedPaymentDetails.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transaction ID:</span>
                      <span className="text-slate-800 font-medium font-mono">{selectedPaymentDetails.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Date:</span>
                      <span className="text-slate-800 font-medium">{new Date(selectedPaymentDetails.payment_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Status:</span>
                      <span className="text-green-600 font-medium capitalize">{selectedPaymentDetails.payment_status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h6 className="text-sm font-bold text-slate-700 mb-3">Payment Method</h6>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Method:</span>
                      <span className="text-slate-800 font-medium">{selectedPaymentDetails.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Card:</span>
                      <span className="text-slate-800 font-medium font-mono">{selectedPaymentDetails.card_last_four}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Gateway:</span>
                      <span className="text-slate-800 font-medium">{selectedPaymentDetails.payment_gateway}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reference:</span>
                      <span className="text-slate-800 font-medium font-mono">{selectedPaymentDetails.reference_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Reference */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h6 className="text-sm font-bold text-slate-700 mb-2">Invoice Reference</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Invoice:</span>
                    <div className="text-slate-800 font-medium">{selectedPaymentDetails.invoice.invoice_number}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Account:</span>
                    <div className="text-slate-800 font-medium">{selectedPaymentDetails.invoice.account_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Month:</span>
                    <div className="text-slate-800 font-medium">{selectedPaymentDetails.invoice.month}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Amount:</span>
                    <div className="text-slate-800 font-medium">${selectedPaymentDetails.invoice.total_amount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium">
                    Download Receipt
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium">
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;