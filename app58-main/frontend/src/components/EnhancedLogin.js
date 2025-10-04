import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Login Component with detailed information
const EnhancedLogin = ({ AuthContext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { login, user } = useContext(AuthContext);

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });
      
      if (response.data.access_token) {
        login(response.data.user, response.data.access_token);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${APP_CONFIG.images.heroBackground})` }}
      ></div>
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel - Information */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-12 flex-col justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-48 -translate-x-48"></div>
          
          <div className="relative z-10">
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">{APP_CONFIG.appName}</h1>
              <p className="text-xl text-emerald-100">{APP_CONFIG.appTagline}</p>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-lg text-emerald-50 leading-relaxed">
                {APP_CONFIG.description}
              </p>
            </div>
            
            {/* Key Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-emerald-100">Key Features</h3>
              <div className="grid grid-cols-1 gap-3">
                {APP_CONFIG.keyFeatures.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                    <span className="text-emerald-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG.aboutUs.clientsServed}</div>
                <div className="text-sm text-emerald-200">Clients Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG.aboutUs.uptime}</div>
                <div className="text-sm text-emerald-200">Uptime Guarantee</div>
              </div>
            </div>
            
            {/* About Button */}
            <button 
              onClick={() => setShowAbout(true)}
              className="mt-8 text-emerald-200 hover:text-white transition-colors text-sm font-medium"
              data-testid="about-us-btn"
            >
              Learn More About Us →
            </button>
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
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{APP_CONFIG.appName}</h1>
              <p className="text-slate-600">{APP_CONFIG.appTagline}</p>
            </div>
            
            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                <p className="text-slate-600">Sign in to access your dashboard</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="login-error">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="Enter your email"
                    required
                    data-testid="login-email-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="Enter your password"
                    required
                    data-testid="login-password-input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  data-testid="login-submit-button"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>
              
              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-slate-50 rounded-lg border">
                <p className="text-xs text-slate-600 mb-3 font-medium">Demo Access Credentials:</p>
                <div className="space-y-2">
                  {APP_CONFIG.demoCredentials.map((cred, index) => (
                    <div key={index} className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{cred.role}:</span> {cred.email} / {cred.password}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Contact Support */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">Need help? Contact our {APP_CONFIG.aboutUs.supportTeam} support team</p>
                <a href={`mailto:${APP_CONFIG.contact.email}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  {APP_CONFIG.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{APP_CONFIG.aboutUs.title}</h2>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="text-slate-400 hover:text-slate-600"
                  data-testid="close-about-modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  {APP_CONFIG.aboutUs.mission}
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">Since {APP_CONFIG.aboutUs.established}</div>
                    <div className="text-sm text-slate-600">Established</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{APP_CONFIG.aboutUs.supportTeam}</div>
                    <div className="text-sm text-slate-600">Support</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Complete Feature Set</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {APP_CONFIG.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-medium">Phone:</span> {APP_CONFIG.contact.phone}</p>
                    <p><span className="font-medium">Email:</span> {APP_CONFIG.contact.email}</p>
                    <p><span className="font-medium">Website:</span> {APP_CONFIG.contact.website}</p>
                    <p><span className="font-medium">Address:</span> {APP_CONFIG.contact.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLogin;