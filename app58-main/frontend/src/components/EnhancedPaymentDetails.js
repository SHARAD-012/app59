import React, { useState } from 'react';

const EnhancedPaymentDetails = ({ 
  payment, 
  invoice,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('payment-info');

  if (!payment) return null;

  // Mock enhanced payment data - in real app this would come from backend
  const getEnhancedPaymentData = () => {
    return {
      ...payment,
      payment_details: {
        gateway_provider: 'Razorpay',
        gateway_transaction_id: `RZP_${payment.transaction_id}`,
        processing_fee: 2.50,
        convenience_fee: 1.00,
        net_amount: payment.amount - 3.50,
        payment_gateway_response: 'SUCCESS',
        authorization_code: 'AUTH123456',
        merchant_reference: `MERCH_${payment.id}_001`,
        currency: 'USD',
        exchange_rate: 1.00,
        settlement_date: new Date(new Date(payment.payment_date).getTime() + 2 * 24 * 60 * 60 * 1000),
        settlement_status: 'settled',
        refund_status: 'eligible',
        dispute_status: 'none'
      },
      bank_details: {
        bank_name: 'Chase Bank',
        account_number: '****1234',
        routing_number: '021000021',
        swift_code: 'CHASUS33',
        account_type: 'Checking',
        account_holder: payment.account_name || 'Account Holder'
      },
      verification_details: {
        kyc_status: 'verified',
        risk_score: 'low',
        fraud_check: 'passed',
        compliance_status: 'approved',
        verification_method: '2FA + SMS',
        ip_address: '192.168.1.100',
        device_fingerprint: 'DEV_FP_123456',
        geolocation: 'San Francisco, CA, USA'
      }
    };
  };

  const enhancedPayment = getEnhancedPaymentData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
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
                <h3 className="text-xl font-bold mb-1">Payment Details</h3>
                <div className="text-slate-200 text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{payment.payment_number || payment.id}</span>
                    <span className="text-slate-300">|</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs">Amount: ${payment.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons in Header */}
            <div className="flex items-center space-x-2">
              {/* Download Receipt */}
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors shadow-sm flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Receipt</span>
              </button>
              
              {/* Print Button */}
              <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors shadow-sm flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1z" />
                </svg>
                <span>Print</span>
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                data-testid="close-payment-details"
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
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 max-w-md">
              <button
                onClick={() => setActiveTab('payment-info')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'payment-info'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Payment Info
              </button>
              <button
                onClick={() => setActiveTab('transaction-details')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'transaction-details'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Transaction Details
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'verification'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Verification
              </button>
            </div>

            {/* Payment Information Tab */}
            {activeTab === 'payment-info' && (
              <div className="space-y-4">
                {/* Payment & Account Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Payment Information</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Payment ID:</span>
                        <span className="font-bold text-slate-800">{payment.payment_number || payment.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Payment Date:</span>
                        <span className="font-semibold text-slate-800">{new Date(payment.payment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Payment Method:</span>
                        <span className="font-semibold text-slate-800">{payment.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Currency:</span>
                        <span className="font-semibold text-slate-800">{enhancedPayment.payment_details.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-blue-800">Transaction Details</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Transaction ID:</span>
                        <span className="font-bold text-slate-800">{payment.transaction_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Gateway Provider:</span>
                        <span className="font-semibold text-slate-800">{enhancedPayment.payment_details.gateway_provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Authorization:</span>
                        <span className="font-semibold text-slate-800">{enhancedPayment.payment_details.authorization_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Merchant Ref:</span>
                        <span className="font-mono text-xs text-slate-800">{enhancedPayment.payment_details.merchant_reference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-emerald-800">Amount Details</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Gross Amount:</span>
                        <span className="font-bold text-emerald-700">${payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Processing Fee:</span>
                        <span className="font-semibold text-slate-800">-${enhancedPayment.payment_details.processing_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Convenience Fee:</span>
                        <span className="font-semibold text-slate-800">-${enhancedPayment.payment_details.convenience_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-slate-600 font-medium">Net Amount:</span>
                        <span className="font-bold text-emerald-700">${enhancedPayment.payment_details.net_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Payment Status</h3>
                          <p className="text-green-100 text-xs">Transaction completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold capitalize">{payment.status}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold">Settlement Status</span>
                            <span className="text-sm font-bold text-right capitalize">{enhancedPayment.payment_details.settlement_status}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-100 text-xs">Settlement Date</span>
                            <span className="text-blue-100 text-xs font-bold text-right">{enhancedPayment.payment_details.settlement_date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Information if available */}
                {invoice && (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-3 border-b border-slate-300">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                        </svg>
                        Related Invoice Information
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Invoice Number</span>
                          <span className="font-bold text-slate-800">{invoice.invoice_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Invoice Amount</span>
                          <span className="font-bold text-slate-800">${invoice.total_amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Due Date</span>
                          <span className="font-bold text-slate-800">{new Date(invoice.due_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Invoice Status</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction Details Tab */}
            {activeTab === 'transaction-details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Gateway Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-purple-800">Gateway Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                        <div className="grid grid-cols-1 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Gateway Provider</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.payment_details.gateway_provider}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Gateway Transaction ID</span>
                            <span className="font-bold text-slate-800 font-mono">{enhancedPayment.payment_details.gateway_transaction_id}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Gateway Response</span>
                            <span className="font-bold text-green-600">{enhancedPayment.payment_details.payment_gateway_response}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Authorization Code</span>
                            <span className="font-bold text-slate-800 font-mono">{enhancedPayment.payment_details.authorization_code}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-amber-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-amber-800">Bank Details</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                        <div className="grid grid-cols-1 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Bank Name</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.bank_details.bank_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Account Number</span>
                            <span className="font-bold text-slate-800 font-mono">{enhancedPayment.bank_details.account_number}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Account Holder</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.bank_details.account_holder}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Account Type</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.bank_details.account_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Timeline */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-3 border-b border-slate-300">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Processing Timeline
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {[
                        { time: new Date(payment.created_at).toLocaleString(), event: 'Payment Initiated', status: 'completed' },
                        { time: new Date(new Date(payment.created_at).getTime() + 30000).toLocaleString(), event: 'Gateway Processing', status: 'completed' },
                        { time: new Date(payment.payment_date).toLocaleString(), event: 'Payment Completed', status: 'completed' },
                        { time: enhancedPayment.payment_details.settlement_date.toLocaleString(), event: 'Settlement Scheduled', status: 'pending' }
                      ].map((step, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div className="flex-1 text-sm">
                            <div className="font-medium text-slate-800">{step.event}</div>
                            <div className="text-xs text-slate-500">{step.time}</div>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${
                            step.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {step.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Security Information */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-green-800">Security & Verification</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-green-100">
                        <div className="grid grid-cols-1 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">KYC Status</span>
                            <span className="font-bold text-green-600 capitalize">{enhancedPayment.verification_details.kyc_status}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Risk Score</span>
                            <span className="font-bold text-green-600 capitalize">{enhancedPayment.verification_details.risk_score}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Fraud Check</span>
                            <span className="font-bold text-green-600 capitalize">{enhancedPayment.verification_details.fraud_check}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Compliance Status</span>
                            <span className="font-bold text-green-600 capitalize">{enhancedPayment.verification_details.compliance_status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Technical Details</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-slate-100">
                        <div className="grid grid-cols-1 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Verification Method</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.verification_details.verification_method}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">IP Address</span>
                            <span className="font-bold text-slate-800 font-mono">{enhancedPayment.verification_details.ip_address}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Device Fingerprint</span>
                            <span className="font-bold text-slate-800 font-mono">{enhancedPayment.verification_details.device_fingerprint}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Location</span>
                            <span className="font-bold text-slate-800">{enhancedPayment.verification_details.geolocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Same as Invoice Details */}
          <div className="w-80 bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 flex flex-col h-full">
            <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Payment Summary
              </h4>
              
              {/* Amount Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Amount Breakdown</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Payment Amount:</span>
                      <span className="font-semibold text-slate-800">${payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Processing Fee:</span>
                      <span className="font-semibold text-red-600">-${enhancedPayment.payment_details.processing_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Convenience Fee:</span>
                      <span className="font-semibold text-red-600">-${enhancedPayment.payment_details.convenience_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-slate-600 font-medium">Net Amount:</span>
                      <span className="font-semibold text-emerald-600">${enhancedPayment.payment_details.net_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Total Paid:</span>
                    <span className="text-xl font-bold">${payment.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Quick Actions</h5>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-medium">
                      Download Receipt
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors font-medium">
                      Print Payment Details
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors font-medium">
                      Email Receipt
                    </button>
                    {enhancedPayment.payment_details.refund_status === 'eligible' && (
                      <button className="w-full text-left px-3 py-2 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium">
                        Request Refund
                      </button>
                    )}
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

export default EnhancedPaymentDetails;