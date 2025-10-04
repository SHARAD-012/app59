import React, { useState, useContext, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { APP_CONFIG } from './config/appConfig';
import ProfileManagement from './components/ProfileManagement';
import AccountManagement from './components/AccountManagement';
import AccountDetails from './components/AccountDetails';
import PlansManagement from './components/PlansManagement';
import ServiceManagement from './components/ServiceManagement';
import EnhancedServiceDetails from './components/EnhancedServiceDetails';
import EnhancedServiceCreation from './components/EnhancedServiceCreation';
import EnhancedAccountCreation from './components/EnhancedAccountCreation';
import SimpleLogin from './components/SimpleLogin';
import BillingManagement from './components/BillingManagement';
import PaymentManagement from './components/PaymentManagement';
import SubscriptionManagement from './components/SubscriptionManagement';
import EnhancedInvoiceDetails from './components/EnhancedInvoiceDetails';
import UniversalPaymentModal from './components/UniversalPaymentModal';

// Debug APP_CONFIG loading
console.log('APP_CONFIG loaded:', APP_CONFIG);

// Context for user authentication
const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Use Simple Authentication System
const Login = () => {
  return <SimpleLogin AuthContext={AuthContext} />;
};

// Enhanced Draggable Due Payment Alerts Component
const DuePaymentAlerts = ({ alerts, onClose, onPayNow, onViewInvoice }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!alerts || alerts.length === 0) return null;

  const handleMouseDown = (e) => {
    if (e.target.closest('.alert-content')) return; // Don't drag when clicking content
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 380;
    const maxY = window.innerHeight - 200;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      className="fixed z-50 max-w-sm w-full pointer-events-auto select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-red-300/50 backdrop-blur-sm">
        {/* Enhanced Red Metallic Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white p-4 rounded-t-xl relative overflow-hidden">
          {/* Metallic shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/25 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Payment Overdue Alert</h2>
                <p className="text-red-100 text-xs">Immediate attention required</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/20"
              data-testid="close-due-alerts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Compact Alert Content */}
        <div className="p-4 space-y-3 alert-content">
          {alerts.map((alert, index) => (
            <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50/70 backdrop-blur-sm" data-testid={`due-alert-${alert.invoice_id}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{alert.invoice_number}</h3>
                    <p className="text-xs text-slate-600">{alert.account_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">${alert.amount.toFixed(2)}</div>
                  <div className="text-xs text-red-500">{alert.days_overdue} days overdue</div>
                </div>
              </div>
              
              {/* Enhanced Date Information */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-white/60 rounded-md p-2">
                  <span className="text-slate-500 font-medium">Invoice Date:</span>
                  <div className="text-slate-700 font-semibold">
                    {new Date(alert.invoice_date || Date.now() - (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-white/60 rounded-md p-2">
                  <span className="text-slate-500 font-medium">Due Date:</span>
                  <div className="text-slate-700 font-semibold">
                    {new Date(alert.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Action Button - Only View Invoice */}
              <div className="flex justify-center">
                <button 
                  onClick={() => onViewInvoice && onViewInvoice(alert)}
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all text-sm font-medium py-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  data-testid={`view-invoice-${alert.invoice_id}`}
                >
                  View More Invoice Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Header Component with darkened header area
const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Loading location...');
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Try to get location name using reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation(`${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`);
          } catch (error) {
            setLocation(`${position.coords.latitude.toFixed(2)}°N, ${position.coords.longitude.toFixed(2)}°E`);
          }
        },
        () => {
          setLocation('Location unavailable');
        },
        { timeout: 10000 }
      );
    } else {
      setLocation('Location not supported');
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <header className="bg-slate-700/95 backdrop-blur-sm border-b border-slate-600/60 px-6 py-4 relative">
      {/* Darker background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 to-slate-700/90"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Configurable Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-emerald-100/30">
              <img 
                src={APP_CONFIG?.images?.logo || 'https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWdufGVufDB8fHx8MTc1OTA0ODE5M3ww&ixlib=rb-4.1.0&q=85&w=200&h=200'} 
                alt="Company Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl items-center justify-center hidden">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{APP_CONFIG?.appName || 'Utility Manager Pro'}</h1>
              <p className="text-xs text-slate-300">{APP_CONFIG?.appTagline || 'Complete Utility Management Solution'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Date, Time & Location */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm font-bold text-white">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTime(currentTime)}</span>
                </div>
                <div className="text-xs text-slate-300">{formatDate(currentTime)}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm font-bold text-white">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="max-w-32 truncate">{location}</span>
                </div>
                <div className="text-xs text-slate-300">Current Location</div>
              </div>
            </div>
          </div>

          {/* User Info & Logout - Enhanced darker area */}
          <div className="flex items-center space-x-4 bg-slate-800/70 rounded-xl px-4 py-2 backdrop-blur-sm border border-slate-600/50">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-slate-300 capitalize font-medium">{user.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              data-testid="logout-button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Sidebar Component with dark theme and no background images
const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useContext(AuthContext);
  
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', description: 'Overview & Analytics' }
    ];
    
    if (user.role === 'user') {
      return [
        ...baseItems,
        { id: 'services', label: 'My Services', icon: 'grid', description: 'Active Services' },
        { id: 'invoices', label: 'Invoices', icon: 'receipt', description: 'Billing History' },
        { id: 'payments', label: 'Payments', icon: 'credit-card', description: 'Payment Methods' },
        { id: 'subscriptions', label: 'Subscriptions', icon: 'layers', description: 'My Subscriptions' }
      ];
    }
    
    // Admin and Super Admin get Profile management
    const adminBaseItems = [
      ...baseItems,
      { id: 'profile', label: 'Profile', icon: 'user', description: 'Personal Settings' },
      { id: 'account-details', label: 'Account Details', icon: 'users-detail', description: 'Account Management' }
    ];
    
    if (user.role === 'admin') {
      return [
        ...adminBaseItems,
        // { id: 'accounts', label: 'Accounts', icon: 'users', description: 'Customer Management' },
        { id: 'services', label: 'Services', icon: 'grid', description: 'Service Management' },
        { id: 'invoices', label: 'Invoicing', icon: 'receipt', description: 'Billing & Invoices' },
        { id: 'payments', label: 'Payments', icon: 'credit-card', description: 'Payment Processing' },
        { id: 'subscriptions', label: 'Subscriptions', icon: 'layers', description: 'Subscription Management' },
        { id: 'reports', label: 'Reports', icon: 'chart', description: 'Monthly Reports' },
        { id: 'configuration', label: 'Configuration', icon: 'settings', description: 'System Settings' }
      ];
    }
    
    // Super admin gets all features
    return [
      ...adminBaseItems,
      { id: 'users', label: 'User Management', icon: 'user-group', description: 'System Users' },
      // { id: 'accounts', label: 'Accounts', icon: 'users', description: 'All Accounts' },
      { id: 'services', label: 'Services', icon: 'grid', description: 'Service Catalog' },
      { id: 'invoices', label: 'Invoicing', icon: 'receipt', description: 'System Billing' },
      { id: 'payments', label: 'Payments', icon: 'credit-card', description: 'Payment Gateway' },
      { id: 'subscriptions', label: 'Subscriptions', icon: 'layers', description: 'All Subscriptions' },
      { id: 'reports', label: 'Reports', icon: 'chart', description: 'Advanced Analytics' },
      { id: 'analytics', label: 'Analytics', icon: 'chart', description: 'Business Intelligence' },
      { id: 'configuration', label: 'Configuration', icon: 'settings', description: 'System Settings' }
    ];
  };
  
  const getIcon = (iconName) => {
    const icons = {
      home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      'users-detail': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />,
      'user-group': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
      layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      receipt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />,
      'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    };
    return icons[iconName] || icons.home;
  };
  
  return (
    <div className="w-72 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/60 h-full relative overflow-hidden flex flex-col">
      {/* Dark solid background - no images */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900"></div>
      
      {/* Sidebar Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* User Info Section - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-slate-600/60">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-emerald-400/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white">{user.name}</h3>
              <p className="text-sm text-slate-300 capitalize font-medium">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Scrollable with enhanced darker selection */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <style jsx>{`
            .sidebar-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .sidebar-scroll::-webkit-scrollbar-track {
              background: rgba(71, 85, 105, 0.3);
              border-radius: 2px;
            }
            .sidebar-scroll::-webkit-scrollbar-thumb {
              background: rgba(148, 163, 184, 0.5);
              border-radius: 2px;
              transition: all 0.2s;
            }
            .sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(148, 163, 184, 0.7);
            }
            .sidebar-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(148, 163, 184, 0.5) rgba(71, 85, 105, 0.3);
            }
          `}</style>
          <nav className="p-4 space-y-2">
            {getMenuItems().map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl transform scale-[1.02] ring-2 ring-emerald-400/50'
                    : 'text-slate-300 hover:bg-slate-700/80 hover:text-white hover:shadow-md'
                } rounded-xl p-4 text-left font-medium`}
                data-testid={`sidebar-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === item.id 
                      ? 'bg-white/25' 
                      : 'bg-slate-700/50 group-hover:bg-emerald-500/20'
                  }`}>
                    <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      {getIcon(item.icon)}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{item.label}</div>
                    <div className={`text-xs font-medium ${
                      activeTab === item.id ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Info - Fixed */}
        <div className="flex-shrink-0 p-4">
          <div className="bg-slate-700/70 backdrop-blur-sm rounded-xl p-4 border border-slate-600/60">
            <div className="text-center">
              <div className="text-sm font-bold text-slate-200">{APP_CONFIG?.companyName || 'UtilityTech Solutions'}</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                {APP_CONFIG?.aboutUs?.supportTeam || '24/7'} Support Available
              </div>
              <div className="text-xs text-emerald-400 mt-2 font-medium">
                <a href={`mailto:${APP_CONFIG?.contact?.email || 'support@utilitymanager.com'}`} className="hover:text-emerald-300">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Configuration Management Component with subcategories
const ConfigurationManagement = ({ AuthContext }) => {
  const [activeConfigTab, setActiveConfigTab] = useState('plans');
  
  const getConfigTabs = () => {
    return [
      { id: 'plans', label: 'Service Plans', icon: 'layers', description: 'Manage service pricing and plans' },
      { id: 'billing', label: 'Bill Gen Config', icon: 'receipt', description: 'Configure billing generation settings' },
      { id: 'system', label: 'System Settings', icon: 'settings', description: 'General system configuration' }
    ];
  };
  
  const getConfigIcon = (iconName) => {
    const icons = {
      layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      receipt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    };
    return icons[iconName] || icons.settings;
  };
  
  const renderConfigContent = () => {
    switch(activeConfigTab) {
      case 'plans':
        return <PlansManagement AuthContext={AuthContext} />;
      case 'billing':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Bill Generation Configuration</h3>
            <p className="text-slate-500">Configure billing generation settings and templates.</p>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>
        );
      case 'system':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">System Settings</h3>
            <p className="text-slate-500">General system configuration and preferences.</p>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>
        );
      default:
        return <PlansManagement AuthContext={AuthContext} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuration</h2>
          <p className="text-slate-600 mt-1 text-sm">Manage system settings, service plans, and configurations</p>
        </div>
      </div>
      
      {/* Configuration Tabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-4 shadow-lg">
        <div className="flex space-x-2 overflow-x-auto">
          {getConfigTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveConfigTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 text-sm font-medium ${
                activeConfigTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
              data-testid={`config-tab-${tab.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getConfigIcon(tab.icon)}
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Configuration Content */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
        <div className="p-6">
          {renderConfigContent()}
        </div>
      </div>
    </div>
  );
};

// Dashboard Navigation Button Component - Compact and Enhanced
const DashboardNavButton = ({ section, title, description, color, icon, setActiveTab }) => {
  
  const getColorClasses = (colorName) => {
    const colors = {
      emerald: 'bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600',
      blue: 'bg-blue-100 group-hover:bg-blue-200 text-blue-600',
      amber: 'bg-amber-100 group-hover:bg-amber-200 text-amber-600',
      purple: 'bg-purple-100 group-hover:bg-purple-200 text-purple-600',
      green: 'bg-green-100 group-hover:bg-green-200 text-green-600',
      red: 'bg-red-100 group-hover:bg-red-200 text-red-600',
      indigo: 'bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600',
      teal: 'bg-teal-100 group-hover:bg-teal-200 text-teal-600'
    };
    return colors[colorName] || colors.emerald;
  };

  const getNavIcon = (iconName) => {
    const icons = {
      grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
      layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      receipt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />,
      'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    };
    return icons[iconName] || icons.grid;
  };

  return (
    <button 
      onClick={() => setActiveTab && setActiveTab(section)}
      className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 text-left group hover:scale-102"
      data-testid={`nav-${section}-section`}
    >
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${getColorClasses(color)}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getNavIcon(icon)}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
          <p className="text-xs text-slate-500 truncate">{description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

// Main Dashboard Layout
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dueAlerts, setDueAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isAlertExplicitlyClosed, setIsAlertExplicitlyClosed] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [showUniversalPayment, setShowUniversalPayment] = useState(false);
  const [universalPaymentInvoice, setUniversalPaymentInvoice] = useState(null);
  const { user } = useContext(AuthContext);

  // Check for due payments on login and initialize alert status
  useEffect(() => {
    const checkDuePayments = async () => {
      try {
        // Check if alerts were explicitly closed in this session
        const alertsClosedStatus = localStorage.getItem('paymentAlertsExplicitlyClosed');
        const isClosedInSession = alertsClosedStatus === 'true';
        
        setIsAlertExplicitlyClosed(isClosedInSession);
        
        // Mock due alerts since API doesn't exist
        const mockDueAlerts = [
          {
            invoice_id: 'inv_002',
            invoice_number: 'INV-000124',
            account_name: 'Tech Solutions Inc',
            amount: 187.25,
            due_date: '2024-03-10',
            invoice_date: '2024-02-10',
            days_overdue: 15
          },
          {
            invoice_id: 'inv_004',
            invoice_number: 'INV-000126',
            account_name: 'Green Restaurant Group',
            amount: 345.75,
            due_date: '2024-04-20',
            invoice_date: '2024-03-20',
            days_overdue: 5
          }
        ];
        
        if (mockDueAlerts.length > 0) {
          setDueAlerts(mockDueAlerts);
          // Only show alerts if not explicitly closed and we're on dashboard
          if (!isClosedInSession && activeTab === 'dashboard') {
            setShowAlerts(true);
          }
        }
      } catch (error) {
        console.error('Error fetching due alerts:', error);
      }
    };

    checkDuePayments();
  }, [activeTab]);

  // Monitor tab changes to show/hide alerts based on navigation
  useEffect(() => {
    if (dueAlerts.length > 0 && !isAlertExplicitlyClosed) {
      if (activeTab === 'dashboard') {
        setShowAlerts(true);
      } else {
        setShowAlerts(false);
      }
    }
  }, [activeTab, dueAlerts, isAlertExplicitlyClosed]);

  // Handle explicit close of alert popup
  const handleCloseAlert = () => {
    setShowAlerts(false);
    setIsAlertExplicitlyClosed(true);
    // Store in localStorage to persist until next login
    localStorage.setItem('paymentAlertsExplicitlyClosed', 'true');
  };

  // Handle Pay Now action from dashboard popup
  const handlePayNowFromAlert = (alert) => {
    console.log('Processing payment for invoice:', alert.invoice_id);
    
    // Create mock invoice object for payment processing
    const invoiceForPayment = {
      id: alert.invoice_id,
      invoice_number: alert.invoice_number,
      total_amount: alert.amount,
      due_date: alert.due_date,
      days_overdue: alert.days_overdue,
      account_id: 'acc_001', // Mock account ID
      status: 'overdue',
      items: [
        { description: 'Service charges', amount: alert.amount - 20 },
        { description: 'Late fee', amount: 20 }
      ]
    };
    
    // Use Universal Payment Modal instead
    setUniversalPaymentInvoice(invoiceForPayment);
    setShowUniversalPayment(true);
    setShowAlerts(false);
  };

  // Handle View Invoice action from dashboard popup
  const handleViewInvoiceFromAlert = (alert) => {
    console.log('Viewing invoice details for:', alert.invoice_id);
    
    // Create detailed invoice object
    const invoiceDetails = {
      id: alert.invoice_id,
      invoice_number: alert.invoice_number,
      account_name: alert.account_name,
      total_amount: alert.amount,
      due_date: alert.due_date,
      days_overdue: alert.days_overdue,
      status: 'overdue',
      created_at: new Date(Date.now() - alert.days_overdue * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Electricity Service', amount: alert.amount - 50, quantity: 1 },
        { description: 'Service Fee', amount: 30, quantity: 1 },
        { description: 'Late Fee', amount: 20, quantity: 1 }
      ],
      subtotal: alert.amount - 20,
      tax_amount: 0,
      discount_amount: 0
    };
    
    setSelectedInvoiceDetails(invoiceDetails);
    setShowInvoiceDetailsModal(true);
  };

  // Make setActiveTab available globally for navigation buttons
  useEffect(() => {
    window.dashboardSetActiveTab = setActiveTab;
    return () => {
      delete window.dashboardSetActiveTab;
    };
  }, [setActiveTab]);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardContent setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileManagement AuthContext={AuthContext} setActiveTab={setActiveTab} />;
      case 'account-details':
        return <AccountDetails AuthContext={AuthContext} setActiveTab={setActiveTab} />;
      case 'users':
        return user.role === 'super_admin' ? <UserManagement /> : <DashboardContent setActiveTab={setActiveTab} />;
      // case 'accounts':
      //   return <AccountManagement AuthContext={AuthContext} />;
      case 'services':
        return <EnhancedServiceDetails AuthContext={AuthContext} />;
      case 'configuration':
        return (user.role === 'admin' || user.role === 'super_admin') ? <ConfigurationManagement AuthContext={AuthContext} /> : <DashboardContent setActiveTab={setActiveTab} />;
      case 'invoices':
        return <BillingManagement AuthContext={AuthContext} />;
      case 'payments':
        return <PaymentManagement AuthContext={AuthContext} selectedInvoiceForPayment={selectedInvoiceForPayment} />;
      case 'subscriptions':
        return <SubscriptionManagement AuthContext={AuthContext} />;
      case 'reports':
        return <ReportsManagement />;
      case 'analytics':
        return user.role === 'super_admin' ? <Analytics /> : <DashboardContent setActiveTab={setActiveTab} />;
      default:
        return <DashboardContent setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      
      {/* Subtle Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: `url(${APP_CONFIG?.images?.dashboardBackground || 'https://images.unsplash.com/photo-1497366216548-37526070297c'})` }}
      ></div>
      
      {/* Main Layout */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 relative" data-testid="dashboard-main">
            {/* Content Background */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
            
            {/* Content Container */}
            <div className="relative z-10">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Due Payment Alerts Modal */}
      {showAlerts && (
        <DuePaymentAlerts 
          alerts={dueAlerts}
          onClose={handleCloseAlert}
          onPayNow={handlePayNowFromAlert}
          onViewInvoice={handleViewInvoiceFromAlert}
        />
      )}

      {/* Enhanced Invoice Details Modal */}
      {showInvoiceDetailsModal && selectedInvoiceDetails && (
        <EnhancedInvoiceDetails 
          invoice={selectedInvoiceDetails}
          onClose={() => setShowInvoiceDetailsModal(false)}
          onPayNow={handlePayNowFromAlert}
          showPaymentAction={true}
        />
      )}

      {/* Universal Payment Modal */}
      <UniversalPaymentModal
        invoice={universalPaymentInvoice}
        isOpen={showUniversalPayment}
        onClose={() => {
          setShowUniversalPayment(false);
          setUniversalPaymentInvoice(null);
        }}
        onPaymentSuccess={(paymentData) => {
          console.log('Payment successful from alert:', paymentData);
          // Handle payment success if needed
        }}
      />
    </div>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Set axios default header for authentication
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);
  
  const login = (userData, token) => {
    console.log("🔍 Login function called with:", userData, token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    // Set axios default header for authentication
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("✅ Login completed, user state updated");
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear payment alerts closed status so it shows again on next login
    localStorage.removeItem('paymentAlertsExplicitlyClosed');
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const value = {
    user,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Enhanced Dashboard Content Component with detailed sections and filtering
const DashboardContent = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('this_month');
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await axios.get(`${API}/dashboard/stats`);
        setStats(statsResponse.data);
        
        // Mock recent activities and tasks for enhanced dashboard
        setRecentActivities([
          { id: 1, type: 'invoice_paid', description: 'Invoice #INV-000123 paid by Smith Enterprises', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), amount: '$295.50' },
          { id: 2, type: 'service_activated', description: 'New electricity service activated for Johnson LLC', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), amount: null },
          { id: 3, type: 'profile_created', description: 'New profile created: Tech Solutions Inc', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), amount: null },
          { id: 4, type: 'payment_overdue', description: 'Payment overdue for Green Restaurant Group', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), amount: '$187.25' }
        ]);

        setUpcomingTasks([
          { id: 1, task: 'Generate monthly invoices', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: 'high' },
          { id: 2, task: 'Service maintenance for Account #ACC-001', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), priority: 'medium' },
          { id: 3, task: 'Review service plan pricing', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: 'low' }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getDashboardStats = () => {
    if (user.role === 'user') {
      return [
        { label: 'Active Services', value: stats?.active_services || '4', icon: 'grid', color: 'emerald', trend: '+2 this month' },
        { label: 'Pending Invoices', value: stats?.pending_invoices || '2', icon: 'receipt', color: 'amber', trend: '-1 from last month' },
        { label: 'This Month Bill', value: `$${stats?.current_month_bill || '245.50'}`, icon: 'credit-card', color: 'blue', trend: '+5.2% vs last month' },
        { label: 'Payment Status', value: 'Current', icon: 'check-circle', color: 'green', trend: 'All payments up to date' }
      ];
    }
    
    if (user.role === 'admin') {
      return [
        { label: 'Total Revenue', value: `$${stats?.total_revenue || '142,500'}`, icon: 'chart', color: 'emerald', trend: '+12.5% vs last month' },
        { label: 'Total Collected', value: `$${stats?.monthly_revenue || '34,250'}`, icon: 'credit-card', color: 'blue', trend: '+8.3% growth' },
        { label: 'Active Accounts', value: stats?.total_accounts || '45', icon: 'users', color: 'purple', trend: '+3 new accounts' },
        { label: 'Pending Invoices', value: stats?.pending_invoices || '28', icon: 'receipt', color: 'amber', trend: '12 overdue' },
        { label: 'Collection Rate', value: '94.2%', icon: 'trending-up', color: 'green', trend: '+2.1% improvement' }
      ];
    }
    
    // Super admin stats - Enhanced with more details
    return [
      { label: 'Total Revenue', value: `$${stats?.total_revenue || '142,500'}`, icon: 'chart', color: 'emerald', trend: '+15.2% YoY growth' },
      { label: 'Active Profiles', value: stats?.total_profiles || '567', icon: 'user-group', color: 'blue', trend: '+45 this quarter' },
      { label: 'Total Accounts', value: stats?.total_accounts || '890', icon: 'users', color: 'purple', trend: '+78 this month' },
      { label: 'Monthly Revenue', value: `$${stats?.monthly_revenue || '45,800'}`, icon: 'chart', color: 'green', trend: 'Record high' },
      { label: 'System Health', value: `${stats?.system_health || '99.8'}%`, icon: 'shield', color: 'teal', trend: '24h uptime' },
      { label: 'Active Services', value: stats?.active_services || '1,234', icon: 'grid', color: 'indigo', trend: '+89 this week' }
    ];
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      teal: 'bg-teal-50 text-teal-700 border-teal-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[color] || colors.emerald;
  };

  const getStatIcon = (iconName) => {
    const icons = {
      grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
      layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      receipt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-10-5 10L1 7l5-5 5 10 5-10v18z" />,
      'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      'user-group': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      'check-circle': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      'trending-up': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    };
    return icons[iconName] || icons.chart;
  };

  const getActivityIcon = (type) => {
    const icons = {
      invoice_paid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      service_activated: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      profile_created: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      payment_overdue: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
    };
    return icons[type] || icons.profile_created;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-amber-600 bg-amber-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-4">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-600 text-sm">Monitor your system performance and key metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="w-auto px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            data-testid="time-range-filter"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Closable Welcome Section - Made more compact */}
      {showWelcome && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg relative">
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            data-testid="close-welcome-message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center justify-between pr-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Welcome back, {user.name}! 👋
              </h3>
              <p className="text-slate-600 text-xs">
                Here's your {user.role === 'user' ? 'account' : 'system'} overview for {selectedTimeRange.replace('_', ' ')}.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Stats Grid - Reduced spacing and improved layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {getDashboardStats().map((stat, index) => (
          <div key={index} className={`group hover:scale-102 transition-all duration-300 p-3 rounded-lg border ${getColorClasses(stat.color)} backdrop-blur-sm shadow-md hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {getStatIcon(stat.icon)}
                </svg>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold leading-none">{stat.value}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium opacity-80 mb-1">{stat.label}</p>
              {stat.trend && (
                <p className="text-xs opacity-60 font-medium">{stat.trend}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Quick Navigation Sections - Made more compact */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DashboardNavButton 
              section="services"
              title="Services"
              description="Manage services"
              color="emerald"
              icon="grid"
              setActiveTab={setActiveTab}
            />
            <DashboardNavButton 
              section="accounts"
              title="Accounts"
              description="Manage accounts"
              color="blue"
              icon="users"
              setActiveTab={setActiveTab}
            />
            <DashboardNavButton 
              section="invoices"
              title="Invoices"
              description="Billing & invoices"
              color="amber"
              icon="receipt"
              setActiveTab={setActiveTab}
            />
            <DashboardNavButton 
              section="payments"
              title="Payments"
              description="Payment management"
              color="purple"
              icon="credit-card"
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Recent Activities */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg p-4">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Recent Activities</h3>
            <div className="space-y-2">
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'invoice_paid' ? 'bg-green-100 text-green-600' :
                    activity.type === 'service_activated' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'profile_created' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getActivityIcon(activity.type)}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{activity.description}</p>
                    <p className="text-xs text-slate-500">{activity.timestamp.toLocaleTimeString()}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-semibold text-slate-700">{activity.amount}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks & Alerts */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Upcoming Tasks</h3>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg p-4">
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {task.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{task.task}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg p-4">
            <h4 className="text-sm font-bold text-slate-800 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Payment Gateway</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-amber-600 font-medium">Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other sections
const UserManagement = () => <div>User Management - Enhanced version coming</div>;
const ReportsManagement = () => <div>Reports Management - Enhanced version coming</div>;
const Analytics = () => <div>Analytics - Enhanced version coming</div>;

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Dashboard />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;