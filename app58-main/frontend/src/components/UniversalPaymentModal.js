import React, { useState } from 'react';

const UniversalPaymentModal = ({ 
  invoice, 
  isOpen, 
  onClose, 
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(
    invoice ? 
      (invoice.total_amount || 0) + (invoice.late_fees || 0) : 
      0
  );
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [verifiedUpiName, setVerifiedUpiName] = useState('');
  const [showUpiVerification, setShowUpiVerification] = useState(false);
  const [paymentComment, setPaymentComment] = useState('');
  
  // Enhanced Payment Flow States
  const [paymentStatus, setPaymentStatus] = useState('form'); // 'form', 'initiated', 'processing', 'success', 'failed'
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentStartTime, setPaymentStartTime] = useState(null);
  
  // Card Payment States
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  if (!isOpen || !invoice) return null;

  const handleUpiVerification = async () => {
    if (!upiId) return;
    
    setShowUpiVerification(true);
    // Mock UPI verification
    setTimeout(() => {
      setVerifiedUpiName('John Doe'); // Mock verified name
      setShowUpiVerification(false);
    }, 1500);
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      setPaymentStartTime(new Date());
      
      // Generate Order ID and Transaction ID
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const newTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      setOrderId(newOrderId);
      setTransactionId(newTransactionId);
      
      // Payment Initiated
      setPaymentStatus('initiated');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Payment Processing
      setPaymentStatus('processing');
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock payment result (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        
        // Call success callback after a brief delay
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess({
              invoice_id: invoice.id,
              selected_invoices: invoice.selected_invoices || [invoice.id],
              payment_mode: invoice.payment_mode || 'invoice',
              amount: paymentAmount,
              method: paymentMethod,
              order_id: newOrderId,
              transaction_id: newTransactionId,
              late_fees: invoice.late_fees || 0
            });
          }
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            handleClose();
          }, 3000);
        }, 1000);
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Payment failed due to insufficient funds or network error. Please try again.');
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('failed');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = () => {
    setPaymentStatus('form');
    setErrorMessage('');
    setOrderId('');
    setTransactionId('');
  };

  const handleClose = () => {
    // Reset form
    setPaymentMethod('');
    setPaymentAmount(
      invoice ? 
        (invoice.total_amount || 0) + (invoice.late_fees || 0) : 
        0
    );
    setUpiId('');
    setVerifiedUpiName('');
    setPaymentComment('');
    setPaymentStatus('form');
    setOrderId('');
    setTransactionId('');
    setErrorMessage('');
    setCardDetails({
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    });
    
    onClose();
  };

  // Payment Status Flow Component
  const renderPaymentFlow = () => {
    if (paymentStatus === 'initiated') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-2">Payment Initiated</h3>
          <p className="text-slate-600 mb-4">Please wait while we process your payment...</p>
          <div className="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Order ID:</span> {orderId}</div>
              <div><span className="font-medium">Amount:</span> ${paymentAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'processing') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-orange-600 mb-2">Processing Payment</h3>
          <p className="text-slate-600 mb-4">Secure transaction in progress...</p>
          <div className="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Order ID:</span> {orderId}</div>
              <div><span className="font-medium">Transaction ID:</span> {transactionId}</div>
              <div><span className="font-medium">Amount:</span> ${paymentAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-600 mb-2">Payment Completed!</h3>
          <p className="text-slate-600 mb-4">Your payment has been processed successfully</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span> 
                <span className="text-green-700 font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Transaction ID:</span> 
                <span className="text-green-700 font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span> 
                <span className="text-green-700 font-bold">${paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span> 
                <span className="text-green-700 capitalize">{paymentMethod}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">This modal will close automatically...</p>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h3>
          <p className="text-slate-600 mb-4">{errorMessage}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm mx-auto mb-6">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Order ID:</span> {orderId}</div>
              {transactionId && <div><span className="font-medium">Transaction ID:</span> {transactionId}</div>}
              <div><span className="font-medium">Amount:</span> ${paymentAmount.toFixed(2)}</div>
              <div><span className="font-medium">Status:</span> <span className="text-red-600 font-medium">Failed</span></div>
            </div>
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={retryPayment}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              Retry Payment
            </button>
          </div>
        </div>
      );
    }

    // Default form view
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[70] p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden border border-slate-200">
        {/* Header - Same style as Invoice Details */}
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
                <h3 className="text-xl font-bold mb-1">Universal Payment</h3>
                <div className="text-slate-200 text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {invoice.payment_mode === 'other' ? 'Account Payment' :
                       invoice.selected_invoices && invoice.selected_invoices.length > 1 ? 
                         `${invoice.selected_invoices.length} Invoices` :
                         (invoice.invoice_number || 'Payment')
                      }
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs">Amount: ${paymentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons in Header */}
            <div className="flex items-center space-x-2">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                data-testid="close-universal-payment-modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 p-4 overflow-y-auto">

            {/* Show Payment Flow or Form */}
            {paymentStatus !== 'form' ? renderPaymentFlow() : (
              <div className="space-y-4">
                {/* Enhanced Invoice Details - Compact */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Payment Information</h4>
                  </div>
                  
                  {/* Display payment details based on payment mode */}
                  {invoice.payment_mode === 'other' ? (
                    /* Other Amount Payment */
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-slate-500 text-xs font-medium block">Custom Payment Amount</span>
                        <span className="font-bold text-emerald-600 text-lg">${invoice.other_amount.toFixed(2)}</span>
                      </div>
                      <div className="text-center text-xs text-slate-600">
                        Account payment - custom amount
                      </div>
                    </div>
                  ) : invoice.selected_invoices && invoice.selected_invoices.length > 1 ? (
                    /* Multiple Invoices Payment */
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <span className="text-slate-500 text-xs font-medium block">Invoices Selected</span>
                          <span className="font-semibold text-slate-800 text-sm">{invoice.selected_invoices.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs font-medium block">Invoice Amount</span>
                          <span className="font-semibold text-emerald-600 text-sm">${(invoice.total_amount - (invoice.late_fees || 0)).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs font-medium block">Late Fees</span>
                          <span className="font-semibold text-red-600 text-sm">${(invoice.late_fees || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Show selected invoices list if available */}
                      {invoice.invoice_details && invoice.invoice_details.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-slate-200 max-h-32 overflow-y-auto">
                          <div className="text-xs font-medium text-slate-700 mb-2">Selected Invoices:</div>
                          {invoice.invoice_details.map((inv, index) => (
                            <div key={index} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                              <span className="text-slate-600">{inv.invoice_number}</span>
                              <span className="font-medium">${inv.total_amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Single Invoice Payment */
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-slate-500 text-xs font-medium block">Invoice Number</span>
                        <span className="font-semibold text-slate-800 text-sm">{invoice.invoice_number || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium block">Due Date</span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium block">Invoice Amount</span>
                        <span className="font-semibold text-emerald-600 text-sm">${((invoice.total_amount || 0) - (invoice.late_fees || 0)).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium block">Late Fee</span>
                        <span className="font-semibold text-red-600 text-sm">${(invoice.late_fees || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Payment Amount - Compact */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-emerald-800">Total Payment Amount</h4>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-4 py-2 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-center bg-white"
                      data-testid="universal-payment-amount-input"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-emerald-700 mt-2 text-center font-medium">Invoice Amount + Late Fee = Total Due</p>
                </div>

                {/* Enhanced Payment Method Selection - Compact */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-md'
                          : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
                      }`}
                      data-testid="universal-payment-method-upi"
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm font-bold">₹</span>
                      </div>
                      <span className="text-xs font-semibold">UPI Payment</span>
                      <p className="text-xs mt-1 text-slate-600">Fast & Secure</p>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-md'
                          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      data-testid="universal-payment-method-card"
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">Credit/Debit Card</span>
                      <p className="text-xs mt-1 text-slate-600">Visa, Master, RuPay</p>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-md'
                          : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                      data-testid="universal-payment-method-wallet"
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">Digital Wallet</span>
                      <p className="text-xs mt-1 text-slate-600">PayTM, PhonePe & More</p>
                    </button>
                  </div>
                </div>

                {/* Enhanced UPI Payment Form - Compact */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3 border-2 border-orange-200 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <h5 className="font-semibold text-orange-800 text-sm flex items-center">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-orange-600 font-bold text-xs">₹</span>
                      </div>
                      UPI Payment Details
                    </h5>
                    
                    <div>
                      <label className="block text-xs font-semibold text-orange-700 mb-2">Enter your UPI ID</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder={`${invoice.account_name?.split(' ')[0]?.toLowerCase() || 'user'}@paytm`}
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-white"
                          data-testid="universal-upi-id-input"
                        />
                        <button
                          onClick={handleUpiVerification}
                          disabled={!upiId || showUpiVerification}
                          className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold text-xs"
                          data-testid="universal-verify-upi-button"
                        >
                          {showUpiVerification ? 'Verifying...' : 'Verify UPI'}
                        </button>
                      </div>
                    </div>

                    {verifiedUpiName && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <span className="text-green-800 font-bold text-sm">Verified!</span>
                            <p className="text-green-700 text-xs">Account Holder: {verifiedUpiName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Card Payment Form - Compact */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h5 className="font-bold text-blue-800 text-sm flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      Card Payment Details
                    </h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-blue-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-white"
                          data-testid="universal-card-number-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-blue-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder={invoice.account_name || "JOHN DOE"}
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm uppercase bg-white"
                          data-testid="universal-card-name-input"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-blue-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-white"
                            data-testid="universal-card-expiry-input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-blue-700 mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength="3"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-white"
                            data-testid="universal-card-cvv-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Wallet Payment Form - Compact */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-4 border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                    <h5 className="font-bold text-purple-800 text-sm flex items-center">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      Select Digital Wallet
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'PayTM', color: 'bg-blue-500', logo: '₹' },
                        { name: 'PhonePe', color: 'bg-purple-600', logo: 'Pe' },
                        { name: 'Google Pay', color: 'bg-green-500', logo: 'G' },
                        { name: 'Amazon Pay', color: 'bg-orange-500', logo: 'A' }
                      ].map((wallet) => (
                        <button
                          key={wallet.name}
                          className="p-3 border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-100 transition-all text-center"
                          data-testid={`universal-wallet-${wallet.name.toLowerCase().replace(' ', '-')}`}
                        >
                          <div className={`w-8 h-8 ${wallet.color} rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm`}>
                            {wallet.logo}
                          </div>
                          <span className="text-xs font-bold text-purple-800">{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Comment Field - Compact */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                    </svg>
                    Payment Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder={`Payment for ${invoice.invoice_number} - ${invoice.account_name || 'Account'}`}
                    value={paymentComment}
                    onChange={(e) => setPaymentComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 resize-none bg-white text-sm"
                    data-testid="universal-payment-comment"
                  />
                </div>

                {/* Enhanced Action Buttons - Compact */}
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all font-medium text-sm"
                    data-testid="universal-cancel-payment"
                  >
                    Cancel Payment
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={!paymentMethod || loading || (paymentMethod === 'upi' && !verifiedUpiName) || (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv))}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                      !paymentMethod || loading || (paymentMethod === 'upi' && !verifiedUpiName) || (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv))
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                    }`}
                    data-testid="universal-process-payment"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Process to Pay</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Same as Invoice Details */}
          <div className="w-80 bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 flex flex-col h-full">
            <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Payment Summary
              </h4>
              
              {/* Amount Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Amount Breakdown</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Invoice Amount:</span>
                      <span className="font-semibold text-slate-800">${invoice.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Late Fee:</span>
                      <span className="font-semibold text-red-600">${((invoice.days_overdue || 0) * 2.5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-slate-600 font-medium">Total Due:</span>
                      <span className="font-semibold text-emerald-600">${paymentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Payment Amount:</span>
                    <span className="text-xl font-bold">${paymentAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Security Features</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center text-green-600">
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Fraud Protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalPaymentModal;