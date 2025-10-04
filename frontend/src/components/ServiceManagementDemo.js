import React from 'react';
import EnhancedServiceManagement from './EnhancedServiceManagement';

// Demo component showing how to use the Enhanced Service Management
const ServiceManagementDemo = ({ AuthContext }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Enhanced Service Management Demo</h1>
          <p className="text-slate-600">
            Comprehensive service management with partial update capability - all fields except service_id are updatable
          </p>
        </div>
        
        <EnhancedServiceManagement AuthContext={AuthContext} />
      </div>
    </div>
  );
};

export default ServiceManagementDemo;