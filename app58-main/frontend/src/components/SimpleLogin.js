import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Simple Email/Password Authentication System
const SimpleLogin = ({ AuthContext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Email/Password Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log("🔍 Sending login request...", loginData);
      
      // Try real API first (with timeout protection)
      try {
        const response = await axios.post(`${API}/auth/login`, loginData, {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("✅ Login response received:", response.data);
        
        if (response.data.access_token) {
          console.log("🔍 Calling login function...");
          login(response.data.user, response.data.access_token);
          console.log("✅ Login function called successfully");
          // Explicit navigation after successful login
          navigate('/', { replace: true });
          return;
        } else {
          setError('Invalid response from server');
          return;
        }
      } catch (apiError) {
        console.log("⚠️ API login failed, trying demo credentials...", apiError.message);
        // Only fall back to demo if API is completely unreachable or times out
        if (apiError.code === 'ECONNABORTED' || apiError.request) {
          console.log("🔄 Using demo authentication as fallback");
        } else {
          // If it's a 401 or other HTTP error, show the error instead of falling back
          if (apiError.response?.status === 401) {
            setError('Invalid credentials');
            return;
          } else {
            setError(apiError.response?.data?.detail || 'Server error occurred');
            return;
          }
        }
      }
      
      // Fallback to demo credentials only if API is unreachable
      const validCredentials = [
        { email: 'superadmin@example.com', password: 'password', user: { email: 'superadmin@example.com', name: 'Super Admin', role: 'super_admin', is_active: true, id: 'user_001' } },
        { email: 'admin@example.com', password: 'password', user: { email: 'admin@example.com', name: 'Admin User', role: 'admin', is_active: true, id: 'user_002' } },
        { email: 'user@example.com', password: 'password', user: { email: 'user@example.com', name: 'Regular User', role: 'user', is_active: true, id: 'user_003' } }
      ];
      
      const validUser = validCredentials.find(cred => cred.email === loginData.email && cred.password === loginData.password);
      
      if (validUser) {
        console.log("✅ Demo authentication successful");
        // Generate a mock token for demo purposes
        const mockToken = `demo-token-${Date.now()}`;
        login(validUser.user, mockToken);
        console.log("✅ Login function called successfully");
        setError('Using demo mode - some features may not work correctly');
        // Explicit navigation after successful demo login
        navigate('/', { replace: true });
        return;
      } else {
        setError('Invalid credentials');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${APP_CONFIG?.images?.heroBackground || 'https://images.unsplash.com/photo-1497366216548-37526070297c'})` }}
      />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel - Information */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-12 flex-col justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-48 -translate-x-48" />
          
          <div className="relative z-10">
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">{APP_CONFIG?.appName || 'Utility Manager Pro'}</h1>
              <p className="text-xl text-emerald-100">{APP_CONFIG?.appTagline || 'Complete Utility Management Solution'}</p>
            </div>
            
            {/* Features Info */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-emerald-100">Key Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50 font-medium">Role-Based Access Control</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50 font-medium">Profile & Account Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50 font-medium">Service Plans & Billing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50 font-medium">Real-time Analytics</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG?.aboutUs?.clientsServed || '1000+'}</div>
                <div className="text-sm font-semibold text-emerald-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG?.aboutUs?.uptime || '99.9%'}</div>
                <div className="text-sm font-semibold text-emerald-200">Uptime</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{APP_CONFIG?.appName || 'Utility Manager Pro'}</h1>
              <p className="text-slate-600 font-medium">{APP_CONFIG?.appTagline || 'Complete Utility Management Solution'}</p>
            </div>
            
            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                <p className="text-slate-600 font-medium">Sign in to your account</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="login-error">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 font-medium text-slate-800"
                    placeholder="Enter your email"
                    required
                    data-testid="email-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 font-medium text-slate-800"
                    placeholder="Enter your password"
                    required
                    data-testid="password-input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  data-testid="login-button"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="font-bold">Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border">
                <p className="text-sm font-bold text-slate-700 mb-3">Demo Credentials:</p>
                <div className="space-y-2 text-sm">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-800">Super Admin:</span> <span className="font-medium">superadmin@example.com / password</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-800">Admin:</span> <span className="font-medium">admin@example.com / password</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-800">User:</span> <span className="font-medium">user@example.com / password</span>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-slate-600">Need help? Contact support</p>
                <a href={`mailto:${APP_CONFIG?.contact?.email || 'support@utilitymanager.com'}`} className="text-sm text-emerald-600 hover:text-emerald-700 font-bold">
                  {APP_CONFIG?.contact?.email || 'support@utilitymanager.com'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;