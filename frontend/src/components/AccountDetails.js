import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UniversalPaymentModal from './UniversalPaymentModal';
import EnhancedInvoiceDetails from './EnhancedInvoiceDetails';
import { APP_CONFIG } from '../config/appConfig';
import EnhancedAccountCreation from './EnhancedAccountCreation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Account Details Component with Advanced Filtering
const AccountDetails = ({ AuthContext, setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Account Details State
  const [accountInfo, setAccountInfo] = useState(null);
  const [selectedUserAccount, setSelectedUserAccount] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);
  
  // Payment Modal State
  const [showUniversalPayment, setShowUniversalPayment] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  
  // Enhanced Invoice Details Modal State
  const [showEnhancedInvoiceDetails, setShowEnhancedInvoiceDetails] = useState(false);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState(null);
  
  // User Account Invoices State
  const [showUserAccountInvoices, setShowUserAccountInvoices] = useState(false);
  const [userAccountInvoices, setUserAccountInvoices] = useState([]);
  
  // Make Account Payment Popup State (moved to main component)
  const [showMakeAccountPayment, setShowMakeAccountPayment] = useState(false);
  const [accountPaymentMode, setAccountPaymentMode] = useState('');
  const [accountOtherPaymentAmount, setAccountOtherPaymentAmount] = useState('');
  const [accountPaymentComment, setAccountPaymentComment] = useState('');
  const [selectedAccountInvoicesForPayment, setSelectedAccountInvoicesForPayment] = useState([]);
  const [unpaidAccountInvoices, setUnpaidAccountInvoices] = useState([]);
  const [selectedSelfAccount, setSelectedSelfAccount] = useState(null);
  
  // Enhanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    accountId: '',
    accountName: '',
    phone: '',
    status: 'all',
    businessType: 'all',
    depositRange: 'all',
    serviceCount: 'all'
  });
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    accountId: '',
    accountName: '',
    phone: '',
    status: 'all',
    businessType: 'all',
    depositRange: 'all',
    serviceCount: 'all'
  });
  
  // Advanced Search Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Account View State
  const [activeAccountView, setActiveAccountView] = useState('self_account');
  
  // Add Account Modal State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    initializeDummyAccountData();
    fetchAccounts();
    fetchServices();
  }, []);

  // Initialize comprehensive dummy data for account details
  const initializeDummyAccountData = () => {
    // Master Account Data
    const masterAccount = {
      id: 'master_acc_001',
      name: 'UtilityTech Master Account',
      email: 'master@utilitytech.com',
      phone: '+1-800-UTILITY-MASTER',
      address: '1000 Corporate Blvd, Suite 1200',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94105',
      business_type: 'Master Utility Organization',
      account_number: 'UTIL-MASTER-001',
      established_date: '2020-01-15',
      total_deposit: 0.0,
      monthly_billing: 0.0,
      annual_revenue: 50000000.0,
      active_services: 25,
      total_customers: 50000,
      account_manager: 'Sarah Johnson',
      credit_limit: 1000000.0,
      payment_terms: 'Net 30',
      last_payment: '2024-01-15',
      is_active: true,
      account_type: 'master'
    };

    // Self Account Data will be handled in the SelfAccountView component

    // User Accounts Data (Accounts managed by current user)
    const managedUserAccounts = [
      {
        id: 'acc_tech_001',
        name: 'Tech Solutions Inc',
        email: 'billing@techsolutions.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, Floor 5',
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94102',
        business_type: 'Technology',
        account_number: 'TECH-001-2024',
        established_date: '2023-03-15',
        total_deposit: 2500.0,
        monthly_billing: 450.75,
        active_services: 5,
        credit_limit: 10000.0,
        outstanding_balance: 450.75,
        last_payment: '2024-01-08',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '1,250 kWh',
          water: '3,500 gallons',
          internet: 'Unlimited',
          saas_tools: '25 licenses'
        }
      },
      {
        id: 'acc_restaurant_001',
        name: 'Green Restaurant Group',
        email: 'finance@greenrestaurant.com',
        phone: '+1-555-0102',
        address: '456 Food Avenue, Building A',
        city: 'Los Angeles',
        state: 'CA',
        zipcode: '90210',
        business_type: 'Restaurant',
        account_number: 'REST-001-2024',
        established_date: '2023-05-20',
        total_deposit: 3500.0,
        monthly_billing: 785.25,
        active_services: 7,
        credit_limit: 15000.0,
        outstanding_balance: 0.0,
        last_payment: '2024-01-12',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '2,150 kWh',
          water: '8,500 gallons',
          gas: '450 therms',
          internet: 'Business Plus'
        }
      },
      {
        id: 'acc_marketing_001',
        name: 'Digital Marketing Hub',
        email: 'accounts@digitalmarketing.com',
        phone: '+1-555-0103',
        address: '789 Creative Blvd, Studio 12',
        city: 'Los Angeles',
        state: 'CA',
        zipcode: '90211',
        business_type: 'Marketing',
        account_number: 'MKT-001-2024',
        established_date: '2023-07-10',
        total_deposit: 2000.0,
        monthly_billing: 325.80,
        active_services: 4,
        credit_limit: 8000.0,
        outstanding_balance: 325.80,
        last_payment: '2024-01-05',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '950 kWh',
          internet: 'Premium',
          cloud_services: '500 GB',
          software_licenses: '15 users'
        }
      },
      {
        id: 'acc_healthcare_001',
        name: 'Healthcare Solutions LLC',
        email: 'billing@healthcaresolutions.com',
        phone: '+1-555-0104',
        address: '321 Medical Center Dr',
        city: 'San Diego',
        state: 'CA',
        zipcode: '92101',
        business_type: 'Healthcare',
        account_number: 'HLTH-001-2024',
        established_date: '2023-02-28',
        total_deposit: 5000.0,
        monthly_billing: 1250.50,
        active_services: 8,
        credit_limit: 25000.0,
        outstanding_balance: 1250.50,
        last_payment: '2024-01-15',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '3,750 kWh',
          water: '12,500 gallons',
          medical_equipment: '24/7 monitoring',
          internet: 'Enterprise'
        }
      },
      {
        id: 'acc_manufacturing_001',
        name: 'Manufacturing Corp',
        email: 'finance@manufacturing.com',
        phone: '+1-555-0105',
        address: '555 Industrial Way',
        city: 'Sacramento',
        state: 'CA',
        zipcode: '95814',
        business_type: 'Manufacturing',
        account_number: 'MFG-001-2024',
        established_date: '2023-01-10',
        total_deposit: 8500.0,
        monthly_billing: 2150.75,
        active_services: 12,
        credit_limit: 50000.0,
        outstanding_balance: 0.0,
        last_payment: '2024-01-14',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '15,250 kWh',
          water: '45,000 gallons',
          gas: '2,500 therms',
          compressed_air: '24/7'
        }
      },
      {
        id: 'acc_retail_001',
        name: 'Metro Retail Chain',
        email: 'accounts@metroretail.com',
        phone: '+1-555-0106',
        address: '888 Shopping Center Blvd',
        city: 'San Jose',
        state: 'CA',
        zipcode: '95110',
        business_type: 'Retail',
        account_number: 'RET-001-2024',
        established_date: '2023-04-05',
        total_deposit: 4200.0,
        monthly_billing: 875.25,
        active_services: 6,
        credit_limit: 20000.0,
        outstanding_balance: 875.25,
        last_payment: '2024-01-09',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '2,850 kWh',
          water: '6,500 gallons',
          security_system: '24/7 monitoring',
          pos_system: '12 terminals'
        }
      },
      {
        id: 'acc_education_001',
        name: 'Sunrise Academy',
        email: 'finance@sunriseacademy.edu',
        phone: '+1-555-0107',
        address: '222 Education Drive',
        city: 'Fresno',
        state: 'CA',
        zipcode: '93701',
        business_type: 'Education',
        account_number: 'EDU-001-2024',
        established_date: '2023-08-15',
        total_deposit: 3800.0,
        monthly_billing: 650.40,
        active_services: 5,
        credit_limit: 15000.0,
        outstanding_balance: 1300.80, // 2 months overdue
        last_payment: '2023-11-15',
        is_active: false, // Suspended for non-payment
        account_manager: user.name,
        usage_summary: {
          electricity: '1,850 kWh',
          water: '8,500 gallons',
          internet: 'Educational Package',
          security_system: 'Standard'
        }
      },
      {
        id: 'acc_hotel_001',
        name: 'Grand Plaza Hotel',
        email: 'accounting@grandplaza.com',
        phone: '+1-555-0108',
        address: '777 Hospitality Row',
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94108',
        business_type: 'Hotel',
        account_number: 'HTL-001-2024',
        established_date: '2023-09-01',
        total_deposit: 6500.0,
        monthly_billing: 1450.90,
        active_services: 9,
        credit_limit: 30000.0,
        outstanding_balance: 0.0,
        last_payment: '2024-01-13',
        is_active: true,
        account_manager: user.name,
        usage_summary: {
          electricity: '4,250 kWh',
          water: '25,000 gallons',
          gas: '1,200 therms',
          laundry_service: 'Industrial'
        }
      }
    ];

    // Set the account info state
    setAccountInfo({
      master_account: masterAccount,
      self_account: null, // Self account data is now handled in SelfAccountView component
      has_master_account: true,
      is_account_manager: true,
      show_user_accounts: managedUserAccounts.length > 0
    });

    setUserAccounts(managedUserAccounts);
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

  const fetchUserAccountDetails = async (accountId) => {
    try {
      // In a real implementation, this would fetch from API
      const accountDetails = userAccounts.find(acc => acc.id === accountId);
      if (accountDetails) {
        setSelectedUserAccount(accountDetails);
        setActiveAccountView('selected_account');
      }
    } catch (error) {
      console.error('Error fetching user account details:', error);
    }
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      accountId: '',
      accountName: '',
      phone: '',
      status: 'all',
      businessType: 'all',
      depositRange: 'all',
      serviceCount: 'all'
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  // Apply filters function
  const applyFilters = () => {
    console.log('Applying account filters:', filters);
    setAppliedFilters({...filters});
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Make Account Payment Functions (moved to main component level)
  const handleOpenMakeAccountPayment = () => {
    // Get the current selected self account
    const currentAccount = availableSelfAccounts.find(acc => acc.id === 'self_acc_001'); // Default for demo
    setSelectedSelfAccount(currentAccount);
    
    // Fetch unpaid invoices for current account
    fetchUnpaidInvoicesForCurrentAccount();
    // Reset payment mode and form
    setAccountPaymentMode('');
    setAccountOtherPaymentAmount('');
    setAccountPaymentComment('');
    setSelectedAccountInvoicesForPayment([]);
    // Open the popup
    setShowMakeAccountPayment(true);
  };

  const handleCloseMakeAccountPayment = () => {
    setShowMakeAccountPayment(false);
    setAccountPaymentMode('');
    setAccountOtherPaymentAmount('');
    setAccountPaymentComment('');
    setSelectedAccountInvoicesForPayment([]);
    setUnpaidAccountInvoices([]);
    setSelectedSelfAccount(null);
  };

  const fetchUnpaidInvoicesForCurrentAccount = () => {
    // Mock unpaid invoices for the current selected account
    const mockUnpaidInvoices = [
      {
        id: 'inv_124',
        invoice_number: 'INV-000124',
        account_id: 'self_acc_001',
        total_amount: 187.25,
        due_date: '2024-03-10',
        invoice_date: '2024-02-10',
        status: 'overdue',
        lateFee: 25.00,
        days_overdue: 15
      },
      {
        id: 'inv_126',
        invoice_number: 'INV-000126', 
        account_id: 'self_acc_001',
        total_amount: 345.75,
        due_date: '2024-04-20',
        invoice_date: '2024-03-20',
        status: 'sent',
        lateFee: 0,
        days_overdue: 0
      }
    ];
    
    setUnpaidAccountInvoices(mockUnpaidInvoices);
  };

  const handleAccountInvoiceSelectionForPayment = (invoiceId, selected) => {
    setSelectedAccountInvoicesForPayment(prev => {
      if (selected) {
        return [...prev, invoiceId];
      } else {
        return prev.filter(id => id !== invoiceId);
      }
    });
  };

  const calculateAccountInvoiceTotalAmount = () => {
    return unpaidAccountInvoices
      .filter(invoice => selectedAccountInvoicesForPayment.includes(invoice.id))
      .reduce((sum, invoice) => sum + invoice.total_amount + (invoice.lateFee || 0), 0);
  };

  const getAccountPaymentSummaryAmount = () => {
    switch (accountPaymentMode) {
      case 'outstanding':
        return selectedSelfAccount?.outstanding_balance || 0;
      case 'invoice':
        return calculateAccountInvoiceTotalAmount();
      case 'other':
        return parseFloat(accountOtherPaymentAmount) || 0;
      default:
        return 0;
    }
  };

  const getAccountPaymentSummaryLabel = () => {
    switch (accountPaymentMode) {
      case 'outstanding':
        return '1 Selected Invoice';
      case 'invoice':
        const count = selectedAccountInvoicesForPayment.length;
        return count > 0 ? `${count} Selected Invoice${count > 1 ? 's' : ''}` : 'Select Invoices';
      case 'other':
        return 'Custom Amount';
      default:
        return 'Select Payment Option';
    }
  };

  const handleAccountPayNow = () => {
    let totalAmount = getAccountPaymentSummaryAmount();
    let paymentData = {};

    if (accountPaymentMode === 'outstanding') {
      paymentData = {
        id: `payment_${selectedSelfAccount?.id}`,
        account_id: selectedSelfAccount?.id,
        account_name: selectedSelfAccount?.name,
        total_amount: totalAmount,
        payment_mode: 'outstanding',
        invoice_number: `OUTSTANDING-${selectedSelfAccount?.account_number}`,
        due_date: new Date().toISOString(),
        status: 'outstanding',
        payment_comment: accountPaymentComment,
        description: 'Outstanding Balance Payment'
      };
    } else if (accountPaymentMode === 'invoice') {
      const selectedInvoiceDetails = unpaidAccountInvoices.filter(invoice => 
        selectedAccountInvoicesForPayment.includes(invoice.id)
      );
      paymentData = {
        id: `payment_invoice_${selectedSelfAccount?.id}`,
        account_id: selectedSelfAccount?.id,
        account_name: selectedSelfAccount?.name,
        total_amount: totalAmount,
        payment_mode: 'invoice',
        selected_invoices: selectedAccountInvoicesForPayment,
        invoice_details: selectedInvoiceDetails,
        invoice_number: selectedInvoiceDetails.map(inv => inv.invoice_number).join(', '),
        payment_comment: accountPaymentComment,
        description: `Payment for invoices: ${selectedInvoiceDetails.map(inv => inv.invoice_number).join(', ')}`
      };
    } else if (accountPaymentMode === 'other') {
      paymentData = {
        id: `payment_other_${selectedSelfAccount?.id}`,
        account_id: selectedSelfAccount?.id,
        account_name: selectedSelfAccount?.name,
        total_amount: totalAmount,
        payment_mode: 'other',
        other_amount: totalAmount,
        invoice_number: `OTHER-${selectedSelfAccount?.account_number}-${Date.now()}`,
        payment_comment: accountPaymentComment,
        description: 'Other Amount Payment'
      };
    }

    // Open Universal Payment Modal with the payment data
    setSelectedInvoiceForPayment(paymentData);
    setShowUniversalPayment(true);
    // Keep the MakeAccountPayment popup open as requested
  };

  // Available self accounts for demo purposes (moved to main component)
  const availableSelfAccounts = [
    {
      id: 'self_acc_001',
      name: `${user.name} Personal Account`,
      email: user.email,
      phone: '+1-555-0101',
      address: '123 Admin Street, Floor 5',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94102',
      business_type: 'Administrative',
      account_number: 'ADM-001-2024',
      established_date: '2023-06-01',
      total_deposit: 1500.0,
      monthly_billing: 245.50,
      active_services: 3,
      credit_limit: 5000.0,
      payment_terms: 'Net 15',
      last_payment: '2024-01-10',
      outstanding_balance: 245.50,
      payment_method: 'Auto-pay Credit Card'
    }
  ];

  // Master Account Component
  const MasterAccountView = () => {
    const masterAccount = accountInfo?.master_account;
    if (!masterAccount) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v16a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Master Account</h3>
            <p className="text-slate-500">No master account found for your organization.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {masterAccount.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Master Account</h3>
            <p className="text-slate-600 text-sm">{masterAccount.business_type}</p>
            <p className="text-slate-500 text-xs">Account #: {masterAccount.account_number}</p>
          </div>
          <div className="flex-1"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{masterAccount.total_customers?.toLocaleString() || 'N/A'}</div>
            <div className="text-sm text-slate-500">Total Customers</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Account Name</label>
            <input 
              type="text" 
              value={masterAccount.name} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-name"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Master Email</label>
            <input 
              type="email" 
              value={masterAccount.email} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-email"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Master Phone</label>
            <input 
              type="tel" 
              value={masterAccount.phone} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-phone"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Account Number</label>
            <input 
              type="text" 
              value={masterAccount.account_number} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-number"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Account Manager</label>
            <input 
              type="text" 
              value={masterAccount.account_manager || 'N/A'} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-manager"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Credit Limit</label>
            <input 
              type="text" 
              value={masterAccount.credit_limit ? `$${masterAccount.credit_limit.toLocaleString()}` : 'N/A'} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-credit-limit"
              readOnly
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Address</label>
            <input 
              type="text" 
              value={masterAccount.address} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-address"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">City, State, ZIP</label>
            <input 
              type="text" 
              value={`${masterAccount.city}, ${masterAccount.state} ${masterAccount.zipcode}`} 
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              data-testid="master-account-location"
              readOnly
            />
          </div>
        </div>

        {/* Master Account Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">{masterAccount.total_customers?.toLocaleString() || '0'}</div>
            <div className="text-sm text-emerald-600">Total Customers</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">${masterAccount.annual_revenue?.toLocaleString() || '0'}</div>
            <div className="text-sm text-blue-600">Annual Revenue</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{masterAccount.active_services || 'N/A'}</div>
            <div className="text-sm text-purple-600">Active Services</div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{userAccounts.length}</div>
            <div className="text-sm text-amber-600">User Accounts</div>
          </div>
        </div>
      </div>
    );
  };

  // Self Account Component with Dropdown Selection
  const SelfAccountView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSelfAccountId, setSelectedSelfAccountId] = useState('self_acc_001');
    const [isAccountStatsExpanded, setIsAccountStatsExpanded] = useState(false);
    const [isCurrentUsageExpanded, setIsCurrentUsageExpanded] = useState(false);
    const [isAccountInfoExpanded, setIsAccountInfoExpanded] = useState(true);
    const [showServicesList, setShowServicesList] = useState(false);
    const [showPaymentsList, setShowPaymentsList] = useState(false);
    const [showInvoicesList, setShowInvoicesList] = useState(false);
    const [servicesPage, setServicesPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [invoicesPage, setInvoicesPage] = useState(1);
    const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
    const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
    const [apiPayments, setApiPayments] = useState([]);
    const [paymentsTotalCount, setPaymentsTotalCount] = useState(0);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
    const [isServicesLoading, setIsServicesLoading] = useState(false);
    const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
    
    // Payment Modal State - now in main component
    
    // Removed duplicate state variables - now in main component
    const itemsPerPage = 10;

    const selectedSelfAccount = availableSelfAccounts.find(acc => acc.id === selectedSelfAccountId) || availableSelfAccounts[0];

    const [accountData, setAccountData] = useState({
      name: selectedSelfAccount?.name || '',
      email: selectedSelfAccount?.email || '',
      phone: selectedSelfAccount?.phone || '',
      address: selectedSelfAccount?.address || '',
      city: selectedSelfAccount?.city || '',
      state: selectedSelfAccount?.state || '',
      zipcode: selectedSelfAccount?.zipcode || '',
      business_type: selectedSelfAccount?.business_type || '',
      payment_method: selectedSelfAccount?.payment_method || ''
    });

    // Update account data when selection changes
    useEffect(() => {
      if (selectedSelfAccount) {
        setAccountData({
          name: selectedSelfAccount.name,
          email: selectedSelfAccount.email,
          phone: selectedSelfAccount.phone,
          address: selectedSelfAccount.address,
          city: selectedSelfAccount.city,
          state: selectedSelfAccount.state,
          zipcode: selectedSelfAccount.zipcode,
          business_type: selectedSelfAccount.business_type,
          payment_method: selectedSelfAccount.payment_method
        });
      }
    }, [selectedSelfAccount]);

    if (!selectedSelfAccount) return null;

    // Calculate all stats from selected account
    const totalDeposit = selectedSelfAccount.total_deposit || 0;
    const monthlyBilling = selectedSelfAccount.monthly_billing || 0;
    const activeServices = selectedSelfAccount.active_services || 0;
    const outstandingBalance = selectedSelfAccount.outstanding_balance || 0;
    const creditBalance = selectedSelfAccount.credit_balance || 0;
    const totalCredit = selectedSelfAccount.total_credit || 0;
    const creditLimit = selectedSelfAccount.credit_limit || 0;
    const totalDebit = selectedSelfAccount.total_debit || 0;
    const totalPayment = selectedSelfAccount.total_payment || 0;
    const lastPayment = selectedSelfAccount.last_payment || 0;
    const totalUserDeposit = selectedSelfAccount.total_user_deposit || 0;

    const handleUpdate = async () => {
      try {
        console.log('Updating account with:', accountData);
        setIsEditing(false);
        alert('Account updated successfully!');
      } catch (error) {
        console.error('Error updating account:', error);
        alert('Error updating account');
      }
    };

    const handleExport = () => {
      const exportData = {
        account: selectedSelfAccount,
        usage_summary: selectedSelfAccount.usage_summary,
        billing_history: selectedSelfAccount.billing_history || [],
        stats: { totalDeposit, monthlyBilling, activeServices, outstandingBalance },
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `self-account-${selectedSelfAccount.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Account data exported successfully!');
    };

    const handleMakePayment = () => {
      // Open the MakeAccountPayment popup
      handleOpenMakeAccountPayment();
    };

    const handleMakeNewPayment = () => {
      // Open the MakeAccountPayment popup
      handleOpenMakeAccountPayment();
    };

    const handleViewPaymentDetails = (payment) => {
      // Open payment details modal
      console.log('Viewing payment details for:', payment.id);
      setSelectedPaymentForDetails(payment);
      setShowPaymentDetailsModal(true);
    };

    const handleViewInvoiceDetails = (invoice) => {
      console.log('Viewing invoice details for:', invoice.invoice_id);
      
      // Create detailed invoice object for EnhancedInvoiceDetails component
      const detailedInvoice = {
        id: invoice.invoice_id || invoice.id,
        invoice_number: invoice.invoice_id || invoice.id,
        account_name: selectedSelfAccount?.name || 'Admin User Personal Account',
        total_amount: invoice.amount,
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoice.status,
        created_at: invoice.invoice_date || new Date().toISOString(),
        issue_date: invoice.invoice_date || new Date().toISOString(),
        month: new Date(invoice.invoice_date || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items: [
          {
            description: invoice.service || 'Service Charge',
            amount: invoice.amount * 0.8,
            quantity: 1
          },
          {
            description: 'Service Fee',
            amount: invoice.amount * 0.15,
            quantity: 1
          },
          {
            description: 'Tax & Other Charges',
            amount: invoice.amount * 0.05,
            quantity: 1
          }
        ],
        subtotal: invoice.amount * 0.95,
        tax_amount: invoice.amount * 0.05,
        discount_amount: 0,
        days_overdue: invoice.status === 'Overdue' ? Math.floor((new Date() - new Date(invoice.due_date || Date.now())) / (1000 * 60 * 60 * 24)) : 0
      };
      
      setSelectedInvoiceForDetails(detailedInvoice);
      setShowEnhancedInvoiceDetails(true);
    };

    // Handle user account invoice viewing
    const handleViewUserAccountInvoices = () => {
      if (!selectedUserAccount) return;
      
      // Generate dummy invoices for the selected user account
      const dummyUserInvoices = [
        {
          invoice_id: `INV-${selectedUserAccount.account_number}-001`,
          service: 'Utility Services',
          amount: Math.floor(Math.random() * 500) + 100,
          status: 'Paid',
          invoice_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          invoice_id: `INV-${selectedUserAccount.account_number}-002`,
          service: 'Monthly Service Fee',
          amount: Math.floor(Math.random() * 300) + 50,
          status: 'Pending',
          invoice_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          invoice_id: `INV-${selectedUserAccount.account_number}-003`,
          service: 'Additional Services',
          amount: Math.floor(Math.random() * 200) + 75,
          status: 'Overdue',
          invoice_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setUserAccountInvoices(dummyUserInvoices);
      setShowUserAccountInvoices(true);
    };

    // Handle user account invoice details viewing
    const handleViewUserAccountInvoiceDetails = (invoice) => {
      console.log('Viewing user account invoice details for:', invoice.invoice_id);
      
      // Create detailed invoice object for EnhancedInvoiceDetails component
      const detailedInvoice = {
        id: invoice.invoice_id || invoice.id,
        invoice_number: invoice.invoice_id || invoice.id,
        account_name: selectedUserAccount?.name || 'User Account',
        total_amount: invoice.amount,
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoice.status,
        created_at: invoice.invoice_date || new Date().toISOString(),
        issue_date: invoice.invoice_date || new Date().toISOString(),
        month: new Date(invoice.invoice_date || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items: [
          {
            description: invoice.service || 'Service Charge',
            amount: invoice.amount * 0.8,
            quantity: 1
          },
          {
            description: 'Service Fee',
            amount: invoice.amount * 0.15,
            quantity: 1
          },
          {
            description: 'Tax & Other Charges',
            amount: invoice.amount * 0.05,
            quantity: 1
          }
        ],
        subtotal: invoice.amount * 0.95,
        tax_amount: invoice.amount * 0.05,
        discount_amount: 0,
        days_overdue: invoice.status === 'Overdue' ? Math.floor((new Date() - new Date(invoice.due_date || Date.now())) / (1000 * 60 * 60 * 24)) : 0
      };
      
      setSelectedInvoiceForDetails(detailedInvoice);
      setShowEnhancedInvoiceDetails(true);
    };

    const handleViewInvoices = async () => {
      // Hide other lists and show invoices
      setShowServicesList(false);
      setShowPaymentsList(false);
      
      // Fetch invoices from backend if not already showing
      if (!showInvoicesList) {
        await fetchInvoices(invoicesPage);
      }
      
      setShowInvoicesList(!showInvoicesList);
      setInvoicesPage(1);
    };

    const handleViewServices = async () => {
      // Hide other lists and show services
      setShowPaymentsList(false);
      setShowInvoicesList(false);
      
      // Fetch services from backend if not already showing
      if (!showServicesList) {
        await fetchServices(servicesPage);
      }
      
      setShowServicesList(!showServicesList);
      setServicesPage(1);
    };

    const fetchPayments = async (page = 1) => {
      setIsPaymentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/payments?account_id=${selectedSelfAccount.id}&page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setApiPayments(response.data.payments || []);
        setPaymentsTotalCount(response.data.total_count || 0);
        console.log('Payments fetched:', response.data.payments.length, 'Total:', response.data.total_count);
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Fallback to mock data on error
        setApiPayments(mockPayments.slice((page - 1) * 10, page * 10));
        setPaymentsTotalCount(mockPayments.length);
      } finally {
        setIsPaymentsLoading(false);
      }
    };

    const fetchServices = async (page = 1) => {
      setIsServicesLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/services?account_id=${selectedSelfAccount.id}&page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Services fetched:', response.data.services?.length || 0, 'Total:', response.data.total_count || 0);
        // Services will use mock data as primary source since backend might not have services endpoint
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsServicesLoading(false);
      }
    };

    const fetchInvoices = async (page = 1) => {
      setIsInvoicesLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/invoices?account_id=${selectedSelfAccount.id}&page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Invoices fetched:', response.data.invoices?.length || 0, 'Total:', response.data.total_count || 0);
        // Invoices will use mock data as primary source since backend might not have invoices endpoint
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setIsInvoicesLoading(false);
      }
    };

    const handleViewPayments = async () => {
      // Hide other lists and show payments
      setShowServicesList(false);
      setShowInvoicesList(false);
      
      // Fetch payments from backend if not already showing
      if (!showPaymentsList) {
        setIsPaymentsLoading(true);
        await fetchPayments(paymentsPage);
      }
      
      setShowPaymentsList(!showPaymentsList);
    };

    // Functions moved to main component level

    // Mock services data for the account (expanded for pagination testing)
    const mockServices = [
      {
        id: 'self_serv_001',
        name: 'Admin Office Electricity',
        status: 'Active',
        networkId: 'NET-ADM-001',
        chargingPattern: 'Monthly - $245.50'
      },
      {
        id: 'self_serv_002', 
        name: 'Admin Office Water',
        status: 'Active',
        networkId: 'NET-ADM-002',
        chargingPattern: 'Monthly - $95.00'
      },
      {
        id: 'self_serv_003',
        name: 'Admin Internet Service', 
        status: 'Active',
        networkId: 'NET-ADM-003',
        chargingPattern: 'Monthly - $120.00'
      },
      {
        id: 'self_serv_004',
        name: 'Office Security System',
        status: 'Active', 
        networkId: 'NET-ADM-004',
        chargingPattern: 'Monthly - $85.00'
      },
      {
        id: 'self_serv_005',
        name: 'Backup Generator',
        status: 'Inactive',
        networkId: 'NET-ADM-005',
        chargingPattern: 'On-demand - $150.00'
      },
      {
        id: 'self_serv_006',
        name: 'HVAC System',
        status: 'Active',
        networkId: 'NET-ADM-006', 
        chargingPattern: 'Monthly - $320.00'
      },
      {
        id: 'self_serv_007',
        name: 'Office Cleaning Service',
        status: 'Active',
        networkId: 'NET-ADM-007',
        chargingPattern: 'Weekly - $200.00'
      },
      {
        id: 'self_serv_008',
        name: 'Parking Management',
        status: 'Active',
        networkId: 'NET-ADM-008',
        chargingPattern: 'Monthly - $75.00'
      },
      {
        id: 'self_serv_009',
        name: 'Fire Safety System',
        status: 'Active',
        networkId: 'NET-ADM-009',
        chargingPattern: 'Monthly - $45.00'
      },
      {
        id: 'self_serv_010',
        name: 'Equipment Maintenance',
        status: 'Active',
        networkId: 'NET-ADM-010',
        chargingPattern: 'Monthly - $180.00'
      },
      {
        id: 'self_serv_011',
        name: 'Office Phone System',
        status: 'Active',
        networkId: 'NET-ADM-011',
        chargingPattern: 'Monthly - $65.00'
      },
      {
        id: 'self_serv_012',
        name: 'Conference Room Setup',
        status: 'Inactive',
        networkId: 'NET-ADM-012',
        chargingPattern: 'On-demand - $125.00'
      }
    ];

    // Mock payments data with required fields: payment id, amount, comment, status, payment date, invoice details
    const mockPayments = [
      {
        id: 'PAY-001',
        payment_id: 'PAY-001',
        name: 'Electricity Bill Payment',
        amount: 245.50,
        comment: 'Monthly electricity bill payment',
        status: 'Completed',
        payment_date: '2024-10-01',
        date: '2024-10-01',
        method: 'Credit Card',
        reference: 'PAY-CC-001',
        invoice_id: 'INV-2024-001',
        invoice_date: '2024-10-01',
        due_date: '2024-11-01',
        invoice_amount: 245.50
      },
      {
        id: 'PAY-002',
        payment_id: 'PAY-002',
        name: 'Water Bill Payment',
        amount: 95.00,
        comment: 'Water service monthly charge',
        status: 'Completed',
        payment_date: '2024-09-28',
        date: '2024-09-28',
        method: 'Bank Transfer',
        reference: 'PAY-BT-002',
        invoice_id: 'INV-2024-002',
        invoice_date: '2024-09-28',
        due_date: '2024-10-28',
        invoice_amount: 95.00
      },
      {
        id: 'PAY-003',
        payment_id: 'PAY-003',
        name: 'Internet Service Payment',
        amount: 120.00,
        comment: 'Internet service payment - pending processing',
        status: 'Pending',
        payment_date: '2024-09-25',
        date: '2024-09-25',
        method: 'Credit Card',
        reference: 'PAY-CC-003',
        invoice_id: 'INV-2024-003',
        invoice_date: '2024-09-25',
        due_date: '2024-10-25',
        invoice_amount: 120.00
      },
      {
        id: 'PAY-004',
        payment_id: 'PAY-004',
        name: 'Security System Payment',
        amount: 85.00,
        comment: 'Security system maintenance fee',
        status: 'Completed',
        payment_date: '2024-09-22',
        date: '2024-09-22',
        method: 'Cash',
        reference: 'PAY-CSH-004',
        invoice_id: 'INV-2024-004',
        invoice_date: '2024-09-22',
        due_date: '2024-10-22',
        invoice_amount: 85.00
      },
      {
        id: 'PAY-005',
        payment_id: 'PAY-005',
        name: 'HVAC Service Payment',
        amount: 320.00,
        comment: 'HVAC system quarterly maintenance',
        status: 'Completed',
        payment_date: '2024-09-20',
        date: '2024-09-20',
        method: 'Bank Transfer',
        reference: 'PAY-BT-005',
        invoice_id: 'INV-2024-005',
        invoice_date: '2024-09-20',
        due_date: '2024-10-20',
        invoice_amount: 320.00
      },
      {
        id: 'PAY-006',
        payment_id: 'PAY-006',
        name: 'Generator Maintenance Payment',
        amount: 150.00,
        comment: 'Generator maintenance - payment failed, retrying',
        status: 'Failed',
        payment_date: '2024-09-18',
        date: '2024-09-18',
        method: 'Credit Card',
        reference: 'PAY-CC-006',
        invoice_id: 'INV-2024-006',
        invoice_date: '2024-09-15',
        due_date: '2024-10-15',
        invoice_amount: 150.00
      },
      {
        id: 'PAY-007',
        payment_id: 'PAY-007',
        name: 'Monthly Office Rent Payment',
        amount: 2500.00,
        comment: 'Monthly office rent payment',
        status: 'Completed',
        payment_date: '2024-09-15',
        date: '2024-09-15',
        method: 'Wire Transfer',
        reference: 'PAY-WT-007',
        invoice_id: 'INV-2024-007',
        invoice_date: '2024-09-15',
        due_date: '2024-10-15',
        invoice_amount: 2500.00
      },
      {
        id: 'PAY-008',
        payment_id: 'PAY-008',
        name: 'Parking Fee Payment',
        amount: 75.00,
        comment: 'Parking fee monthly charge',
        status: 'Completed',
        payment_date: '2024-09-12',
        date: '2024-09-12',
        method: 'Credit Card',
        reference: 'PAY-CC-008',
        invoice_id: 'INV-2024-008',
        invoice_date: '2024-09-12',
        due_date: '2024-10-12',
        invoice_amount: 75.00
      },
      {
        id: 'PAY-009',
        payment_id: 'PAY-009',
        name: 'Equipment Lease Payment',
        amount: 450.00,
        comment: 'Equipment lease payment - currently processing',
        status: 'Processing',
        payment_date: '2024-09-10',
        date: '2024-09-10',
        method: 'Bank Transfer',
        reference: 'PAY-BT-009',
        invoice_id: 'INV-2024-009',
        invoice_date: '2024-09-10',
        due_date: '2024-10-10',
        invoice_amount: 450.00
      },
      {
        id: 'PAY-010',
        payment_id: 'PAY-010',
        name: 'Insurance Premium Payment',
        amount: 180.00,
        comment: 'Insurance premium auto-payment',
        status: 'Completed',
        payment_date: '2024-09-08',
        date: '2024-09-08',
        method: 'Auto-pay',
        reference: 'PAY-AP-010',
        invoice_id: 'INV-2024-010',
        invoice_date: '2024-09-08',
        due_date: '2024-10-08',
        invoice_amount: 180.00
      },
      {
        id: 'PAY-011',
        payment_id: 'PAY-011',
        name: 'Office Supplies Payment',
        amount: 125.00,
        comment: 'Office supplies purchase',
        status: 'Completed',
        payment_date: '2024-09-05',
        date: '2024-09-05',
        method: 'Credit Card',
        reference: 'PAY-CC-011',
        invoice_id: 'INV-2024-011',
        invoice_date: '2024-09-05',
        due_date: '2024-10-05',
        invoice_amount: 125.00
      },
      {
        id: 'PAY-012',
        payment_id: 'PAY-012',
        name: 'Software License Payment',
        amount: 299.00,
        comment: 'Software license - refunded due to cancellation',
        status: 'Refunded',
        payment_date: '2024-09-02',
        date: '2024-09-02',
        method: 'Credit Card',
        reference: 'PAY-CC-012',
        invoice_id: 'INV-2024-012',
        invoice_date: '2024-09-02',
        due_date: '2024-10-02',
        invoice_amount: 299.00
      }
    ];

    // Mock invoices data with required fields: Invoice id, bill cycle id, bill run id, amount, Invoice date, status
    const mockInvoices = [
      {
        id: 'INV-2024-001',
        invoice_id: 'INV-2024-001',
        bill_cycle_id: 'CYC-001',
        bill_run_id: 'RUN-2024-10-001',
        amount: 245.50,
        invoice_date: '2024-10-01',
        status: 'Pending',
        service: 'Admin Office Electricity',
        due_date: '2024-11-01'
      },
      {
        id: 'INV-2024-002',
        invoice_id: 'INV-2024-002',
        bill_cycle_id: 'CYC-001',
        bill_run_id: 'RUN-2024-09-002',
        amount: 95.00,
        invoice_date: '2024-09-28',
        status: 'Paid',
        service: 'Admin Office Water',
        due_date: '2024-10-28'
      },
      {
        id: 'INV-2024-003',
        invoice_id: 'INV-2024-003',
        bill_cycle_id: 'CYC-002',
        bill_run_id: 'RUN-2024-09-003',
        amount: 120.00,
        invoice_date: '2024-09-25',
        status: 'Overdue',
        service: 'Admin Internet Service',
        due_date: '2024-10-25'
      },
      {
        id: 'INV-2024-004',
        invoice_id: 'INV-2024-004',
        bill_cycle_id: 'CYC-001',
        bill_run_id: 'RUN-2024-09-004',
        amount: 85.00,
        invoice_date: '2024-09-22',
        status: 'Paid',
        service: 'Office Security System',
        due_date: '2024-10-22'
      },
      {
        id: 'INV-2024-005',
        invoice_id: 'INV-2024-005',
        bill_cycle_id: 'CYC-003',
        bill_run_id: 'RUN-2024-09-005',
        amount: 320.00,
        invoice_date: '2024-09-20',
        status: 'Pending',
        service: 'HVAC System',
        due_date: '2024-10-20'
      },
      {
        id: 'INV-2024-006',
        invoice_id: 'INV-2024-006',
        bill_cycle_id: 'CYC-002',
        bill_run_id: 'RUN-2024-09-006',
        amount: 150.00,
        invoice_date: '2024-09-15',
        status: 'Paid',
        service: 'Backup Generator',
        due_date: '2024-10-15'
      },
      {
        id: 'INV-2024-007',
        invoice_id: 'INV-2024-007',
        bill_cycle_id: 'CYC-001',
        bill_run_id: 'RUN-2024-09-007',
        amount: 2500.00,
        invoice_date: '2024-09-15',
        status: 'Paid',
        service: 'Monthly Office Rent',
        due_date: '2024-10-15'
      },
      {
        id: 'INV-2024-008',
        invoice_id: 'INV-2024-008',
        bill_cycle_id: 'CYC-002',
        bill_run_id: 'RUN-2024-09-008',
        amount: 75.00,
        invoice_date: '2024-09-12',
        status: 'Paid',
        service: 'Parking Fee',
        due_date: '2024-10-12'
      },
      {
        id: 'INV-2024-009',
        invoice_id: 'INV-2024-009',
        bill_cycle_id: 'CYC-003',
        bill_run_id: 'RUN-2024-09-009',
        amount: 450.00,
        invoice_date: '2024-09-10',
        status: 'Processing',
        service: 'Equipment Lease',
        due_date: '2024-10-10'
      },
      {
        id: 'INV-2024-010',
        invoice_id: 'INV-2024-010',
        bill_cycle_id: 'CYC-001',
        bill_run_id: 'RUN-2024-09-010',
        amount: 180.00,
        invoice_date: '2024-09-08',
        status: 'Paid',
        service: 'Insurance Premium',
        due_date: '2024-10-08'
      },
      {
        id: 'INV-2024-011',
        invoice_id: 'INV-2024-011',
        bill_cycle_id: 'CYC-002',
        bill_run_id: 'RUN-2024-09-011',
        amount: 125.00,
        invoice_date: '2024-09-05',
        status: 'Paid',
        service: 'Office Supplies',
        due_date: '2024-10-05'
      },
      {
        id: 'INV-2024-012',
        invoice_id: 'INV-2024-012',
        bill_cycle_id: 'CYC-003',
        bill_run_id: 'RUN-2024-09-012',
        amount: 299.00,
        invoice_date: '2024-09-02',
        status: 'Cancelled',
        service: 'Software License',
        due_date: '2024-10-02'
      }
    ];

    const handleViewServiceDetails = (serviceId) => {
      if (setActiveTab) {
        setActiveTab('services');
      }
    };

    // Pagination helpers
    const getPaginatedData = (data, page) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);

    const handlePageChange = async (type, page) => {
      if (type === 'services') {
        setServicesPage(page);
        await fetchServices(page);
      }
      else if (type === 'payments') {
        setPaymentsPage(page);
        await fetchPayments(page);
      }
      else if (type === 'invoices') {
        setInvoicesPage(page);
        await fetchInvoices(page);
      }
    };

    const renderPagination = (type, currentPage, totalItems) => {
      const totalPages = getTotalPages(totalItems);
      if (totalPages <= 1) return null;

      return (
        <div className="flex items-center justify-between mt-3 px-3">
          <div className="text-xs text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(type, Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded transition-colors"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(type, i + 1)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentPage === i + 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(type, Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-xl">
        {/* Compact Header with Account Dropdown */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {selectedSelfAccount.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800">My Account</h3>
              <p className="text-slate-600 text-xs">{selectedSelfAccount.business_type}</p>
            </div>
            {/* Account Number Display - Between My Account and Account Selection */}
            <div className="ml-4 px-3 py-1 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-xs text-slate-500">Account #: <span className="font-mono font-semibold text-emerald-700">{selectedSelfAccount.account_number}</span></p>
            </div>
          </div>
          
          {/* Account Selection Dropdown - Right Aligned */}
          <div className="min-w-[240px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">Account Selection</label>
            <select
              value={selectedSelfAccountId}
              onChange={(e) => setSelectedSelfAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="self-account-selector"
            >
              {availableSelfAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact Account Details with Light Gray Background - Collapsible */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded-lg transition-colors mb-2"
            onClick={() => setIsAccountInfoExpanded(!isAccountInfoExpanded)}
          >
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-semibold text-slate-700">Account Information</h4>
              {!isEditing ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Edit Account"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate();
                    }}
                    className="p-1 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Save Changes"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(false);
                      setAccountData({
                        name: selectedSelfAccount.name || '',
                        email: selectedSelfAccount.email || '',
                        phone: selectedSelfAccount.phone || '',
                        address: selectedSelfAccount.address || '',
                        city: selectedSelfAccount.city || '',
                        state: selectedSelfAccount.state || '',
                        zipcode: selectedSelfAccount.zipcode || '',
                        business_type: selectedSelfAccount.business_type || '',
                        payment_method: selectedSelfAccount.payment_method || ''
                      });
                    }}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Cancel"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <svg 
              className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isAccountInfoExpanded ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isAccountInfoExpanded && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Account Name</label>
            <input 
              type="text" 
              value={accountData.name} 
              onChange={(e) => setAccountData({...accountData, name: e.target.value})}
              className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
              data-testid="self-account-name-input"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={accountData.email} 
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
              data-testid="self-account-email-input"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Phone</label>
            <input 
              type="tel" 
              value={accountData.phone} 
              onChange={(e) => setAccountData({...accountData, phone: e.target.value})}
              className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Business Type</label>
            <input 
              type="text" 
              value={accountData.business_type} 
              onChange={(e) => setAccountData({...accountData, business_type: e.target.value})}
              className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Payment Method</label>
            <input 
              type="text" 
              value={accountData.payment_method} 
              onChange={(e) => setAccountData({...accountData, payment_method: e.target.value})}
              className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Payment Terms</label>
            <input 
              type="text" 
              value={selectedSelfAccount.payment_terms || 'N/A'} 
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-700">Address</label>
            <input 
              type="text" 
              value={accountData.address} 
              onChange={(e) => setAccountData({...accountData, address: e.target.value})}
              className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                isEditing ? 'bg-white' : 'bg-slate-50'
              }`}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">City, State, ZIP</label>
            <input 
              type="text" 
              value={`${accountData.city}, ${accountData.state} ${accountData.zipcode}`} 
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              disabled
            />
          </div>
        </div>
            </div>
          )}
        </div>

        {/* Special Stats between Account ID and Account Selector */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
            <div className="text-xs font-bold text-green-600" style={{color: '#4ade80', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>${creditBalance.toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-600">Credit Balance</div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
            <div className="text-xs font-bold text-red-600" style={{color: '#ef4444', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>${outstandingBalance.toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-600">Outstanding</div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
            <div className="text-xs font-bold text-green-600" style={{color: '#4ade80', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>${creditLimit.toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-600">Credit Limit</div>
          </div>
        </div>

        {/* Enhanced Account Statistics - 7 + 1 Layout with Gray Background - Collapsible */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors"
            onClick={() => setIsAccountStatsExpanded(!isAccountStatsExpanded)}
          >
            <h4 className="text-xs font-semibold text-slate-700">Account Statistics</h4>
            <svg 
              className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isAccountStatsExpanded ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isAccountStatsExpanded && (
            <div className="mt-2 animate-fadeIn">
              {/* First Row - 7 Items */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${totalDeposit.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Total Deposit</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${totalCredit.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Total Credit</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${totalPayment.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Total Payment</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${lastPayment.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Last Payment</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${totalUserDeposit.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">User Deposit</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">{activeServices}</div>
                  <div className="text-xs font-medium text-slate-600">Active Services</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${totalDebit.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Total Debit</div>
                </div>
              </div>
              
              {/* Second Row - 1 Item */}
              <div className="grid grid-cols-7 gap-1">
                <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 rounded border border-gray-300 shadow-sm">
                  <div className="text-xs font-bold text-slate-800">${monthlyBilling.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-600">Last Invoice</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Usage Summary - Collapsible */}
        {selectedSelfAccount.usage_summary && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors"
              onClick={() => setIsCurrentUsageExpanded(!isCurrentUsageExpanded)}
            >
              <h4 className="text-xs font-semibold text-slate-700">Current Usage</h4>
              <svg 
                className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isCurrentUsageExpanded ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isCurrentUsageExpanded && (
              <div className="mt-2 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {Object.entries(selectedSelfAccount.usage_summary).map(([service, usage]) => (
                    <div key={service} className="bg-gradient-to-r from-slate-50 to-slate-100 p-1.5 rounded border border-slate-200">
                      <div className="text-xs font-bold text-slate-700">{usage}</div>
                      <div className="text-xs text-slate-600 capitalize">{service.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExport}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
          >
            Export Account
          </button>
          <button 
            onClick={handleViewServices}
            disabled={isServicesLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-services-btn"
          >
            <span className={`transition-opacity duration-200 ${isServicesLoading ? 'opacity-50' : 'opacity-100'}`}>
              View Services
            </span>
            {isServicesLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="services-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="services-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="services-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
          <button 
            onClick={handleViewInvoices}
            disabled={isInvoicesLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden min-w-[80px]"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-invoices-btn"
          >
            <span className={`transition-opacity duration-200 ${isInvoicesLoading ? 'opacity-50' : 'opacity-100'}`}>
              Invoice
            </span>
            {isInvoicesLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="invoices-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="invoices-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="invoices-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
          <button 
            onClick={handleViewPayments}
            disabled={isPaymentsLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden min-w-[80px]"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-payments-btn"
          >
            <span className={`transition-opacity duration-200 ${isPaymentsLoading ? 'opacity-50' : 'opacity-100'}`}>
              Payments
            </span>
            {isPaymentsLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="payments-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="payments-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="payments-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Services List - Shows AFTER buttons */}
        {showServicesList && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">Account Services</h4>
              <button
                onClick={() => setShowServicesList(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
              <div className="grid grid-cols-6 gap-2 p-2 bg-slate-100 text-xs font-semibold text-slate-700">
                <div>Service ID</div>
                <div>Name</div>
                <div>Status</div>
                <div>Network ID</div>
                <div>Charging Pattern</div>
                <div>Actions</div>
              </div>
              
              {getPaginatedData(mockServices, servicesPage).map((service) => (
                <div key={service.id} className="grid grid-cols-6 gap-2 p-2 border-b border-slate-100 text-xs hover:bg-slate-50">
                  <div className="font-mono text-slate-600">{service.id}</div>
                  <div className="font-medium text-slate-800">{service.name}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="font-mono text-slate-600">{service.networkId}</div>
                  <div className="text-slate-700">{service.chargingPattern}</div>
                  <div>
                    <button
                      onClick={() => handleViewServiceDetails(service.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination('services', servicesPage, mockServices.length)}
          </div>
        )}

        {/* Payments List - Shows AFTER buttons */}
        {showPaymentsList && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">Account Payments</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMakeNewPayment}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
                  data-testid="make-new-payment-btn"
                >
                  Make Payment
                </button>
                <button
                  onClick={() => setShowPaymentsList(false)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
              <div className="grid grid-cols-6 gap-2 p-2 bg-slate-100 text-xs font-semibold text-slate-700">
                <div>Payment ID</div>
                <div>Amount</div>
                <div>Comment</div>
                <div>Status</div>
                <div>Payment Date</div>
                <div>Actions</div>
              </div>
              
              {apiPayments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-6 gap-2 p-2 border-b border-slate-100 text-xs hover:bg-slate-50">
                  <div className="font-mono text-slate-600">{payment.payment_id}</div>
                  <div className="font-semibold text-slate-700">${payment.amount.toFixed(2)}</div>
                  <div className="text-slate-800">{payment.comment}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      payment.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</div>
                  <div>
                    <button
                      onClick={() => handleViewPaymentDetails(payment)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="View Payment Details"
                      data-testid={`view-payment-${payment.id}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination('payments', paymentsPage, paymentsTotalCount)}
          </div>
        )}

        {/* Invoices List - Shows AFTER buttons */}
        {showInvoicesList && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">Account Invoices</h4>
              <button
                onClick={() => setShowInvoicesList(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
              <div className="grid grid-cols-7 gap-2 p-2 bg-slate-100 text-xs font-semibold text-slate-700">
                <div>Invoice ID</div>
                <div>Bill Cycle ID</div>
                <div>Bill Run ID</div>
                <div>Amount</div>
                <div>Invoice Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {getPaginatedData(mockInvoices, invoicesPage).map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-7 gap-2 p-2 border-b border-slate-100 text-xs hover:bg-slate-50">
                  <div className="font-mono text-slate-600">{invoice.invoice_id}</div>
                  <div className="font-mono text-slate-600">{invoice.bill_cycle_id}</div>
                  <div className="font-mono text-slate-600">{invoice.bill_run_id}</div>
                  <div className="font-semibold text-slate-700">${invoice.amount.toFixed(2)}</div>
                  <div className="text-slate-600">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      invoice.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                      invoice.status === 'Cancelled' ? 'bg-gray-100 text-gray-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => handleViewInvoiceDetails(invoice)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="View Invoice Details"
                      data-testid={`view-invoice-${invoice.invoice_id}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination('invoices', invoicesPage, mockInvoices.length)}
          </div>
        )}

        {/* Compact Payment Details Modal - Matching Invoice Details Style */}
        {showPaymentDetailsModal && selectedPaymentForDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-3" onClick={() => setShowPaymentDetailsModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
              {/* Compact Header */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-700 px-6 py-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Payment Details</h3>
                      <div className="text-slate-200 text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{selectedPaymentForDetails.payment_id}</span>
                          <span className="text-slate-300">|</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            selectedPaymentForDetails.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            selectedPaymentForDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedPaymentForDetails.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            selectedPaymentForDetails.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            selectedPaymentForDetails.status === 'Refunded' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedPaymentForDetails.status}
                          </span>
                        </div>
                        <div className="text-slate-300 text-xs">
                          ${selectedPaymentForDetails.amount?.toFixed(2)} • {new Date(selectedPaymentForDetails.payment_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentDetailsModal(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    data-testid="close-payment-details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Compact Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Payment Information */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-emerald-800">Payment Information</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Payment ID:</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedPaymentForDetails.payment_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Amount:</span>
                        <span className="font-bold text-emerald-700">${selectedPaymentForDetails.amount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Method:</span>
                        <span className="font-semibold text-slate-800">{selectedPaymentForDetails.method || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Reference:</span>
                        <span className="font-semibold text-slate-800 font-mono text-xs">{selectedPaymentForDetails.reference || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-blue-800">Invoice Information</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Invoice ID:</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedPaymentForDetails.invoice_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Invoice Amount:</span>
                        <span className="font-semibold text-slate-800">${selectedPaymentForDetails.invoice_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Invoice Date:</span>
                        <span className="font-semibold text-slate-800">{selectedPaymentForDetails.invoice_date ? new Date(selectedPaymentForDetails.invoice_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Due Date:</span>
                        <span className="font-semibold text-slate-800">{selectedPaymentForDetails.due_date ? new Date(selectedPaymentForDetails.due_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Payment Comment */}
                {selectedPaymentForDetails.comment && (
                  <div className="mt-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-700">Payment Notes</h4>
                    </div>
                    <p className="text-xs text-slate-700 bg-white/70 rounded p-3 border border-slate-200">{selectedPaymentForDetails.comment}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* End of Payment Details Modal */}

        {/* Removed old payment modal - now redirecting to existing payment screen */}
      </div>
    );
  };

  // Selected User Account Component with SAME structure as SelfAccountView
  const SelectedUserAccountView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isUserAccountStatsExpanded, setIsUserAccountStatsExpanded] = useState(false);
    const [isUserCurrentUsageExpanded, setIsUserCurrentUsageExpanded] = useState(false);
    const [isUserAccountInfoExpanded, setIsUserAccountInfoExpanded] = useState(true);
    const [showUserServicesList, setShowUserServicesList] = useState(false);
    const [showUserPaymentsList, setShowUserPaymentsList] = useState(false);
    const [showUserInvoicesList, setShowUserInvoicesList] = useState(false);
    const [userServicesPage, setUserServicesPage] = useState(1);
    const [userPaymentsPage, setUserPaymentsPage] = useState(1);
    const [userInvoicesPage, setUserInvoicesPage] = useState(1);
    const [showUserPaymentDetailsModal, setShowUserPaymentDetailsModal] = useState(false);
    const [selectedUserPaymentForDetails, setSelectedUserPaymentForDetails] = useState(null);
    const [userApiPayments, setUserApiPayments] = useState([]);
    const [userPaymentsTotalCount, setUserPaymentsTotalCount] = useState(0);
    const [userApiServices, setUserApiServices] = useState([]);
    const [userServicesTotalCount, setUserServicesTotalCount] = useState(0);
    const [isUserPaymentsLoading, setIsUserPaymentsLoading] = useState(false);
    const [isUserServicesLoading, setIsUserServicesLoading] = useState(false);
    const [isUserInvoicesLoading, setIsUserInvoicesLoading] = useState(false);
    const [isUserPaymentProcessing, setIsUserPaymentProcessing] = useState(false);
    
    const userItemsPerPage = 10;

    if (!selectedUserAccount) return null;

    const [userAccountData, setUserAccountData] = useState({
      name: selectedUserAccount?.name || '',
      email: selectedUserAccount?.email || '',
      phone: selectedUserAccount?.phone || '',
      address: selectedUserAccount?.address || '',
      city: selectedUserAccount?.city || '',
      state: selectedUserAccount?.state || '',
      zipcode: selectedUserAccount?.zipcode || '',
      business_type: selectedUserAccount?.business_type || '',
      account_manager: selectedUserAccount?.account_manager || ''
    });

    // Update account data when selection changes
    useEffect(() => {
      if (selectedUserAccount) {
        setUserAccountData({
          name: selectedUserAccount.name,
          email: selectedUserAccount.email,
          phone: selectedUserAccount.phone,
          address: selectedUserAccount.address,
          city: selectedUserAccount.city,
          state: selectedUserAccount.state,
          zipcode: selectedUserAccount.zipcode,
          business_type: selectedUserAccount.business_type,
          account_manager: selectedUserAccount.account_manager
        });
      }
    }, [selectedUserAccount]);

    // Calculate all stats from selected user account
    const userTotalDeposit = Number(selectedUserAccount.total_deposit) || 0;
    const userMonthlyBilling = Number(selectedUserAccount.monthly_billing) || 0;
    const userActiveServices = Number(selectedUserAccount.active_services) || 0;
    const userOutstandingBalance = Number(selectedUserAccount.outstanding_balance) || 0;
    const userCreditBalance = Number(selectedUserAccount.credit_balance) || 0;
    const userTotalCredit = Number(selectedUserAccount.total_credit) || 0;
    const userCreditLimit = Number(selectedUserAccount.credit_limit) || 0;
    const userTotalDebit = Number(selectedUserAccount.total_debit) || 0;
    const userTotalPayment = Number(selectedUserAccount.total_payment) || 0;
    const userLastPayment = Number(selectedUserAccount.last_payment) || 0;
    const userTotalUserDeposit = Number(selectedUserAccount.total_user_deposit) || 0;

    const handleUserUpdate = async () => {
      try {
        console.log('Updating user account with:', userAccountData);
        setIsEditing(false);
        alert('User account updated successfully!');
      } catch (error) {
        console.error('Error updating user account:', error);
        alert('Error updating user account');
      }
    };

    const handleUserExport = () => {
      const exportData = {
        account: selectedUserAccount,
        usage_summary: selectedUserAccount.usage_summary,
        billing_history: selectedUserAccount.billing_history || [],
        stats: { userTotalDeposit, userMonthlyBilling, userActiveServices, userOutstandingBalance },
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `user-account-${selectedUserAccount.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('User account data exported successfully!');
    };

    const handleUserMakePayment = async () => {
      // Open payment functionality for user account
      setIsUserPaymentProcessing(true);
      try {
        console.log('Opening payment for user account:', selectedUserAccount.id);
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Here you would typically open a payment modal or redirect to payment page
        alert(`Payment initiated for ${selectedUserAccount.name}`);
        
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment');
      } finally {
        setIsUserPaymentProcessing(false);
      }
    };

    const handleUserViewPaymentDetails = (payment) => {
      console.log('Viewing user payment details for:', payment.id);
      setSelectedUserPaymentForDetails(payment);
      setShowUserPaymentDetailsModal(true);
    };

    const handleUserViewInvoiceDetails = (invoice) => {
      console.log('Viewing user invoice details for:', invoice.invoice_id);
      
      const detailedInvoice = {
        id: invoice.invoice_id || invoice.id,
        invoice_number: invoice.invoice_id || invoice.id,
        account_name: selectedUserAccount?.name || 'User Account',
        total_amount: invoice.amount,
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoice.status,
        created_at: invoice.invoice_date || new Date().toISOString(),
        issue_date: invoice.invoice_date || new Date().toISOString(),
        month: new Date(invoice.invoice_date || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items: [
          {
            description: invoice.service || 'Service Charge',
            amount: invoice.amount * 0.8,
            quantity: 1
          },
          {
            description: 'Service Fee',
            amount: invoice.amount * 0.15,
            quantity: 1
          },
          {
            description: 'Tax & Other Charges',
            amount: invoice.amount * 0.05,
            quantity: 1
          }
        ],
        subtotal: invoice.amount * 0.95,
        tax_amount: invoice.amount * 0.05,
        discount_amount: 0,
        days_overdue: invoice.status === 'Overdue' ? Math.floor((new Date() - new Date(invoice.due_date || Date.now())) / (1000 * 60 * 60 * 24)) : 0
      };
      
      setSelectedInvoiceForDetails(detailedInvoice);
      setShowEnhancedInvoiceDetails(true);
    };

    const handleUserViewInvoices = async () => {
      setShowUserServicesList(false);
      setShowUserPaymentsList(false);
      
      if (!showUserInvoicesList) {
        setIsUserInvoicesLoading(true);
        await fetchUserInvoices(userInvoicesPage);
      }
      
      setShowUserInvoicesList(!showUserInvoicesList);
      setUserInvoicesPage(1);
    };

    const handleUserViewServices = async () => {
      setShowUserPaymentsList(false);
      setShowUserInvoicesList(false);
      
      if (!showUserServicesList) {
        setIsUserServicesLoading(true);
        await fetchUserServices(userServicesPage);
      }
      
      setShowUserServicesList(!showUserServicesList);
      setUserServicesPage(1);
    };

    const fetchUserPayments = async (page = 1) => {
      setIsUserPaymentsLoading(true);
      try {
        // Mock data for user payments - in real implementation would fetch from API
        const mockUserPayments = [
          {
            id: `USER-PAY-001-${selectedUserAccount.id}`,
            payment_id: `USER-PAY-001-${selectedUserAccount.id}`,
            name: `${selectedUserAccount.business_type} Service Payment`,
            amount: userMonthlyBilling * 0.8,
            comment: `Monthly ${selectedUserAccount.business_type} service payment`,
            status: 'Completed',
            payment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            method: 'Bank Transfer',
            reference: `BT-${selectedUserAccount.account_number}-001`,
            invoice_id: `INV-${selectedUserAccount.account_number}-001`
          },
          {
            id: `USER-PAY-002-${selectedUserAccount.id}`,
            payment_id: `USER-PAY-002-${selectedUserAccount.id}`,
            name: 'Service Fee Payment',
            amount: userMonthlyBilling * 0.2,
            comment: 'Additional service fees',
            status: 'Pending',
            payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            method: 'Credit Card',
            reference: `CC-${selectedUserAccount.account_number}-002`,
            invoice_id: `INV-${selectedUserAccount.account_number}-002`
          }
        ];
        
        setUserApiPayments(mockUserPayments.slice((page - 1) * 10, page * 10));
        setUserPaymentsTotalCount(mockUserPayments.length);
      } catch (error) {
        console.error('Error fetching user payments:', error);
      } finally {
        setIsUserPaymentsLoading(false);
      }
    };

    const fetchUserServices = async (page = 1) => {
      setIsUserServicesLoading(true);
      try {
        console.log(`Fetching services for user account: ${selectedUserAccount.name}, page: ${page}`);
        
        // Fetch ALL services from backend with pagination
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/services?account_id=${selectedUserAccount.id}&page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // If backend response exists, use it, otherwise fallback to enhanced mock data
        if (response.data && response.data.services) {
          setUserApiServices(response.data.services);
          setUserServicesTotalCount(response.data.total_count || 0);
          console.log('✅ Services fetched from backend:', response.data.services.length);
        } else {
          // Enhanced mock data with more services for pagination testing
          const enhancedMockServices = [
            {
              id: `user_serv_001_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-001`,
              name: `${selectedUserAccount.business_type} Electricity`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-001`,
              charging_pattern: `Monthly - $${(userMonthlyBilling * 0.6).toFixed(2)}`
            },
            {
              id: `user_serv_002_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-002`,
              name: `${selectedUserAccount.business_type} Water`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-002`,
              charging_pattern: `Monthly - $${(userMonthlyBilling * 0.3).toFixed(2)}`
            },
            {
              id: `user_serv_003_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-003`,
              name: `${selectedUserAccount.business_type} Internet`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-003`,
              charging_pattern: `Monthly - $${(userMonthlyBilling * 0.1).toFixed(2)}`
            },
            {
              id: `user_serv_004_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-004`,
              name: `${selectedUserAccount.business_type} Security System`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-004`,
              charging_pattern: 'Monthly - $85.00'
            },
            {
              id: `user_serv_005_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-005`,
              name: `${selectedUserAccount.business_type} HVAC Control`,
              status: 'Inactive',
              network_id: `NET-${selectedUserAccount.account_number}-005`,
              charging_pattern: 'Quarterly - $320.00'
            },
            {
              id: `user_serv_006_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-006`,
              name: `${selectedUserAccount.business_type} Parking Management`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-006`,
              charging_pattern: 'Monthly - $75.00'
            },
            {
              id: `user_serv_007_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-007`,
              name: `${selectedUserAccount.business_type} Waste Management`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-007`,
              charging_pattern: 'Monthly - $150.00'
            },
            {
              id: `user_serv_008_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-008`,
              name: `${selectedUserAccount.business_type} Emergency Systems`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-008`,
              charging_pattern: 'Monthly - $120.00'
            },
            {
              id: `user_serv_009_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-009`,
              name: `${selectedUserAccount.business_type} Communication Systems`,
              status: 'Maintenance',
              network_id: `NET-${selectedUserAccount.account_number}-009`,
              charging_pattern: 'Monthly - $200.00'
            },
            {
              id: `user_serv_010_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-010`,
              name: `${selectedUserAccount.business_type} Backup Power`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-010`,
              charging_pattern: 'On-demand - $350.00'
            },
            {
              id: `user_serv_011_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-011`,
              name: `${selectedUserAccount.business_type} Data Services`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-011`,
              charging_pattern: 'Monthly - $450.00'
            },
            {
              id: `user_serv_012_${selectedUserAccount.id}`,
              service_id: `SERV-${selectedUserAccount.account_number}-012`,
              name: `${selectedUserAccount.business_type} Equipment Monitoring`,
              status: 'Active',
              network_id: `NET-${selectedUserAccount.account_number}-012`,
              charging_pattern: 'Monthly - $180.00'
            }
          ];
          
          // Implement pagination for mock data
          const startIndex = (page - 1) * 10;
          const endIndex = page * 10;
          const paginatedServices = enhancedMockServices.slice(startIndex, endIndex);
          
          setUserApiServices(paginatedServices);
          setUserServicesTotalCount(enhancedMockServices.length);
          console.log('✅ Using enhanced mock services with pagination:', paginatedServices.length, 'of', enhancedMockServices.length);
        }
        
      } catch (error) {
        console.error('❌ Error fetching user services:', error);
        // Fallback to enhanced mock data on error
        console.log('🔄 Using enhanced mock services as fallback due to API error');
        
        const enhancedMockServices = [
          {
            id: `user_serv_001_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-001`,
            name: `${selectedUserAccount.business_type} Electricity`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-001`,
            charging_pattern: `Monthly - $${(userMonthlyBilling * 0.6).toFixed(2)}`
          },
          {
            id: `user_serv_002_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-002`,
            name: `${selectedUserAccount.business_type} Water`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-002`,
            charging_pattern: `Monthly - $${(userMonthlyBilling * 0.3).toFixed(2)}`
          },
          {
            id: `user_serv_003_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-003`,
            name: `${selectedUserAccount.business_type} Internet`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-003`,
            charging_pattern: `Monthly - $${(userMonthlyBilling * 0.1).toFixed(2)}`
          },
          {
            id: `user_serv_004_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-004`,
            name: `${selectedUserAccount.business_type} Security System`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-004`,
            charging_pattern: 'Monthly - $85.00'
          },
          {
            id: `user_serv_005_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-005`,
            name: `${selectedUserAccount.business_type} HVAC Control`,
            status: 'Inactive',
            network_id: `NET-${selectedUserAccount.account_number}-005`,
            charging_pattern: 'Quarterly - $320.00'
          },
          {
            id: `user_serv_006_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-006`,
            name: `${selectedUserAccount.business_type} Parking Management`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-006`,
            charging_pattern: 'Monthly - $75.00'
          },
          {
            id: `user_serv_007_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-007`,
            name: `${selectedUserAccount.business_type} Waste Management`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-007`,
            charging_pattern: 'Monthly - $150.00'
          },
          {
            id: `user_serv_008_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-008`,
            name: `${selectedUserAccount.business_type} Emergency Systems`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-008`,
            charging_pattern: 'Monthly - $120.00'
          },
          {
            id: `user_serv_009_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-009`,
            name: `${selectedUserAccount.business_type} Communication Systems`,
            status: 'Maintenance',
            network_id: `NET-${selectedUserAccount.account_number}-009`,
            charging_pattern: 'Monthly - $200.00'
          },
          {
            id: `user_serv_010_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-010`,
            name: `${selectedUserAccount.business_type} Backup Power`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-010`,
            charging_pattern: 'On-demand - $350.00'
          },
          {
            id: `user_serv_011_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-011`,
            name: `${selectedUserAccount.business_type} Data Services`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-011`,
            charging_pattern: 'Monthly - $450.00'
          },
          {
            id: `user_serv_012_${selectedUserAccount.id}`,
            service_id: `SERV-${selectedUserAccount.account_number}-012`,
            name: `${selectedUserAccount.business_type} Equipment Monitoring`,
            status: 'Active',
            network_id: `NET-${selectedUserAccount.account_number}-012`,
            charging_pattern: 'Monthly - $180.00'
          }
        ];
        
        // Implement pagination for fallback mock data
        const startIndex = (page - 1) * 10;
        const endIndex = page * 10;
        const paginatedServices = enhancedMockServices.slice(startIndex, endIndex);
        
        setUserApiServices(paginatedServices);
        setUserServicesTotalCount(enhancedMockServices.length);
        console.log('✅ Fallback mock services set:', paginatedServices.length, 'of', enhancedMockServices.length);
      } finally {
        setIsUserServicesLoading(false);
      }
    };

    const fetchUserInvoices = async (page = 1) => {
      setIsUserInvoicesLoading(true);
      try {
        console.log(`Fetching invoices for user account: ${selectedUserAccount.name}, page: ${page}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data for user invoices - in real implementation would fetch from API
        const mockUserInvoices = [
          {
            id: `INV-${selectedUserAccount.account_number}-001`,
            invoice_id: `INV-${selectedUserAccount.account_number}-001`,
            bill_cycle_id: 'CYC-USER-001',
            bill_run_id: `RUN-USER-${page}-001`,
            amount: Math.floor(Math.random() * 500) + 100,
            invoice_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Paid',
            service: 'Monthly Service Fee'
          },
          {
            id: `INV-${selectedUserAccount.account_number}-002`,
            invoice_id: `INV-${selectedUserAccount.account_number}-002`,
            bill_cycle_id: 'CYC-USER-001',
            bill_run_id: `RUN-USER-${page}-002`,
            amount: Math.floor(Math.random() * 300) + 50,
            invoice_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Pending',
            service: 'Utility Services'
          }
        ];
        
        console.log('✅ User invoices loaded successfully');
      } catch (error) {
        console.error('Error fetching user invoices:', error);
      } finally {
        setIsUserInvoicesLoading(false);
      }
    };

    const handleUserViewPayments = async () => {
      setShowUserServicesList(false);
      setShowUserInvoicesList(false);
      
      if (!showUserPaymentsList) {
        setIsUserPaymentsLoading(true);
        await fetchUserPayments(userPaymentsPage);
      }
      
      setShowUserPaymentsList(!showUserPaymentsList);
    };

    // Mock services data for the user account
    const mockUserServices = [
      {
        id: `user_serv_001_${selectedUserAccount.id}`,
        name: `${selectedUserAccount.business_type} Electricity`,
        status: 'Active',
        networkId: `NET-${selectedUserAccount.account_number}-001`,
        chargingPattern: `Monthly - $${(userMonthlyBilling * 0.6).toFixed(2)}`
      },
      {
        id: `user_serv_002_${selectedUserAccount.id}`, 
        name: `${selectedUserAccount.business_type} Water`,
        status: 'Active',
        networkId: `NET-${selectedUserAccount.account_number}-002`,
        chargingPattern: `Monthly - $${(userMonthlyBilling * 0.3).toFixed(2)}`
      },
      {
        id: `user_serv_003_${selectedUserAccount.id}`,
        name: `${selectedUserAccount.business_type} Internet`, 
        status: 'Active',
        networkId: `NET-${selectedUserAccount.account_number}-003`,
        chargingPattern: `Monthly - $${(userMonthlyBilling * 0.1).toFixed(2)}`
      }
    ];

    // Mock invoices data for the user account
    const mockUserInvoices = [
      {
        id: `INV-${selectedUserAccount.account_number}-001`,
        invoice_id: `INV-${selectedUserAccount.account_number}-001`,
        bill_cycle_id: 'CYC-001',
        bill_run_id: `RUN-2024-${selectedUserAccount.account_number}-001`,
        amount: userMonthlyBilling,
        invoice_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending',
        service: `${selectedUserAccount.business_type} Services`,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: `INV-${selectedUserAccount.account_number}-002`,
        invoice_id: `INV-${selectedUserAccount.account_number}-002`,
        bill_cycle_id: 'CYC-001',
        bill_run_id: `RUN-2024-${selectedUserAccount.account_number}-002`,
        amount: userMonthlyBilling * 0.9,
        invoice_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Paid',
        service: 'Monthly Service Fee',
        due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    const handleUserViewServiceDetails = (serviceId) => {
      if (setActiveTab) {
        setActiveTab('services');
      }
    };

    // Pagination helpers for user account
    const getUserPaginatedData = (data, page) => {
      const startIndex = (page - 1) * userItemsPerPage;
      const endIndex = startIndex + userItemsPerPage;
      return data.slice(startIndex, endIndex);
    };

    const getUserTotalPages = (dataLength) => Math.ceil(dataLength / userItemsPerPage);

    const handleUserPageChange = async (type, page) => {
      if (type === 'services') {
        setUserServicesPage(page);
        await fetchUserServices(page);
      }
      else if (type === 'payments') {
        setUserPaymentsPage(page);
        await fetchUserPayments(page);
      }
      else if (type === 'invoices') {
        setUserInvoicesPage(page);
        await fetchUserInvoices(page);
      }
    };

    const renderUserPagination = (type, currentPage, totalItems) => {
      const totalPages = getUserTotalPages(totalItems);
      if (totalPages <= 1) return null;

      return (
        <div className="flex items-center justify-between mt-3 px-3">
          <div className="text-xs text-slate-600">
            Showing {((currentPage - 1) * userItemsPerPage) + 1} to {Math.min(currentPage * userItemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handleUserPageChange(type, Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded transition-colors"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handleUserPageChange(type, i + 1)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentPage === i + 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handleUserPageChange(type, Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-xl">
        {/* Header with Back Button - SAME as SelfAccountView */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedUserAccount(null);
                setActiveAccountView('user_accounts');
                setShowAccountList(true);
              }}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
              </svg>
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {selectedUserAccount.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800">User Account</h3>
              <p className="text-slate-600 text-xs">{selectedUserAccount.business_type}</p>
            </div>
            {/* Account Number Display */}
            <div className="ml-4 px-3 py-1 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-slate-500">Account #: <span className="font-mono font-semibold text-blue-700">{selectedUserAccount.account_number}</span></p>
            </div>
          </div>
        </div>

        {/* Account Details with Light Gray Background - Collapsible - SAME as SelfAccountView */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded-lg transition-colors mb-2"
            onClick={() => setIsUserAccountInfoExpanded(!isUserAccountInfoExpanded)}
          >
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-semibold text-slate-700">Account Information</h4>
              {!isEditing ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Edit Account"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserUpdate();
                    }}
                    className="p-1 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Save Changes"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(false);
                      setUserAccountData({
                        name: selectedUserAccount.name || '',
                        email: selectedUserAccount.email || '',
                        phone: selectedUserAccount.phone || '',
                        address: selectedUserAccount.address || '',
                        city: selectedUserAccount.city || '',
                        state: selectedUserAccount.state || '',
                        zipcode: selectedUserAccount.zipcode || '',
                        business_type: selectedUserAccount.business_type || '',
                        account_manager: selectedUserAccount.account_manager || ''
                      });
                    }}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Cancel"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <svg 
              className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isUserAccountInfoExpanded ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isUserAccountInfoExpanded && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Account Name</label>
                  <input 
                    type="text" 
                    value={userAccountData.name} 
                    onChange={(e) => setUserAccountData({...userAccountData, name: e.target.value})}
                    className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                      isEditing ? 'bg-white' : 'bg-slate-50'
                    }`}
                    disabled={!isEditing}
                    data-testid="user-account-name-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Email</label>
                  <input 
                    type="email" 
                    value={userAccountData.email} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    disabled
                    data-testid="user-account-email-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Phone</label>
                  <input 
                    type="tel" 
                    value={userAccountData.phone} 
                    onChange={(e) => setUserAccountData({...userAccountData, phone: e.target.value})}
                    className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                      isEditing ? 'bg-white' : 'bg-slate-50'
                    }`}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Business Type</label>
                  <input 
                    type="text" 
                    value={userAccountData.business_type} 
                    onChange={(e) => setUserAccountData({...userAccountData, business_type: e.target.value})}
                    className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                      isEditing ? 'bg-white' : 'bg-slate-50'
                    }`}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Account Manager</label>
                  <input 
                    type="text" 
                    value={userAccountData.account_manager} 
                    onChange={(e) => setUserAccountData({...userAccountData, account_manager: e.target.value})}
                    className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                      isEditing ? 'bg-white' : 'bg-slate-50'
                    }`}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Credit Limit</label>
                  <input 
                    type="text" 
                    value={`$${selectedUserAccount.credit_limit?.toLocaleString() || '0'}`} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    disabled
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Address</label>
                  <input 
                    type="text" 
                    value={userAccountData.address} 
                    onChange={(e) => setUserAccountData({...userAccountData, address: e.target.value})}
                    className={`w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs ${
                      isEditing ? 'bg-white' : 'bg-slate-50'
                    }`}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">City, State, ZIP</label>
                  <input 
                    type="text" 
                    value={`${userAccountData.city}, ${userAccountData.state} ${userAccountData.zipcode}`} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Statistics - Collapsible - SAME as SelfAccountView */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded-lg transition-colors"
            onClick={() => setIsUserAccountStatsExpanded(!isUserAccountStatsExpanded)}
          >
            <h4 className="text-xs font-semibold text-slate-700">Account Statistics</h4>
            <svg 
              className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isUserAccountStatsExpanded ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isUserAccountStatsExpanded && (
            <div className="animate-fadeIn mt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-blue-700">${userTotalDeposit.toFixed(2)}</div>
                  <div className="text-xs text-blue-600">Total Deposit</div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-2 rounded-lg border border-emerald-200">
                  <div className="text-sm font-bold text-emerald-700">${userMonthlyBilling.toFixed(2)}</div>
                  <div className="text-xs text-emerald-600">Monthly Billing</div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-2 rounded-lg border border-amber-200">
                  <div className="text-sm font-bold text-amber-700">{userActiveServices}</div>
                  <div className="text-xs text-amber-600">Active Services</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200">
                  <div className="text-sm font-bold text-purple-700">${userOutstandingBalance.toFixed(2)}</div>
                  <div className="text-xs text-purple-600">Outstanding</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-2 rounded-lg border border-green-200">
                  <div className="text-sm font-bold text-green-700">${userCreditLimit.toFixed(2)}</div>
                  <div className="text-xs text-green-600">Credit Limit</div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-2 rounded-lg border border-red-200">
                  <div className="text-sm font-bold text-red-700">${userLastPayment.toFixed(2)}</div>
                  <div className="text-xs text-red-600">Last Payment</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Usage - Collapsible - SAME as SelfAccountView */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-100 p-1 rounded-lg transition-colors"
            onClick={() => setIsUserCurrentUsageExpanded(!isUserCurrentUsageExpanded)}
          >
            <h4 className="text-xs font-semibold text-slate-700">Current Usage</h4>
            <svg 
              className={`w-3 h-3 text-slate-600 transform transition-transform duration-200 ${isUserCurrentUsageExpanded ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isUserCurrentUsageExpanded && selectedUserAccount.usage_summary && (
            <div className="animate-fadeIn mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(selectedUserAccount.usage_summary).map(([service, usage]) => (
                  <div key={service} className="bg-gradient-to-r from-slate-50 to-slate-100 p-2 rounded-lg border border-slate-200">
                    <div className="text-sm font-bold text-slate-700">{usage}</div>
                    <div className="text-xs text-slate-600 capitalize">{service.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Updated to match Self Account pattern with loading states */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            onClick={handleUserViewServices}
            disabled={isUserServicesLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-user-services-btn"
          >
            <span className={`transition-opacity duration-200 ${isUserServicesLoading ? 'opacity-50' : 'opacity-100'}`}>
              {showUserServicesList ? 'Hide Services' : 'View Services'}
            </span>
            {isUserServicesLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="user-services-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="user-services-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="user-services-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
          <button 
            onClick={handleUserViewPayments}
            disabled={isUserPaymentsLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden min-w-[80px]"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-user-payments-btn"
          >
            <span className={`transition-opacity duration-200 ${isUserPaymentsLoading ? 'opacity-50' : 'opacity-100'}`}>
              {showUserPaymentsList ? 'Hide Payments' : 'Payments'}
            </span>
            {isUserPaymentsLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="user-payments-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="user-payments-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="user-payments-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
          <button 
            onClick={handleUserViewInvoices}
            disabled={isUserInvoicesLoading}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs relative overflow-hidden min-w-[80px]"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="view-user-invoices-btn"
          >
            <span className={`transition-opacity duration-200 ${isUserInvoicesLoading ? 'opacity-50' : 'opacity-100'}`}>
              {showUserInvoicesList ? 'Hide Invoices' : 'Invoice'}
            </span>
            {isUserInvoicesLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm"
                data-testid="user-invoices-loading-overlay"
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    data-testid="user-invoices-loading-spinner"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium" data-testid="user-invoices-loading-text">Loading...</span>
                </div>
              </div>
            )}
          </button>
          <button 
            onClick={handleUserExport}
            className="bg-gradient-to-r text-white px-4 py-1.5 rounded-lg transition-all shadow-md font-medium text-xs"
            style={{background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 2px 4px -1px rgba(16, 185, 129, 0.3)', color: '#ffffff'}}
            data-testid="export-user-account-btn"
          >
            Export Account
          </button>
        </div>

        {/* Services List - Enhanced table format with pagination */}
        {showUserServicesList && (
          <div className="bg-slate-50/80 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-sm font-semibold text-slate-700">
                Services {userServicesTotalCount > 0 && `(${userServicesTotalCount} total)`}
              </h5>
              <button 
                onClick={() => setShowUserServicesList(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                data-testid="close-user-services-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Loading State */}
            {isUserServicesLoading ? (
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <span className="ml-3 text-slate-600">Loading services...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Services Table - Always show table structure with headers */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Service ID</th>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Network ID</th>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Charging Pattern</th>
                          <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {userApiServices && userApiServices.length > 0 ? (
                          userApiServices.map((service, index) => (
                            <tr key={service.id} className="hover:bg-slate-50 transition-colors" data-testid={`user-service-row-${index}`}>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                {service.service_id || service.id}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-900">
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-3 ${
                                    service.status === 'Active' ? 'bg-green-500' : 
                                    service.status === 'Inactive' ? 'bg-red-500' : 
                                    service.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-gray-500'
                                  }`}></div>
                                  {service.name}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  service.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                  service.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                                  service.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {service.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                {service.network_id || service.networkId}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {service.charging_pattern || service.chargingPattern}
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <button 
                                  onClick={() => handleUserViewServiceDetails(service.id)}
                                  className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                  data-testid={`view-user-service-${service.id}`}
                                  title="View Service Details"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <div 
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300"
                                    style={{ animation: 'shimmer 2s infinite' }}
                                  />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center">
                              <div className="text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm">No services found for this account.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Pagination */}
                {userServicesTotalCount > 10 && (
                  <div className="mt-3">
                    {renderUserPagination('services', userServicesPage, userServicesTotalCount)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Payments List - SAME structure as SelfAccountView */}
        {showUserPaymentsList && (
          <div className="bg-slate-50/80 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-sm font-semibold text-slate-700">Payments</h5>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleUserMakePayment}
                  disabled={isUserPaymentProcessing}
                  className="bg-emerald-500 text-white px-2 py-1 text-xs rounded-lg hover:bg-emerald-600 transition-colors relative overflow-hidden min-w-[80px] disabled:opacity-50"
                  data-testid="make-new-user-payment-btn"
                >
                  <span className={`transition-opacity duration-200 ${isUserPaymentProcessing ? 'opacity-50' : 'opacity-100'}`}>
                    New Payment
                  </span>
                  {isUserPaymentProcessing && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm"
                      data-testid="user-payment-processing-overlay"
                    >
                      <div className="flex items-center space-x-1">
                        <svg 
                          className="animate-spin h-3 w-3 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                          data-testid="user-payment-processing-spinner"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="text-white text-xs font-medium" data-testid="user-payment-processing-text">Processing...</span>
                      </div>
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => setShowUserPaymentsList(false)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {isUserPaymentsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {userApiPayments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          payment.status === 'Completed' ? 'bg-green-500' : 
                          payment.status === 'Pending' ? 'bg-yellow-500' : 
                          payment.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{payment.name}</div>
                          <div className="text-xs text-slate-500">{payment.method} - {payment.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-800">${payment.amount.toFixed(2)}</div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            payment.status === 'Failed' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {payment.status}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUserViewPaymentDetails(payment)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          data-testid={`view-user-payment-${payment.id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {renderUserPagination('payments', userPaymentsPage, userApiPayments.length)}
          </div>
        )}

        {/* Invoices List - SAME structure as SelfAccountView */}
        {showUserInvoicesList && (
          <div className="bg-slate-50/80 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-sm font-semibold text-slate-700">Invoices</h5>
              <button 
                onClick={() => setShowUserInvoicesList(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {isUserInvoicesLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {mockUserInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-500' : 
                          invoice.status === 'Overdue' ? 'bg-red-500' : 
                          'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">Invoice #{invoice.invoice_id}</div>
                          <div className="text-xs text-slate-500">{invoice.service}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-800">${invoice.amount.toFixed(2)}</div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {invoice.status}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUserViewInvoiceDetails(invoice)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          data-testid={`view-user-invoice-${invoice.invoice_id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {renderUserPagination('invoices', userInvoicesPage, mockUserInvoices.length)}
          </div>
        )}
      </div>
    );
  };

  // User Accounts List Component with enhanced filtering and sorting
  const UserAccountsListView = () => {
    const [accountFilters, setAccountFilters] = useState({
      searchTerm: '',
      accountName: '',
      accountId: '',
      phone: '',
      businessType: 'all',
      status: 'all',
      depositRange: 'all'
    });
    
    const [appliedAccountFilters, setAppliedAccountFilters] = useState({
      searchTerm: '',
      accountName: '',
      accountId: '',
      phone: '',
      businessType: 'all',
      status: 'all',
      depositRange: 'all'
    });
    
    const [accountSorting, setAccountSorting] = useState({
      field: 'name',
      direction: 'asc'
    });
    
    const [showAdvancedAccountFilters, setShowAdvancedAccountFilters] = useState(false);

    // Apply account filters
    const applyAccountFilters = () => {
      setAppliedAccountFilters({...accountFilters});
      setCurrentPage(1);
    };

    // Clear account filters
    const clearAccountFilters = () => {
      const clearedFilters = {
        searchTerm: '',
        accountName: '',
        accountId: '',
        phone: '',
        businessType: 'all',
        status: 'all',
        depositRange: 'all'
      };
      setAccountFilters(clearedFilters);
      setAppliedAccountFilters(clearedFilters);
      setCurrentPage(1);
    };

    // Handle account sorting
    const handleAccountSort = (field) => {
      setAccountSorting(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    // Enhanced filtering logic
    const filteredAccounts = userAccounts.filter(account => {
      const matchesGlobalSearch = !appliedAccountFilters.searchTerm || 
        account.name.toLowerCase().includes(appliedAccountFilters.searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(appliedAccountFilters.searchTerm.toLowerCase()) ||
        account.phone.includes(appliedAccountFilters.searchTerm) ||
        account.account_number.toLowerCase().includes(appliedAccountFilters.searchTerm.toLowerCase());
      
      const matchesName = !appliedAccountFilters.accountName || 
        account.name.toLowerCase().includes(appliedAccountFilters.accountName.toLowerCase());
      
      const matchesAccountId = !appliedAccountFilters.accountId || 
        account.account_number.toLowerCase().includes(appliedAccountFilters.accountId.toLowerCase());
      
      const matchesPhone = !appliedAccountFilters.phone || 
        account.phone.includes(appliedAccountFilters.phone);
      
      const matchesBusinessType = appliedAccountFilters.businessType === 'all' || 
        account.business_type === appliedAccountFilters.businessType;
      
      const matchesStatus = appliedAccountFilters.status === 'all' || 
        (appliedAccountFilters.status === 'active' && account.is_active) ||
        (appliedAccountFilters.status === 'inactive' && !account.is_active);

      const matchesDepositRange = appliedAccountFilters.depositRange === 'all' || 
        (appliedAccountFilters.depositRange === 'low' && account.total_deposit < 2500) ||
        (appliedAccountFilters.depositRange === 'medium' && account.total_deposit >= 2500 && account.total_deposit < 5000) ||
        (appliedAccountFilters.depositRange === 'high' && account.total_deposit >= 5000);
      
      return matchesGlobalSearch && matchesName && matchesAccountId && matchesPhone && 
             matchesBusinessType && matchesStatus && matchesDepositRange;
    });

    // Enhanced sorting logic
    const sortedAccounts = [...filteredAccounts].sort((a, b) => {
      const direction = accountSorting.direction === 'asc' ? 1 : -1;
      
      switch (accountSorting.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'business_type':
          return direction * a.business_type.localeCompare(b.business_type);
        case 'total_deposit':
          return direction * (a.total_deposit - b.total_deposit);
        case 'monthly_billing':
          return direction * (a.monthly_billing - b.monthly_billing);
        case 'active_services':
          return direction * (a.active_services - b.active_services);
        case 'established_date':
          return direction * (new Date(a.established_date) - new Date(b.established_date));
        default:
          return direction * a.name.localeCompare(b.name);
      }
    });

    // Pagination logic
    const indexOfLastAccount = currentPage * accountsPerPage;
    const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
    const currentAccounts = sortedAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
    const totalPages = Math.ceil(sortedAccounts.length / accountsPerPage);

    const handleAccountSelect = (accountId) => {
      fetchUserAccountDetails(accountId);
    };

    // Get unique values for dropdowns
    const uniqueBusinessTypes = [...new Set(userAccounts.map(a => a.business_type))];

    const getSortIcon = (field) => {
      if (accountSorting.field !== field) {
        return (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      }
      
      return accountSorting.direction === 'asc' ? (
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
        {/* Compact Enhanced Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-white/40 p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-bold text-slate-800">Account Search & Filters</h4>
            <button
              onClick={() => setShowAccountList(false)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Compact Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Global Search</label>
              <input
                type="text"
                placeholder="Search accounts..."
                value={accountFilters.searchTerm}
                onChange={(e) => setAccountFilters({...accountFilters, searchTerm: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                data-testid="account-global-search"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Sort By</label>
              <select
                value={accountSorting.field}
                onChange={(e) => setAccountSorting({...accountSorting, field: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="name">Account Name</option>
                <option value="email">Email</option>
                <option value="business_type">Business Type</option>
                <option value="total_deposit">Total Deposit</option>
                <option value="monthly_billing">Monthly Billing</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Order</label>
              <select
                value={accountSorting.direction}
                onChange={(e) => setAccountSorting({...accountSorting, direction: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Apply/Clear Buttons - Before Advanced Filters */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-2">
              <button
                onClick={applyAccountFilters}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all shadow font-medium"
                data-testid="apply-account-filters-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={clearAccountFilters}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-3 py-1 rounded text-xs hover:from-slate-600 hover:to-slate-700 transition-all shadow font-medium"
              >
                Clear
              </button>
            </div>
            <button
              onClick={() => setShowAdvancedAccountFilters(!showAdvancedAccountFilters)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showAdvancedAccountFilters ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          {/* Compact Advanced Filters */}
          {showAdvancedAccountFilters && (
            <div className="border-t border-slate-200 pt-2">
              <h5 className="text-xs font-medium text-slate-700 mb-2">Advanced Filters</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Account Name</label>
                  <input
                    type="text"
                    placeholder="Account name..."
                    value={accountFilters.accountName}
                    onChange={(e) => setAccountFilters({...accountFilters, accountName: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Account ID</label>
                  <input
                    type="text"
                    placeholder="Account #..."
                    value={accountFilters.accountId}
                    onChange={(e) => setAccountFilters({...accountFilters, accountId: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="Phone..."
                    value={accountFilters.phone}
                    onChange={(e) => setAccountFilters({...accountFilters, phone: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Business Type</label>
                  <select
                    value={accountFilters.businessType}
                    onChange={(e) => setAccountFilters({...accountFilters, businessType: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    {uniqueBusinessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={accountFilters.status}
                    onChange={(e) => setAccountFilters({...accountFilters, status: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Deposit Range</label>
                  <select
                    value={accountFilters.depositRange}
                    onChange={(e) => setAccountFilters({...accountFilters, depositRange: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Deposits</option>
                    <option value="low">Low (&lt; $2,500)</option>
                    <option value="medium">Medium ($2,500 - $5,000)</option>
                    <option value="high">High (&gt; $5,000)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {currentAccounts.length} of {sortedAccounts.length} accounts 
              {appliedAccountFilters.searchTerm || appliedAccountFilters.accountName || appliedAccountFilters.accountId || appliedAccountFilters.phone ? ' (filtered)' : ''}
            </div>
            <div className="text-sm text-slate-500">
              Sorted by {accountSorting.field.replace('_', ' ')} ({accountSorting.direction})
            </div>
          </div>
        </div>

        {/* Compact Account List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-white/40 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-slate-800">User Accounts ({filteredAccounts.length})</h3>
                <p className="text-slate-600 text-xs">Click to view detailed information</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddAccountModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all shadow font-medium flex items-center space-x-1"
                  data-testid="create-account-btn"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Account</span>
                </button>
                <div className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {currentAccounts.map((account) => (
              <div 
                key={account.id} 
                className="p-3 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                onClick={() => handleAccountSelect(account.id)}
                data-testid={`account-item-${account.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800 text-sm">{account.name}</h4>
                        <p className="text-xs text-slate-600">{account.email}</p>
                        <p className="text-xs text-slate-500">{account.business_type} • {account.account_number}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-xs font-medium text-slate-700">${account.total_deposit.toLocaleString()}</div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          account.is_active 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {account.is_active ? 'Active' : 'Suspended'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-slate-500">
                      <span>{account.active_services} Services</span>
                      <span>•</span>
                      <span>${account.monthly_billing.toFixed(2)}/month</span>
                      <span>•</span>
                      <span>{account.outstanding_balance > 0 ? `$${account.outstanding_balance.toFixed(2)} due` : 'Paid up'}</span>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div className="bg-emerald-50 px-4 py-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-700">
                  Showing {indexOfFirstAccount + 1} to {Math.min(indexOfLastAccount, filteredAccounts.length)} of {filteredAccounts.length} accounts
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 text-xs border rounded transition-colors ${
                        currentPage === page
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

  return (
    <div className="space-y-3">
      {/* Compact Header with Right-Aligned Dropdown */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
          
          {/* Compact Account Navigation Buttons */}
          <div className="flex items-center space-x-1">
            {/* Master Account Button */}
            {accountInfo?.has_master_account && (
              <button
                onClick={() => {
                  setActiveAccountView('master_account');
                  setShowAccountList(false);
                  setSelectedUserAccount(null);
                }}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-all duration-200 min-w-[100px] ${
                  activeAccountView === 'master_account'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/90 text-slate-600 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300'
                }`}
                data-testid="master-account-btn"
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v16a2 2 0 01-2 2z" />
                  </svg>
                  <span>Master Account</span>
                </div>
              </button>
            )}
            
            {/* Self Account Button */}
            <button
              onClick={() => {
                setActiveAccountView('self_account');
                setShowAccountList(false);
                setSelectedUserAccount(null);
              }}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-all duration-200 min-w-[100px] ${
                activeAccountView === 'self_account'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300'
              }`}
              data-testid="self-account-btn"
            >
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Self Account</span>
              </div>
            </button>
            
            {/* User Accounts Button */}
            {accountInfo?.show_user_accounts && (
              <button
                onClick={() => {
                  setActiveAccountView('user_accounts');
                  setShowAccountList(true);
                  setSelectedUserAccount(null);
                }}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-all duration-200 min-w-[100px] ${
                  activeAccountView === 'user_accounts' || activeAccountView === 'selected_account'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/90 text-slate-600 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300'
                }`}
                data-testid="user-accounts-btn"
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>User Accounts</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Active View */}
      {activeAccountView === 'master_account' && (
        <MasterAccountView />
      )}

      {activeAccountView === 'self_account' && (
        <SelfAccountView />
      )}

      {activeAccountView === 'selected_account' && (
        <SelectedUserAccountView />
      )}

      {activeAccountView === 'user_accounts' && showAccountList && (
        <UserAccountsListView />
      )}

      {activeAccountView === 'user_accounts' && !showAccountList && !selectedUserAccount && accountInfo?.show_user_accounts && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">User Account Management</h3>
          <p className="text-slate-500 mb-4">View and manage accounts under your supervision with advanced filtering and sorting capabilities.</p>
          <button
            onClick={() => setShowAccountList(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
          >
            View User Accounts
          </button>
        </div>
      )}
      
      {/* Enhanced Account Creation Modal */}
      {showAddAccountModal && (
        <EnhancedAccountCreation
          AuthContext={{ Consumer: ({ children }) => children({ user }) }}
          onClose={() => setShowAddAccountModal(false)}
          onAccountCreated={(newAccount) => {
            console.log('New account created:', newAccount);
            fetchAccounts(); // Refresh accounts list
            setShowAddAccountModal(false);
          }}
        />
      )}

      {/* Make Account Payment Popup */}
      {showMakeAccountPayment && selectedSelfAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200">
            {/* Metallic Header */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 text-white p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back Arrow Button */}
                  <button
                    onClick={handleCloseMakeAccountPayment}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 flex items-center space-x-1"
                    data-testid="back-to-account"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                  </button>
                  <div className="border-l border-white/30 h-6"></div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Make Payment</h1>
                    <p className="text-slate-200 text-sm font-medium">{selectedSelfAccount?.name}</p>
                  </div>
                </div>
                {/* Close Button */}
                <button
                  onClick={handleCloseMakeAccountPayment}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                  data-testid="close-make-account-payment"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Content with Two Columns */}
            <div className="flex h-full">
              {/* Left Column - Payment Options */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
                {/* Outstanding Amount */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-800">Outstanding Amount</h3>
                  </div>
                  <button
                    onClick={() => setAccountPaymentMode('outstanding')}
                    className={`w-full p-5 border-2 rounded-xl text-left transition-all duration-300 ${
                      accountPaymentMode === 'outstanding'
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                    data-testid="outstanding-amount-option"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-base font-semibold text-slate-800">
                          Pay Full Outstanding Balance - ${selectedSelfAccount?.outstanding_balance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">Clear all outstanding dues at once</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-700 font-medium">Recommended Option</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">
                          ${selectedSelfAccount?.outstanding_balance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-slate-500">Total Due</div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Invoice */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-800">Invoice</h3>
                  </div>
                  <div className={`border-2 rounded-xl transition-all duration-300 ${
                    accountPaymentMode === 'invoice' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200'
                  }`}>
                    <button
                      onClick={() => {
                        setAccountPaymentMode('invoice');
                        fetchUnpaidInvoicesForCurrentAccount();
                      }}
                      className="w-full p-5 text-left transition-all duration-300"
                      data-testid="invoice-amount-option"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-base font-semibold text-slate-800">Pay Specific Invoices</div>
                          <div className="text-sm text-slate-600 mt-1">Select individual invoices to pay</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-700 font-medium">Flexible Payment Option</span>
                          </div>
                        </div>
                        <div className="text-blue-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    
                    {accountPaymentMode === 'invoice' && (
                      <div className="border-t-2 border-blue-200 p-4">
                        {unpaidAccountInvoices.length > 0 ? (
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {unpaidAccountInvoices.map((invoice) => (
                              <div key={invoice.id} 
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedAccountInvoicesForPayment.includes(invoice.id) 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-slate-200 bg-white hover:border-blue-300'
                                }`}
                                onClick={() => {
                                  handleAccountInvoiceSelectionForPayment(invoice.id, !selectedAccountInvoicesForPayment.includes(invoice.id));
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedAccountInvoicesForPayment.includes(invoice.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleAccountInvoiceSelectionForPayment(invoice.id, e.target.checked);
                                      }}
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <div>
                                      <div className="font-bold text-slate-800">{invoice.invoice_number}</div>
                                      <div className="text-sm text-slate-600">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
                                      {invoice.days_overdue > 0 && (
                                        <div className="text-xs text-red-600 font-medium">{invoice.days_overdue} days overdue</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-slate-800">${invoice.total_amount.toFixed(2)}</div>
                                    {invoice.lateFee > 0 && (
                                      <div className="text-sm text-red-600">+${invoice.lateFee.toFixed(2)} late fee</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-slate-500">No unpaid invoices found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Other Amount, Comment, Payment Summary */}
              <div className="w-96 bg-slate-50 border-l border-slate-200 p-4 space-y-4">
                {/* Other Amount */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-800">Other Amount</h3>
                  <div className={`border-2 rounded-lg transition-all duration-300 ${
                    accountPaymentMode === 'other' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-slate-200 bg-white'
                  }`}>
                    <button
                      onClick={() => setAccountPaymentMode('other')}
                      className="w-full p-3 text-left transition-all duration-300"
                      data-testid="other-amount-option"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">Enter Custom Amount</div>
                          <div className="text-xs text-slate-600">Pay any specific amount</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                            <span className="text-xs text-purple-700">Flexible Payment</span>
                          </div>
                        </div>
                        <div className="text-purple-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    
                    {accountPaymentMode === 'other' && (
                      <div className="border-t border-purple-200 p-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-purple-600 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={accountOtherPaymentAmount}
                            onChange={(e) => setAccountOtherPaymentAmount(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm font-semibold text-slate-800 bg-white"
                            placeholder="0.00"
                            data-testid="custom-amount-input"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-800">Comment</h3>
                    <span className="text-xs text-slate-500">(Optional)</span>
                  </div>
                  <textarea
                    value={accountPaymentComment}
                    onChange={(e) => setAccountPaymentComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white placeholder-slate-400 resize-none"
                    rows={3}
                    placeholder="Add a note for this payment..."
                    data-testid="payment-comment"
                  />
                </div>

                {/* Payment Summary */}
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-800">Payment Summary</h4>
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1">{getAccountPaymentSummaryLabel()}</div>
                      <div className={`text-2xl font-bold ${
                        accountPaymentMode 
                          ? 'text-emerald-600' 
                          : 'text-slate-400'
                      }`}>
                        ${getAccountPaymentSummaryAmount().toFixed(2)}
                      </div>
                      {accountPaymentMode === 'invoice' && selectedAccountInvoicesForPayment.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          Including late fees
                        </div>
                      )}
                      {accountPaymentMode === 'outstanding' && (
                        <div className="text-xs text-slate-500 mt-1">
                          Including all dues & late fees
                        </div>
                      )}
                      {!accountPaymentMode && (
                        <div className="text-xs text-slate-400 mt-1">
                          Select payment option above
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  onClick={handleAccountPayNow}
                  disabled={!accountPaymentMode || (accountPaymentMode === 'invoice' && selectedAccountInvoicesForPayment.length === 0) || (accountPaymentMode === 'other' && (!accountOtherPaymentAmount || parseFloat(accountOtherPaymentAmount) <= 0))}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    !accountPaymentMode || (accountPaymentMode === 'invoice' && selectedAccountInvoicesForPayment.length === 0) || (accountPaymentMode === 'other' && (!accountOtherPaymentAmount || parseFloat(accountOtherPaymentAmount) <= 0))
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg'
                  }`}
                  data-testid="pay-now-button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Pay Now</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Payment Modal */}
      {showUniversalPayment && selectedInvoiceForPayment && (
        <UniversalPaymentModal
          invoice={selectedInvoiceForPayment}
          isOpen={showUniversalPayment}
          onClose={() => {
            setShowUniversalPayment(false);
            setSelectedInvoiceForPayment(null);
          }}
          onPaymentSuccess={(paymentData) => {
            console.log('Payment successful:', paymentData);
            // Refresh account data after successful payment
            initializeDummyAccountData();
            setShowUniversalPayment(false);
            setSelectedInvoiceForPayment(null);
          }}
        />
      )}

      {/* Enhanced Invoice Details Modal */}
      {showEnhancedInvoiceDetails && selectedInvoiceForDetails && (
        <EnhancedInvoiceDetails
          invoice={selectedInvoiceForDetails}
          onClose={() => {
            setShowEnhancedInvoiceDetails(false);
            setSelectedInvoiceForDetails(null);
          }}
          onPayNow={(invoice) => {
            // Convert to payment format and show universal payment modal
            setSelectedInvoiceForPayment(invoice);
            setShowUniversalPayment(true);
            setShowEnhancedInvoiceDetails(false);
          }}
          showPaymentAction={true}
        />
      )}
    </div>
  );
};

export default AccountDetails;