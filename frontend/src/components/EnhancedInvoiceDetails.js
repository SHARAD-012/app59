import React, { useState, useEffect } from 'react';
import UniversalPaymentModal from './UniversalPaymentModal';

const EnhancedInvoiceDetails = ({ 
  invoice, 
  onClose, 
  onPayNow, 
  showPaymentAction = false 
}) => {
  const [showServiceDetails, setShowServiceDetails] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState(invoice?.items || []);
  
  // Payment Modal State - Updated to use UniversalPaymentModal
  const [showUniversalPayment, setShowUniversalPayment] = useState(false);

  if (!invoice) return null;

  // Enhanced mock service details for demonstration
  const getServiceDetails = (serviceId) => {
    const serviceDetails = {
      'srv_001': {
        id: 'srv_001',
        name: 'Electricity Service',
        type: 'Electricity',
        plan: 'Enterprise Pro',
        meter_number: 'ELC-001-2024',
        billing_period: 'Jan 1, 2024 - Jan 31, 2024',
        usage: '850 kWh',
        rate: '$0.15/kWh',
        base_charge: '$50.00',
        usage_charge: '$127.50',
        taxes: '$17.75',
        total: '$195.25',
        service_address: '123 Main St, Business District',
        connection_type: 'Three Phase',
        tariff_category: 'Commercial',
        previous_reading: '12,450 kWh',
        current_reading: '13,300 kWh',
        multiplier: '1.0',
        power_factor: '0.95',
        demand_charges: '$35.00',
        energy_charges: '$127.50',
        fuel_adjustment: '$8.25',
        regulatory_charges: '$4.50'
      },
      'srv_002': {
        id: 'srv_002',
        name: 'Water Service', 
        type: 'Water',
        plan: 'Commercial Plus',
        meter_number: 'WTR-001-2024',
        billing_period: 'Jan 1, 2024 - Jan 31, 2024',
        usage: '1,200 gallons',
        rate: '$0.08/gallon',
        base_charge: '$25.00',
        usage_charge: '$96.00',
        taxes: '$12.10',
        total: '$133.10',
        service_address: '123 Main St, Business District',
        connection_type: 'Municipal Supply',
        tariff_category: 'Commercial',
        previous_reading: '45,200 gallons',
        current_reading: '46,400 gallons',
        sewerage_charges: '$18.00',
        water_quality_fee: '$5.00',
        environmental_fee: '$3.10'
      },
      'srv_003': {
        id: 'srv_003',
        name: 'Gas Service',
        type: 'Gas',
        plan: 'Business Standard',
        meter_number: 'GAS-001-2024',
        billing_period: 'Jan 1, 2024 - Jan 31, 2024',
        usage: '2,500 therms',
        rate: '$0.65/therm',
        base_charge: '$40.00',
        usage_charge: '$1,625.00',
        taxes: '$83.25',
        total: '$1,748.25',
        service_address: '123 Main St, Business District',
        connection_type: 'High Pressure',
        tariff_category: 'Commercial',
        previous_reading: '8,750 therms',
        current_reading: '11,250 therms',
        distribution_charges: '$125.00',
        commodity_charges: '$1,500.00',
        pipeline_safety_fee: '$15.00'
      }
    };
    return serviceDetails[serviceId] || null;
  };

  // Mock payment history
  const getPaymentHistory = () => {
    return {
      last_payment: {
        amount: '$1,856.75',
        date: '2024-02-15',
        transaction_id: 'TXN-20240215-001',
        payment_id: 'PAY-789456123',
        method: 'Bank Transfer',
        status: 'Completed'
      },
      payment_history: [
        {
          date: '2024-02-15',
          amount: '$1,856.75',
          transaction_id: 'TXN-20240215-001',
          payment_id: 'PAY-789456123',
          method: 'Bank Transfer',
          status: 'Completed'
        },
        {
          date: '2024-01-15', 
          amount: '$1,934.20',
          transaction_id: 'TXN-20240115-001',
          payment_id: 'PAY-789456122',
          method: 'Credit Card',
          status: 'Completed'
        },
        {
          date: '2023-12-15',
          amount: '$2,105.45',
          transaction_id: 'TXN-20231215-001', 
          payment_id: 'PAY-789456121',
          method: 'Bank Transfer',
          status: 'Completed'
        }
      ]
    };
  };

  const paymentInfo = getPaymentHistory();

  // Filter services based on search
  const handleServiceSearch = (searchTerm) => {
    setServiceSearch(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredItems(invoice?.items || []);
    } else {
      const filtered = invoice?.items?.filter((item, index) => {
        const serviceId = `srv_${String(index + 1).padStart(3, '0')}`;
        const serviceNumber = String(index + 1).padStart(3, '0');
        return serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               serviceNumber.includes(searchTerm) ||
               item.description.toLowerCase().includes(searchTerm.toLowerCase());
      }) || [];
      setFilteredItems(filtered);
    }
  };

  // Update filtered items when invoice changes
  useEffect(() => {
    setFilteredItems(invoice?.items || []);
  }, [invoice]);

  const ServiceDetailsPopup = ({ serviceId, onClose }) => {
    const service = getServiceDetails(serviceId);
    if (!service) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-3">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-slate-200">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-700 px-6 py-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {service.type === 'Electricity' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                    {service.type === 'Water' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    )}
                    {service.type === 'Gas' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Service Charge Details</h3>
                  <p className="text-slate-200 text-sm">{service.name}</p>
                  <p className="text-slate-300 text-xs">{service.type} • {service.plan}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                data-testid="close-service-details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Service Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-emerald-800">Service Information</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Service ID</span>
                          <span className="font-bold text-slate-800">{service.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Service Type</span>
                          <span className="font-bold text-slate-800">{service.type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Plan</span>
                          <span className="font-bold text-slate-800">{service.plan}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Tariff Category</span>
                          <span className="font-bold text-slate-800">{service.tariff_category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Meter Number</span>
                          <span className="font-bold text-slate-800 font-mono">{service.meter_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Service Address</span>
                          <span className="font-bold text-slate-800">{service.service_address}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Connection Type</span>
                          <span className="font-bold text-slate-800">{service.connection_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Billing Period</span>
                          <span className="font-bold text-slate-800">{service.billing_period}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meter Readings */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-blue-800">Meter Readings</h4>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Previous Reading</span>
                        <span className="font-bold text-slate-800">{service.previous_reading}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Current Reading</span>
                        <span className="font-bold text-slate-800">{service.current_reading}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Usage</span>
                        <span className="font-bold text-emerald-600 text-sm">{service.usage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Rate</span>
                        <span className="font-bold text-slate-800">{service.rate}</span>
                      </div>
                      {service.multiplier && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Multiplier</span>
                          <span className="font-bold text-slate-800">{service.multiplier}</span>
                        </div>
                      )}
                      {service.power_factor && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Power Factor</span>
                          <span className="font-bold text-slate-800">{service.power_factor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Charges Breakdown */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-amber-600 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-amber-800">Service Charges Breakdown</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                      <h5 className="font-semibold text-slate-700 mb-2 text-xs">Base Charges</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Base/Fixed Charge</span>
                          <span className="font-semibold text-slate-800">{service.base_charge}</span>
                        </div>
                        {service.demand_charges && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Demand Charges</span>
                            <span className="font-semibold text-slate-800">{service.demand_charges}</span>
                          </div>
                        )}
                        {service.distribution_charges && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Distribution Charges</span>
                            <span className="font-semibold text-slate-800">{service.distribution_charges}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                      <h5 className="font-semibold text-slate-700 mb-2 text-xs">Usage Charges</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">{service.type === 'Electricity' ? 'Energy' : service.type === 'Gas' ? 'Commodity' : 'Usage'} Charges</span>
                          <span className="font-semibold text-slate-800">{service.energy_charges || service.commodity_charges || service.usage_charge}</span>
                        </div>
                        {service.fuel_adjustment && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Fuel Adjustment</span>
                            <span className="font-semibold text-slate-800">{service.fuel_adjustment}</span>
                          </div>
                        )}
                        {service.sewerage_charges && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Sewerage Charges</span>
                            <span className="font-semibold text-slate-800">{service.sewerage_charges}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                      <h5 className="font-semibold text-slate-700 mb-2 text-xs">Fees & Taxes</h5>
                      <div className="space-y-2 text-xs">
                        {service.regulatory_charges && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Regulatory Charges</span>
                            <span className="font-semibold text-slate-800">{service.regulatory_charges}</span>
                          </div>
                        )}
                        {service.water_quality_fee && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Water Quality Fee</span>
                            <span className="font-semibold text-slate-800">{service.water_quality_fee}</span>
                          </div>
                        )}
                        {service.environmental_fee && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Environmental Fee</span>
                            <span className="font-semibold text-slate-800">{service.environmental_fee}</span>
                          </div>
                        )}
                        {service.pipeline_safety_fee && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Pipeline Safety Fee</span>
                            <span className="font-semibold text-slate-800">{service.pipeline_safety_fee}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-slate-600">Taxes & Other Fees</span>
                          <span className="font-semibold text-slate-800">{service.taxes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 text-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Service Total</span>
                        <span className="text-lg font-bold">{service.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-3">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden border border-slate-200">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-700 px-6 py-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Invoice Details</h3>
                  <div className="text-slate-200 text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{invoice.invoice_number}</span>
                      <span className="text-slate-300">|</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        invoice.status === 'paid' || invoice.paid_status ? 'bg-green-100 text-green-800' :
                        invoice.status === 'overdue' || (invoice.days_overdue && invoice.days_overdue > 0) ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status === 'paid' || invoice.paid_status ? 'Paid' :
                         invoice.status === 'overdue' || (invoice.days_overdue && invoice.days_overdue > 0) ? 'Overdue' : 'Pending'}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs">Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      {(invoice.days_overdue && invoice.days_overdue > 0) && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-red-200 text-xs font-medium">{invoice.days_overdue} days overdue</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons in Header */}
              <div className="flex items-center space-x-2">
                {/* 1. Settle Button */}
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors shadow-sm">
                  Settle
                </button>
                
                {/* 2. Pay Now Button */}
                {showPaymentAction && (invoice.status !== 'paid' && !invoice.paid_status) && (
                  <button
                    onClick={() => setShowUniversalPayment(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors shadow-sm"
                    data-testid="pay-invoice-btn"
                  >
                    Pay Now
                  </button>
                )}

                {/* 3. Download Button with Arrow */}
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors shadow-sm flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF</span>
                </button>
                
                {/* 4. Close Button */}
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  data-testid="close-invoice-details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-full">
            {/* Main Content - Compact */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Invoice & Account Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Bill Period</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Bill Cycle:</span>
                      <span className="font-bold text-slate-800">Monthly Utility Cycle</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Start Date:</span>
                      <span className="font-semibold text-slate-800">Jan 1, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">End Date:</span>
                      <span className="font-semibold text-slate-800">Jan 31, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Issue Date:</span>
                      <span className="font-semibold text-slate-800">{new Date(invoice.created_at || invoice.issue_date).toLocaleDateString()}</span>
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
                    <h4 className="text-sm font-bold text-blue-800">Account Information</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Account Name:</span>
                      <span className="font-bold text-slate-800">{invoice.account_name}</span>
                    </div>
                    {invoice.month && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Billing Month:</span>
                        <span className="font-semibold text-slate-800">{invoice.month}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-emerald-800">Payment Info</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {paymentInfo.last_payment && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Last Payment:</span>
                          <span className="font-bold text-emerald-700">{paymentInfo.last_payment.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Payment Date:</span>
                          <span className="font-semibold text-slate-800">{paymentInfo.last_payment.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Transaction ID:</span>
                          <span className="font-mono text-xs text-slate-800">{paymentInfo.last_payment.transaction_id}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending Amount and Pending Invoice + Late Fee - Two Sections */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Pending to Pay</h3>
                        <p className="text-red-100 text-xs">Invoice amount</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${invoice.total_amount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold">Amount with Late Fee</span>
                          <span className="text-sm font-bold text-right">${(invoice.total_amount + ((invoice.days_overdue || 0) * 2.5)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-100 text-xs">Late Fee</span>
                          <span className="text-orange-100 text-xs font-bold text-right">${((invoice.days_overdue || 0) * 2.5).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service-wise Charges - Compact with Scroll */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-lg mb-4">
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-3 border-b border-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Service-wise Charges</h4>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
                        {filteredItems.length} Service(s)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Service ID..."
                          value={serviceSearch}
                          onChange={(e) => handleServiceSearch(e.target.value)}
                          className="px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-40"
                        />
                        <svg className="w-3 h-3 text-slate-400 absolute right-2 top-1.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {serviceSearch && (
                        <button
                          onClick={() => handleServiceSearch('')}
                          className="px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                          title="Clear search"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Service Table - Show only 3 services */}
                <div className="overflow-y-auto" style={{ maxHeight: '180px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 6px;
                    }
                    div::-webkit-scrollbar-track {
                      background: #f1f5f9;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                  `}</style>
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Service Description</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.length > 0 ? filteredItems.map((item, index) => {
                        // Get original index for service ID generation
                        const originalIndex = invoice.items ? invoice.items.findIndex(originalItem => originalItem === item) : index;
                        return (
                          <tr key={originalIndex} className="hover:bg-slate-50 transition-colors" style={{ height: '50px' }}>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold text-xs">
                                  {originalIndex + 1}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-slate-800">{item.description}</div>
                                  <div className="text-xs text-slate-500">Service #{String(originalIndex + 1).padStart(3, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {item.quantity || 1}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="text-sm font-bold text-slate-800">${item.amount.toFixed(2)}</div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => setShowServiceDetails(`srv_${String(originalIndex + 1).padStart(3, '0')}`)}
                                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded text-xs font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm hover:shadow-md"
                                data-testid={`service-details-${originalIndex}`}
                                title="View Service Charges"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-sm">
                            {serviceSearch ? 'No services found matching your search.' : 'No services available.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Compact Sidebar */}
            <div className="w-80 bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 flex flex-col h-full">
              <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Invoice Summary
                </h4>
                
                {/* Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Over All Charges</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Base Charges:</span>
                        <span className="font-semibold text-slate-800">${(invoice.total_amount * 0.65).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">One Time Charges:</span>
                        <span className="font-semibold text-slate-800">${(invoice.total_amount * 0.20).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Addon Charges:</span>
                        <span className="font-semibold text-slate-800">${(invoice.total_amount * 0.15).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Amount Breakdown</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Subtotal:</span>
                        <span className="font-semibold text-slate-800">${(invoice.subtotal || invoice.total_amount - (invoice.tax_amount || 0) + (invoice.discount_amount || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Tax:</span>
                        <span className="font-semibold text-slate-800">${(invoice.tax_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Discount:</span>
                        <span className="font-semibold text-emerald-600">-${(invoice.discount_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 text-white shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Total Amount:</span>
                      <span className="text-xl font-bold">${invoice.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment History */}
                  {paymentInfo.payment_history && paymentInfo.payment_history.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                      <h5 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Recent Payments</h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                        <style jsx>{`
                          div::-webkit-scrollbar {
                            width: 4px;
                          }
                          div::-webkit-scrollbar-track {
                            background: #f1f5f9;
                          }
                          div::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 2px;
                          }
                          div::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                          }
                        `}</style>
                        {paymentInfo.payment_history.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100">
                            <div>
                              <div className="font-medium text-slate-800">{payment.date}</div>
                              <div className="text-slate-500">{payment.method}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-emerald-600">{payment.amount}</div>
                              <div className={`text-xs px-1 py-0.5 rounded ${
                                payment.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {payment.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Service Details Popup */}
      {showServiceDetails && (
        <ServiceDetailsPopup 
          serviceId={showServiceDetails} 
          onClose={() => setShowServiceDetails(null)} 
        />
      )}

      {/* Universal Payment Modal */}
      <UniversalPaymentModal
        invoice={invoice}
        isOpen={showUniversalPayment}
        onClose={() => setShowUniversalPayment(false)}
        onPaymentSuccess={(paymentData) => {
          console.log('Payment successful:', paymentData);
          // Handle payment success if needed
        }}
      />
    </>
  );
};

export default EnhancedInvoiceDetails;