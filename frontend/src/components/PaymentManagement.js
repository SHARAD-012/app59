import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UniversalPaymentModal from './UniversalPaymentModal';
import EnhancedInvoiceDetails from './EnhancedInvoiceDetails';
import EnhancedPaymentDetails from './EnhancedPaymentDetails';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Payment Management Component
const PaymentManagement = ({ AuthContext, selectedInvoiceForPayment }) => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Tab management
  const [activeTab, setActiveTab] = useState('self-payments');
  
  // Payment functionality state
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showUnpaidInvoicesModal, setShowUnpaidInvoicesModal] = useState(false);
  const [showUniversalPayment, setShowUniversalPayment] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedInvoiceForPaymentLocal, setSelectedInvoiceForPaymentLocal] = useState(null);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  
  // Simplified state for payment flow
  const [userAccounts, setUserAccounts] = useState([]);
  const [showMakePaymentPage, setShowMakePaymentPage] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [otherPaymentAmount, setOtherPaymentAmount] = useState('');
  const [paymentComment, setPaymentComment] = useState('');
  const [selectedInvoicesForPayment, setSelectedInvoicesForPayment] = useState([]);
  const [unpaidInvoicesForAccount, setUnpaidInvoicesForAccount] = useState([]);
  
  // Payment Details Modal State
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState(null);
  
  // Invoice Details Modal State
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [selectedInvoiceForDetailsModal, setSelectedInvoiceForDetailsModal] = useState(null);
  
  // Account Selection State
  const [selectedAccountForView, setSelectedAccountForView] = useState('');
  const [selectedAccountDetails, setSelectedAccountDetails] = useState(null);
  const [accountPaymentHistory, setAccountPaymentHistory] = useState([]);

  // Self Payment filters
  const [selfPaymentFilters, setSelfPaymentFilters] = useState({
    searchTerm: '',
    accountId: '',
    paymentId: '',
    transactionId: '',
    invoiceId: '',
    status: 'all'
  });

  const [appliedSelfPaymentFilters, setAppliedSelfPaymentFilters] = useState({
    searchTerm: '',
    accountId: '',
    paymentId: '',
    transactionId: '',
    invoiceId: '',
    status: 'all'
  });

  // Payment filters for user payments tab
  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: '',
    paymentId: '',
    transactionId: '',
    invoiceId: '',
    status: 'all',
    accountId: '',
    profileId: '',
    profileName: ''
  });

  const [appliedPaymentFilters, setAppliedPaymentFilters] = useState({
    searchTerm: '',
    paymentId: '',
    transactionId: '',
    invoiceId: '',
    status: 'all',
    accountId: '',
    profileId: '',
    profileName: ''
  });

  // Advanced search toggles
  const [showAdvancedPaymentFilters, setShowAdvancedPaymentFilters] = useState(false);
  const [showAdvancedSelfPaymentFilters, setShowAdvancedSelfPaymentFilters] = useState(false);

  // Pagination state for user payments
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  // Handle incoming selectedInvoiceForPayment from dashboard
  useEffect(() => {
    if (selectedInvoiceForPayment) {
      setSelectedInvoiceForPaymentLocal(selectedInvoiceForPayment);
      setActiveTab('self-payments'); // Switch to self-payments tab
      setShowUniversalPayment(true);
    }
  }, [selectedInvoiceForPayment]);

  useEffect(() => {
    fetchPayments();
    fetchAccounts();
    fetchProfiles();
    fetchInvoices();
    calculateOutstandingBalance();
    fetchUserAccounts();
  }, []);

  const fetchPayments = async () => {
    try {
      // Mock payment data - Enhanced with more realistic data
      const mockPayments = [
        {
          id: 'pay_001',
          payment_number: 'PAY-000001',
          invoice_id: 'inv_001',
          account_id: 'acc_001',
          profile_id: 'prof_001',
          amount: 295.50,
          payment_method: 'Credit Card',
          status: 'completed',
          transaction_id: 'TXN-12345',
          payment_date: new Date('2024-02-15'),
          created_at: new Date('2024-02-15'),
          notes: 'Payment for electricity service'
        },
        {
          id: 'pay_002',
          payment_number: 'PAY-000002',
          invoice_id: 'inv_002',
          account_id: 'acc_001',
          profile_id: 'prof_001',
          amount: 100.00,
          payment_method: 'Bank Transfer',
          status: 'completed',
          transaction_id: 'TXN-12346',
          payment_date: new Date('2024-03-12'),
          created_at: new Date('2024-03-12'),
          notes: 'Partial payment for water service'
        },
        {
          id: 'pay_003',
          payment_number: 'PAY-000003',
          invoice_id: null, // Account payment without specific invoice
          account_id: 'acc_001',
          profile_id: 'prof_001',
          amount: 500.00,
          payment_method: 'Check',
          status: 'pending',
          transaction_id: null,
          payment_date: new Date('2024-03-25'),
          created_at: new Date('2024-03-25'),
          notes: 'Account credit payment'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Mock invoice data - in real app this would come from backend
      const mockInvoices = [
        {
          id: 'inv_001',
          invoice_number: 'INV-000123',
          account_id: 'acc_001',
          profile_id: 'prof_001',
          total_amount: 295.50,
          status: 'paid',
          due_date: new Date('2024-02-15'),
          created_at: new Date('2024-01-15'),
          items: [
            { description: 'Electricity Service', amount: 250.00 },
            { description: 'Setup Fee', amount: 45.50 }
          ]
        },
        {
          id: 'inv_002',
          invoice_number: 'INV-000124',
          account_id: 'acc_001',
          profile_id: 'prof_001',
          total_amount: 187.25,
          status: 'overdue',
          due_date: new Date('2024-03-10'),
          created_at: new Date('2024-02-10'),
          items: [
            { description: 'Water Service', amount: 85.00 },
            { description: 'Late Fee', amount: 102.25 }
          ]
        },
        {
          id: 'inv_003',
          invoice_number: 'INV-000125',
          account_id: 'acc_001',
          profile_id: 'prof_002',
          total_amount: 425.80,
          status: 'sent',
          due_date: new Date('2024-04-15'),
          created_at: new Date('2024-03-15'),
          items: [
            { description: 'Internet Service', amount: 120.00 },
            { description: 'Equipment Rental', amount: 305.80 }
          ]
        },
        {
          id: 'inv_004',
          invoice_number: 'INV-000126',
          account_id: 'acc_001',
          profile_id: 'prof_001',
          total_amount: 345.75,
          status: 'sent',
          due_date: new Date('2024-04-20'),
          created_at: new Date('2024-03-20'),
          items: [
            { description: 'Gas Service', amount: 150.00 },
            { description: 'Maintenance Fee', amount: 195.75 }
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
      // For admin/super_admin, show outstanding balance from mock data
      outstanding = 532.00; // Mock outstanding balance
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

  // Fetch accounts for the current user
  const fetchUserAccounts = async () => {
    try {
      // Mock user accounts data - showing all accounts with outstanding balances
      const mockUserAccounts = [
        {
          id: 'acc_001',
          name: 'Tech Solutions Main Office',
          profile_id: 'prof_001',
          outstanding_balance: 532.00,
          user_id: user.id
        },
        {
          id: 'acc_002', 
          name: 'Tech Solutions Branch Office',
          profile_id: 'prof_001',
          outstanding_balance: 225.75,
          user_id: user.id
        },
        {
          id: 'acc_003', 
          name: 'Green Restaurant Group',
          profile_id: 'prof_002',
          outstanding_balance: 345.75,
          user_id: user.id
        },
        {
          id: 'acc_004', 
          name: 'Digital Marketing Hub',
          profile_id: 'prof_003',
          outstanding_balance: 187.25,
          user_id: user.id
        },
        {
          id: 'acc_005', 
          name: 'Healthcare Solutions LLC',
          profile_id: 'prof_004',
          outstanding_balance: 0.00,
          user_id: user.id
        }
      ];
      
      // Show all accounts regardless of role for admin functionality
      setUserAccounts(mockUserAccounts);
      
      // Account selection handled in UI
    } catch (error) {
      console.error('Error fetching user accounts:', error);
    }
  };

  // Handle account selection for viewing
  const handleAccountSelectionForView = (accountId) => {
    setSelectedAccountForView(accountId);
    const account = userAccounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAccountDetails(account);
      fetchAccountPaymentHistory(accountId);
    } else {
      setSelectedAccountDetails(null);
      setAccountPaymentHistory([]);
    }
  };

  // Fetch payment history for selected account
  const fetchAccountPaymentHistory = async (accountId) => {
    try {
      // Mock payment history for the selected account
      const mockPaymentHistory = payments.filter(payment => payment.account_id === accountId);
      setAccountPaymentHistory(mockPaymentHistory);
    } catch (error) {
      console.error('Error fetching account payment history:', error);
    }
  };

  // Fetch unpaid invoices for selected account
  const fetchUnpaidInvoicesForAccount = async (accountId) => {
    try {
      // Mock unpaid invoices with late fees
      const mockUnpaidInvoices = [
        {
          id: 'inv_002',
          invoice_number: 'INV-000124',
          account_id: 'acc_001',
          total_amount: 187.25,
          due_date: '2024-03-10',
          invoice_date: '2024-02-10',
          status: 'overdue',
          lateFee: 25.00,
          days_overdue: 15
        },
        {
          id: 'inv_004',
          invoice_number: 'INV-000126', 
          account_id: 'acc_001',
          total_amount: 345.75,
          due_date: '2024-04-20',
          invoice_date: '2024-03-20',
          status: 'sent',
          lateFee: 0,
          days_overdue: 0
        },
        {
          id: 'inv_005',
          invoice_number: 'INV-000127',
          account_id: 'acc_002',
          total_amount: 125.50,
          due_date: '2024-04-15',
          invoice_date: '2024-03-15',
          status: 'sent',
          lateFee: 0,
          days_overdue: 0
        }
      ];
      
      const accountInvoices = mockUnpaidInvoices.filter(invoice => 
        invoice.account_id === accountId && invoice.status !== 'paid'
      );
      
      setUnpaidInvoicesForAccount(accountInvoices);
    } catch (error) {
      console.error('Error fetching unpaid invoices:', error);
    }
  };

  // New payment processing functions
  const handleMakePaymentForInvoice = (invoice) => {
    setSelectedInvoiceForPaymentLocal(invoice);
    setShowUniversalPayment(true);
  };

  // Simplified payment handling - no longer needed as we go direct to Universal Payment

  // Payment handling functions
  const handleInvoiceSelectionForPayment = (invoiceId, selected) => {
    setSelectedInvoicesForPayment(prev => {
      if (selected) {
        return [...prev, invoiceId];
      } else {
        return prev.filter(id => id !== invoiceId);
      }
    });
  };

  const calculateInvoiceTotalAmount = () => {
    return unpaidInvoicesForAccount
      .filter(invoice => selectedInvoicesForPayment.includes(invoice.id))
      .reduce((sum, invoice) => sum + invoice.total_amount + (invoice.lateFee || 0), 0);
  };

  // Dynamic payment amount calculation based on selected payment mode
  const getPaymentSummaryAmount = () => {
    switch (paymentMode) {
      case 'outstanding':
        return selectedAccountForPayment?.outstanding_balance || 0;
      case 'invoice':
        return calculateInvoiceTotalAmount();
      case 'other':
        return parseFloat(otherPaymentAmount) || 0;
      default:
        return selectedAccountForPayment?.outstanding_balance || 0;
    }
  };

  // Get payment mode description for summary
  const getPaymentSummaryLabel = () => {
    switch (paymentMode) {
      case 'outstanding':
        return 'Outstanding Balance';
      case 'invoice':
        const count = selectedInvoicesForPayment.length;
        return count > 0 ? `${count} Selected Invoice${count > 1 ? 's' : ''}` : 'Select Invoices';
      case 'other':
        return 'Custom Amount';
      default:
        return 'Total Due';
    }
  };

  const handlePayNow = () => {
    let totalAmount = getPaymentSummaryAmount();
    let paymentData = {};

    if (paymentMode === 'outstanding') {
      paymentData = {
        id: `payment_${selectedAccountForPayment?.id}`,
        account_id: selectedAccountForPayment?.id,
        account_name: selectedAccountForPayment?.name,
        total_amount: totalAmount,
        payment_mode: 'outstanding',
        invoice_number: `OUTSTANDING-${selectedAccountForPayment?.id}`,
        due_date: new Date().toISOString(),
        status: 'outstanding',
        payment_comment: paymentComment
      };
    } else if (paymentMode === 'invoice') {
      totalAmount = calculateInvoiceTotalAmount();
      paymentData = {
        id: `payment_invoice_${selectedAccountForPayment?.id}`,
        account_id: selectedAccountForPayment?.id,
        account_name: selectedAccountForPayment?.name,
        total_amount: totalAmount,
        payment_mode: 'invoice',
        selected_invoices: selectedInvoicesForPayment,
        invoice_details: unpaidInvoicesForAccount.filter(invoice => 
          selectedInvoicesForPayment.includes(invoice.id)
        ),
        payment_comment: paymentComment
      };
    } else if (paymentMode === 'other') {
      totalAmount = parseFloat(otherPaymentAmount) || 0;
      paymentData = {
        id: `payment_other_${selectedAccountForPayment?.id}`,
        account_id: selectedAccountForPayment?.id,
        account_name: selectedAccountForPayment?.name,
        total_amount: totalAmount,
        payment_mode: 'other',
        other_amount: totalAmount,
        payment_comment: paymentComment
      };
    }

    setSelectedInvoiceForPaymentLocal(paymentData);
    setShowUniversalPayment(true);
    setShowMakePaymentPage(false);
  };

  const closeMakePaymentPage = () => {
    setShowMakePaymentPage(false);
    setSelectedAccountForPayment(null);
    setPaymentMode('');
    setOtherPaymentAmount('');
    setPaymentComment('');
    setSelectedInvoicesForPayment([]);
    setUnpaidInvoicesForAccount([]);
  };

  // Payment Details Modal functions
  const handleViewPaymentDetails = (payment) => {
    setSelectedPaymentForDetails(payment);
    // Find related invoice if exists
    const relatedInvoice = payment.invoice_id ? invoices.find(inv => inv.id === payment.invoice_id) : null;
    setSelectedInvoiceForDetails(relatedInvoice);
    setShowPaymentDetails(true);
  };

  const handleClosePaymentDetails = () => {
    setShowPaymentDetails(false);
    setSelectedPaymentForDetails(null);
    setSelectedInvoiceForDetails(null);
  };

  // Apply filter functions
  const applyPaymentFilters = () => {
    console.log('Applying payment filters:', paymentFilters);
    setAppliedPaymentFilters({...paymentFilters});
  };

  const applySelfPaymentFilters = () => {
    console.log('Applying self payment filters:', selfPaymentFilters);
    setAppliedSelfPaymentFilters({...selfPaymentFilters});
  };

  // Clear filter functions
  const clearAllPaymentFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      paymentId: '',
      transactionId: '',
      invoiceId: '',
      status: 'all',
      accountId: '',
      profileId: '',
      profileName: ''
    };
    setPaymentFilters(clearedFilters);
    setAppliedPaymentFilters(clearedFilters);
  };

  const clearAllSelfPaymentFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      accountId: '',
      paymentId: '',
      transactionId: '',
      invoiceId: '',
      status: 'all'
    };
    setSelfPaymentFilters(clearedFilters);
    setAppliedSelfPaymentFilters(clearedFilters);
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Payment functionality - Legacy (keeping for compatibility)
  const handleLegacyMakePaymentClick = () => {
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
      fetchPayments();
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

  // Filtered payments function
  const getFilteredPayments = () => {
    let filtered = [...payments];

    // Role-based filtering
    if (user.role === 'user') {
      const userAccounts = accounts.filter(account => account.user_id === user.id);
      const userAccountIds = userAccounts.map(account => account.id);
      filtered = filtered.filter(payment => userAccountIds.includes(payment.account_id));
    }

    // Apply search and filters using appliedPaymentFilters
    filtered = filtered.filter(payment => {
      const matchesSearch = !appliedPaymentFilters.searchTerm || 
        payment.payment_number.toLowerCase().includes(appliedPaymentFilters.searchTerm.toLowerCase()) ||
        payment.amount.toString().includes(appliedPaymentFilters.searchTerm) ||
        payment.transaction_id?.toLowerCase().includes(appliedPaymentFilters.searchTerm.toLowerCase());
      
      const matchesPaymentId = !appliedPaymentFilters.paymentId || payment.id.includes(appliedPaymentFilters.paymentId);
      const matchesStatus = appliedPaymentFilters.status === 'all' || payment.status === appliedPaymentFilters.status;
      
      // Role-specific filters
      let roleFilter = true;
      if (user.role === 'admin' && appliedPaymentFilters.accountId) {
        roleFilter = payment.account_id === appliedPaymentFilters.accountId;
      } else if (user.role === 'super_admin') {
        if (appliedPaymentFilters.profileId) {
          roleFilter = payment.profile_id === appliedPaymentFilters.profileId;
        }
        if (appliedPaymentFilters.profileName) {
          const profile = getProfileInfo(payment.profile_id);
          roleFilter = roleFilter && profile?.name.toLowerCase().includes(appliedPaymentFilters.profileName.toLowerCase());
        }
      }
      
      return matchesSearch && matchesPaymentId && matchesStatus && roleFilter;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      const direction = sorting.direction === 'asc' ? 1 : -1;
      
      switch (sorting.field) {
        case 'payment_number':
          return direction * a.payment_number.localeCompare(b.payment_number);
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'payment_date':
          return direction * (new Date(a.payment_date) - new Date(b.payment_date));
        case 'created_at':
        default:
          return direction * (new Date(a.created_at) - new Date(b.created_at));
      }
    });
  };

  // Get paginated payments for user payments tab
  const getPaginatedPayments = () => {
    const filtered = getFilteredPayments();
    const totalItems = filtered.length;
    const pages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(pages);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedPaymentFilters]);

  // Only allow admin and super admin to access this component
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V7a4 4 0 0 1 8 0v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Access Restricted</h3>
          <p className="text-slate-600">Only administrators have access to payment management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Compact Header with Inline Tabs */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-800">Payment Management</h2>
          
          {/* Inline Tab Navigation */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('self-payments')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'self-payments'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              data-testid="self-payments-tab"
            >
              Self Payments
            </button>
            <button
              onClick={() => setActiveTab('user-payments')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'user-payments'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              data-testid="user-payments-tab"
            >
              User Payments
            </button>
          </div>
        </div>
        
        {/* Outstanding Balance - Show for self-payments */}
        {activeTab === 'self-payments' && (
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Outstanding Balance</div>
            <div className={`text-lg font-bold ${
              outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${outstandingBalance.toFixed(2)}
            </div>
          </div>
        )}
      </div>
      {/* Tab Content */}
      {activeTab === 'self-payments' ? (
        // Self Payments Tab Content
        <div className="space-y-4">
          {/* Compact Account Selection */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-md font-semibold text-slate-800 mb-3">Accounts</h4>
            
            <div className="flex items-center space-x-4">
              {/* Account Selector */}
              <div className="w-80">
                <select
                  value={selectedAccountForView}
                  onChange={(e) => handleAccountSelectionForView(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  data-testid="account-selection-dropdown"
                >
                  <option value="">Select Account...</option>
                  {userAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - ${account.outstanding_balance.toFixed(2)} outstanding
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Balance & Pay Button */}
              {selectedAccountDetails && selectedAccountDetails.outstanding_balance > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Balance</div>
                    <div className="font-bold text-red-600">${selectedAccountDetails.outstanding_balance.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => {
                      // Open Make Payment page
                      setSelectedAccountForPayment(selectedAccountDetails);
                      fetchUnpaidInvoicesForAccount(selectedAccountForView);
                      setShowMakePaymentPage(true);
                      setPaymentMode('');
                      setOtherPaymentAmount('');
                      setPaymentComment('');
                      setSelectedInvoicesForPayment([]);
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    data-testid="make-payment-button"
                  >
                    Make Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Self Payment Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-800">Search & Filter Self Payments</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applySelfPaymentFilters}
                  className="px-3 py-1 text-xs font-medium bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors"
                  data-testid="apply-self-payment-filters"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowAdvancedSelfPaymentFilters(!showAdvancedSelfPaymentFilters)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    showAdvancedSelfPaymentFilters
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid="toggle-advanced-self-payment-search"
                >
                  {showAdvancedSelfPaymentFilters ? 'Simple' : 'Advanced'}
                </button>
                <button
                  onClick={clearAllSelfPaymentFilters}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                  data-testid="clear-all-self-payment-filters"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Always Visible - First 3 Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              {/* General Search */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Invoice number, amount..."
                  value={selfPaymentFilters.searchTerm}
                  onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, searchTerm: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="self-payment-search"
                />
              </div>
              
              {/* Account Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account</label>
                <select
                  value={selfPaymentFilters.accountId}
                  onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, accountId: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="self-account-filter"
                >
                  <option value="">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={selfPaymentFilters.status}
                  onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, status: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="self-status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="sent">Sent</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters (conditionally visible) */}
            {showAdvancedSelfPaymentFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                {/* Payment ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment ID</label>
                  <input
                    type="text"
                    placeholder="Enter payment ID"
                    value={selfPaymentFilters.paymentId}
                    onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, paymentId: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="self-payment-id-filter"
                  />
                </div>
                
                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    value={selfPaymentFilters.transactionId}
                    onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, transactionId: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="self-transaction-id-filter"
                  />
                </div>
                
                {/* Invoice ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Invoice ID</label>
                  <input
                    type="text"
                    placeholder="Enter invoice ID"
                    value={selfPaymentFilters.invoiceId}
                    onChange={(e) => setSelfPaymentFilters({...selfPaymentFilters, invoiceId: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="self-invoice-id-filter"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invoices Table - Single Page */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">My Invoices</h3>
              <p className="text-sm text-slate-600">Manage and pay your invoices with detailed information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices
                    .filter(invoice => {
                      // Apply self payment filters
                      const matchesSearch = !appliedSelfPaymentFilters.searchTerm || 
                        invoice.invoice_number.toLowerCase().includes(appliedSelfPaymentFilters.searchTerm.toLowerCase()) ||
                        invoice.total_amount.toString().includes(appliedSelfPaymentFilters.searchTerm);
                      
                      const matchesAccount = !appliedSelfPaymentFilters.accountId || invoice.account_id === appliedSelfPaymentFilters.accountId;
                      const matchesStatus = appliedSelfPaymentFilters.status === 'all' || invoice.status === appliedSelfPaymentFilters.status;
                      const matchesPaymentId = !appliedSelfPaymentFilters.paymentId || invoice.id.includes(appliedSelfPaymentFilters.paymentId);
                      const matchesInvoiceId = !appliedSelfPaymentFilters.invoiceId || invoice.id.includes(appliedSelfPaymentFilters.invoiceId);
                      
                      return matchesSearch && matchesAccount && matchesStatus && matchesPaymentId && matchesInvoiceId;
                    })
                    .map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-800">{invoice.invoice_number}</div>
                          <div className="text-sm text-slate-600">Account: {getAccountInfo(invoice.account_id)?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Created: {new Date(invoice.created_at).toLocaleDateString()}
                          </div>
                          {invoice.items && (
                            <div className="text-xs text-slate-500 mt-1">
                              Items: {invoice.items.length} • First: {invoice.items[0]?.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">${invoice.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                        {new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
                          <div className="text-xs text-red-500 font-medium mt-1">
                            {Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {invoice.status !== 'paid' ? (
                            <button
                              onClick={() => {
                                // Open Make Payment page for this specific invoice
                                const accountDetails = getAccountInfo(invoice.account_id);
                                setSelectedAccountForPayment(accountDetails);
                                setShowMakePaymentPage(true);
                                setPaymentMode('invoice');
                                setSelectedInvoicesForPayment([invoice.id]);
                                setOtherPaymentAmount('');
                                setPaymentComment('');
                                fetchUnpaidInvoicesForAccount(invoice.account_id);
                              }}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              data-testid={`make-payment-${invoice.id}`}
                            >
                              Make Payment
                            </button>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">Paid</span>
                          )}
                          <button
                            onClick={() => {
                              // Create a mock payment object for this invoice if it doesn't exist
                              const relatedPayment = payments.find(p => p.invoice_id === invoice.id);
                              if (relatedPayment) {
                                handleViewPaymentDetails(relatedPayment);
                              } else {
                                // Create mock payment for invoice details
                                const mockPayment = {
                                  id: `mock_pay_${invoice.id}`,
                                  payment_number: `PAY-${invoice.invoice_number.replace('INV-', '')}`,
                                  invoice_id: invoice.id,
                                  account_id: invoice.account_id,
                                  profile_id: invoice.profile_id,
                                  amount: invoice.total_amount,
                                  payment_method: 'N/A',
                                  status: invoice.status === 'paid' ? 'completed' : 'pending',
                                  transaction_id: `TXN-${Date.now()}`,
                                  payment_date: new Date(),
                                  created_at: new Date(),
                                  notes: `Invoice ${invoice.invoice_number} details`
                                };
                                setSelectedPaymentForDetails(mockPayment);
                                setSelectedInvoiceForDetails(invoice);
                                setShowPaymentDetails(true);
                              }
                            }}
                            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                            data-testid={`view-payment-details-${invoice.id}`}
                          >
                            View Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No invoices found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // User Payments Tab Content  
        <div className="space-y-4">
          {/* Enhanced Payment Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-800">Search & Filter Payments</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applyPaymentFilters}
                  className="px-3 py-1 text-xs font-medium bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors"
                  data-testid="apply-payment-filters"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowAdvancedPaymentFilters(!showAdvancedPaymentFilters)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    showAdvancedPaymentFilters
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid="toggle-advanced-payment-search"
                >
                  {showAdvancedPaymentFilters ? 'Simple' : 'Advanced'}
                </button>
                <button
                  onClick={clearAllPaymentFilters}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                  data-testid="clear-all-payment-filters"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Always Visible - First 3 Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              {/* General Search */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Payment number, transaction ID..."
                  value={paymentFilters.searchTerm}
                  onChange={(e) => setPaymentFilters({...paymentFilters, searchTerm: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="payment-search"
                />
              </div>
              
              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={paymentFilters.transactionId}
                  onChange={(e) => setPaymentFilters({...paymentFilters, transactionId: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="transaction-id-filter"
                />
              </div>
              
              {/* Invoice ID */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Invoice ID</label>
                <input
                  type="text"
                  placeholder="Enter invoice ID"
                  value={paymentFilters.invoiceId}
                  onChange={(e) => setPaymentFilters({...paymentFilters, invoiceId: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  data-testid="invoice-id-filter"
                />
              </div>
            </div>

            {/* Advanced Filters (conditionally visible) */}
            {showAdvancedPaymentFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={paymentFilters.status}
                    onChange={(e) => setPaymentFilters({...paymentFilters, status: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="payment-status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                {/* Account Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Account</label>
                  <select
                    value={paymentFilters.accountId}
                    onChange={(e) => setPaymentFilters({...paymentFilters, accountId: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="account-filter"
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                {/* Profile Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Profile</label>
                  <select
                    value={paymentFilters.profileId}
                    onChange={(e) => setPaymentFilters({...paymentFilters, profileId: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    data-testid="profile-filter"
                  >
                    <option value="">All Profiles</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>{profile.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          {/* User Payments Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">User Payments</h3>
              <p className="text-sm text-slate-600">All payments made by users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('payment_date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Payment Date</span>
                        {sorting.field === 'payment_date' && (
                          <svg className={`w-3 h-3 transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {getPaginatedPayments().map((payment) => {
                    const accountInfo = getAccountInfo(payment.account_id);
                    const profileInfo = getProfileInfo(payment.profile_id);
                    
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <div className="text-sm">
                            <div className="font-medium text-slate-800">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </div>
                            <div className="text-slate-500">
                              {new Date(payment.payment_date).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-mono text-slate-800">
                            {payment.payment_number || payment.id}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-mono text-slate-600">
                            {payment.transaction_id || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-mono text-slate-600">
                            {payment.invoice_id || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-base font-semibold text-slate-900">
                            ${payment.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-600">
                            {payment.payment_method}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {accountInfo ? (
                            <div className="text-base">
                              <div className="text-slate-900 font-medium">{accountInfo.name}</div>
                              {profileInfo && (
                                <div className="text-slate-600 text-sm">{profileInfo.name}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No account info</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => handleViewPaymentDetails(payment)}
                              className="text-blue-600 hover:text-blue-900 font-medium text-sm transition-colors" 
                              data-testid={`view-payment-${payment.id}`}
                            >
                              View Payment
                            </button>
                            <button className="text-emerald-600 hover:text-emerald-900 font-medium text-sm transition-colors" data-testid={`download-receipt-${payment.id}`}>
                              Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredPayments().length)} of {getFilteredPayments().length} payments
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Items per page selector */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    
                    {/* Pagination buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm border rounded ${
                              currentPage === pageNum
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        {/* Universal Payment Modal */}
        <UniversalPaymentModal
          invoice={selectedInvoiceForPaymentLocal}
          isOpen={showUniversalPayment}
          onClose={() => {
            setShowUniversalPayment(false);
            setSelectedInvoiceForPaymentLocal(null);
          }}
          onPaymentSuccess={(paymentData) => {
            console.log('Payment successful:', paymentData);
            fetchPayments();
            fetchInvoices();
            calculateOutstandingBalance();
          }}
        />

        {/* Enhanced Payment Details Modal */}
        {showPaymentDetails && selectedPaymentForDetails && (
          <EnhancedPaymentDetails
            payment={selectedPaymentForDetails}
            invoice={selectedInvoiceForDetails}
            onClose={handleClosePaymentDetails}
            onPayNow={selectedInvoiceForDetails && selectedInvoiceForDetails.status !== 'paid' ? () => handleMakePaymentForInvoice(selectedInvoiceForDetails) : null}
          />
        )}

        {/* Invoice Details Modal */}
        {showInvoiceDetailsModal && selectedInvoiceForDetailsModal && (
          <EnhancedInvoiceDetails 
            invoice={selectedInvoiceForDetailsModal}
            onClose={() => {
              setShowInvoiceDetailsModal(false);
              setSelectedInvoiceForDetailsModal(null);
            }}
            onPayNow={(invoice) => handleMakePaymentForInvoice(invoice)}
            showPaymentAction={false} // Don't show pay now in this modal since we're already in payment flow
          />
        )}

        {/* Unpaid Invoices Selection Modal */}
        {showUnpaidInvoicesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-45 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800">Select Invoices to Pay</h3>
                  <button
                    onClick={() => setShowUnpaidInvoicesModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    data-testid="close-unpaid-invoices-modal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-96">
                {unpaidInvoicesForAccount.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium text-slate-600">
                        {unpaidInvoicesForAccount.length} unpaid invoice(s) found
                      </span>
                      <button
                        onClick={handleSelectAllInvoices}
                        className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                      >
                        Select All
                      </button>
                    </div>
                    
                    {unpaidInvoicesForAccount.map((invoice) => (
                      <div
                        key={invoice.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedInvoicesForPayment.includes(invoice.id)
                            ? 'border-slate-400 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedInvoicesForPayment.includes(invoice.id)}
                              onChange={(e) => handleInvoiceSelectionForPayment(invoice.id, e.target.checked)}
                              className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                            />
                            <div>
                              <div className="text-sm font-medium text-slate-800">{invoice.invoice_number}</div>
                              <div className="text-xs text-slate-500">
                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                {invoice.days_overdue > 0 && (
                                  <span className="ml-2 text-red-600">({invoice.days_overdue} days overdue)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-800">${invoice.total_amount.toFixed(2)}</div>
                              {invoice.lateFee > 0 && (
                                <div className="text-xs text-red-600">+${invoice.lateFee.toFixed(2)} late fee</div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceForDetailsModal({
                                  ...invoice,
                                  account_name: userAccounts.find(acc => acc.id === selectedAccountForPayment)?.name || 'Unknown',
                                  status: invoice.status || (invoice.days_overdue > 0 ? 'overdue' : 'sent'),
                                  items: [
                                    { description: 'Service charges', amount: invoice.total_amount - (invoice.lateFee || 0), quantity: 1 },
                                    ...(invoice.lateFee > 0 ? [{ description: 'Late fee', amount: invoice.lateFee, quantity: 1 }] : [])
                                  ]
                                });
                                setShowInvoiceDetailsModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                              data-testid={`view-invoice-details-${invoice.id}`}
                              title="View Invoice Details"
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
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No unpaid invoices found for this account
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-600">
                    {selectedInvoicesForPayment.length} invoice(s) selected
                  </div>
                  <button
                    onClick={() => setShowUnpaidInvoicesModal(false)}
                    className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                    disabled={selectedInvoicesForPayment.length === 0}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details Modal */}
        {showInvoiceDetailsModal && selectedInvoiceForDetailsModal && (
          <EnhancedInvoiceDetails 
            invoice={selectedInvoiceForDetailsModal}
            onClose={() => {
              setShowInvoiceDetailsModal(false);
              setSelectedInvoiceForDetailsModal(null);
            }}
            showPaymentAction={false}
          />
        )}

        {/* Invoice Selection Modal */}
        {showUnpaidInvoicesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Select Invoice</h3>
                  <p className="text-emerald-100 text-sm">Choose an invoice to pay</p>
                </div>
                <button
                  onClick={() => setShowUnpaidInvoicesModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="close-invoice-modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {unpaidInvoicesForAccount.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No unpaid invoices found for this account</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unpaidInvoicesForAccount.map((invoice) => (
                      <div
                        key={invoice.id}
                        onClick={() => {
                          setSelectedInvoicesForPayment([invoice.id]);
                          setPaymentMode('invoice');
                          setOtherPaymentAmount('');
                          setShowUnpaidInvoicesModal(false);
                        }}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        data-testid={`select-invoice-${invoice.id}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-slate-800">{invoice.invoice_number}</div>
                            <div className="text-sm text-slate-600">
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </div>
                            {invoice.days_overdue > 0 && (
                              <div className="text-xs text-red-500 font-medium">
                                {invoice.days_overdue} days overdue
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-slate-800">
                                ${invoice.total_amount.toFixed(2)}
                              </div>
                              {invoice.lateFee > 0 && (
                                <div className="text-xs text-red-600">
                                  +${invoice.lateFee.toFixed(2)} late fee
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle invoice details view
                                console.log('View invoice details:', invoice.id);
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              data-testid={`view-invoice-details-${invoice.id}`}
                              title="View Invoice Details"
                            >
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* Restructured Make Payment Page */}
        {showMakePaymentPage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200">
              {/* Metallic Header */}
              <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 text-white p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Back Arrow Button */}
                    <button
                      onClick={closeMakePaymentPage}
                      className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 flex items-center space-x-1"
                      data-testid="back-to-payments"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="border-l border-white/30 h-6"></div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight">Make Payment</h1>
                      <p className="text-slate-200 text-sm font-medium">{selectedAccountForPayment?.name}</p>
                    </div>
                  </div>
                  {/* Close Button */}
                  <button
                    onClick={closeMakePaymentPage}
                    className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                    data-testid="close-make-payment-page"
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
                      onClick={() => setPaymentMode('outstanding')}
                      className={`w-full p-5 border-2 rounded-xl text-left transition-all duration-300 ${
                        paymentMode === 'outstanding'
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
                      data-testid="outstanding-amount-option"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-base font-semibold text-slate-800">
                            Pay Full Outstanding Balance - ${selectedAccountForPayment?.outstanding_balance?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">Clear all outstanding dues at once</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs text-emerald-700 font-medium">Recommended Option</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            ${selectedAccountForPayment?.outstanding_balance?.toFixed(2) || '0.00'}
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
                      paymentMode === 'invoice' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200'
                    }`}>
                      <button
                        onClick={() => {
                          setPaymentMode('invoice');
                          fetchUnpaidInvoicesForAccount(selectedAccountForPayment?.id);
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
                      
                      {paymentMode === 'invoice' && (
                        <div className="border-t-2 border-blue-200 p-4">
                          {unpaidInvoicesForAccount.length > 0 ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {unpaidInvoicesForAccount.map((invoice) => (
                                <div key={invoice.id} 
                                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedInvoicesForPayment.includes(invoice.id) 
                                      ? 'border-blue-400 bg-blue-50' 
                                      : 'border-slate-200 bg-white hover:border-blue-300'
                                  }`}
                                  onClick={() => {
                                    handleInvoiceSelectionForPayment(invoice.id, !selectedInvoicesForPayment.includes(invoice.id));
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedInvoicesForPayment.includes(invoice.id)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleInvoiceSelectionForPayment(invoice.id, e.target.checked);
                                        }}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                                      />
                                      <div>
                                        <div className="font-bold text-slate-800">{invoice.invoice_number}</div>
                                        <div className="text-sm text-slate-600">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <div className="font-bold text-slate-800">${invoice.total_amount.toFixed(2)}</div>
                                        {invoice.lateFee > 0 && (
                                          <div className="text-sm text-red-600">+${invoice.lateFee.toFixed(2)} late fee</div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInvoiceForDetailsModal({
                                            ...invoice,
                                            account_name: selectedAccountForPayment?.name || 'Unknown',
                                            status: invoice.status || (invoice.days_overdue > 0 ? 'overdue' : 'sent'),
                                            items: [
                                              { description: 'Service charges', amount: invoice.total_amount - (invoice.lateFee || 0), quantity: 1 },
                                              ...(invoice.lateFee > 0 ? [{ description: 'Late fee', amount: invoice.lateFee, quantity: 1 }] : [])
                                            ]
                                          });
                                          setShowInvoiceDetailsModal(true);
                                        }}
                                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                                        data-testid={`view-invoice-details-${invoice.id}`}
                                        title="View Invoice Details"
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
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-slate-500">No unpaid invoices found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spacer to maintain layout */}
                </div>
                
                {/* Right Column - Other Amount, Comment, Payment Summary */}
                <div className="w-96 bg-slate-50 border-l border-slate-200 p-4 space-y-4">
                  {/* Other Amount */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-800">Other Amount</h3>
                    <div className={`border-2 rounded-lg transition-all duration-300 ${
                      paymentMode === 'other' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-slate-200 bg-white'
                    }`}>
                      <button
                        onClick={() => setPaymentMode('other')}
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
                      
                      {paymentMode === 'other' && (
                        <div className="border-t border-purple-200 p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={otherPaymentAmount}
                                onChange={(e) => setOtherPaymentAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm font-semibold text-slate-800 bg-white"
                                placeholder="0"
                                data-testid="custom-amount-input"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="text-lg font-bold text-purple-600">$</span>
                            </div>
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
                      value={paymentComment}
                      onChange={(e) => setPaymentComment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white placeholder-slate-400 resize-none"
                      rows={2}
                      placeholder="Add a note for this payment..."
                      data-testid="payment-comment"
                    />
                  </div>

                  {/* Payment Summary */}
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-slate-800">Payment Summary</h4>
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                      <div className="text-center">
                        <div className="text-xs text-slate-600 mb-1">{getPaymentSummaryLabel()}</div>
                        <div className={`text-2xl font-bold ${
                          paymentMode 
                            ? 'text-emerald-600' 
                            : 'text-slate-400'
                        }`}>
                          ${getPaymentSummaryAmount().toFixed(2)}
                        </div>
                        {paymentMode === 'invoice' && selectedInvoicesForPayment.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1">
                            Including late fees
                          </div>
                        )}
                        {paymentMode === 'outstanding' && (
                          <div className="text-xs text-slate-500 mt-1">
                            Including all dues & late fees
                          </div>
                        )}
                        {!paymentMode && (
                          <div className="text-xs text-slate-400 mt-1">
                            Select payment option above
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pay Now Button */}
                  <button
                    onClick={handlePayNow}
                    disabled={!paymentMode || (paymentMode === 'invoice' && selectedInvoicesForPayment.length === 0) || (paymentMode === 'other' && (!otherPaymentAmount || parseFloat(otherPaymentAmount) <= 0))}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      !paymentMode || (paymentMode === 'invoice' && selectedInvoicesForPayment.length === 0) || (paymentMode === 'other' && (!otherPaymentAmount || parseFloat(otherPaymentAmount) <= 0))
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
    </div>
  );
};

export default PaymentManagement;