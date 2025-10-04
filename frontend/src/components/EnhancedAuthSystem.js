import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Authentication System with Multiple Login Methods
const EnhancedAuthSystem = ({ AuthContext }) => {
  const [authMode, setAuthMode] = useState('email'); // 'email', 'profile_id', 'otp'
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states for different auth methods
  const [emailAuth, setEmailAuth] = useState({
    email: '',
    password: ''
  });

  const [profileAuth, setProfileAuth] = useState({
    profile_id: '',
    full_name: '',
    phone: '',
    verification_method: 'sms' // 'sms', 'email'
  });

  const [otpData, setOtpData] = useState({
    otp_code: '',
    expires_at: null,
    attempts_left: 3
  });

  const [tempCredentials, setTempCredentials] = useState({
    username: '',
    password: '',
    sent_via: ''
  });

  const { login, user } = useContext(AuthContext);

  // Mock profiles data for Profile ID lookup
  const mockProfiles = [
    { id: 'prof_001', name: 'Tech Solutions Inc', email: 'contact@techsolutions.com', phone: '+1-555-0101' },
    { id: 'prof_002', name: 'Green Restaurant Group', email: 'info@greenrestaurant.com', phone: '+1-555-0102' },
    { id: 'prof_003', name: 'Metro Manufacturing', email: 'admin@metromanuf.com', phone: '+1-555-0103' },
    { id: 'prof_004', name: 'City Hospital Network', email: 'it@cityhospital.com', phone: '+1-555-0104' }
  ];

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Email/Password Authentication
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, emailAuth);
      
      if (response.data.access_token) {
        login(response.data.user);
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

  // Profile ID Authentication
  const handleProfileIdSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock profile lookup
      const profile = mockProfiles.find(p => p.id === profileAuth.profile_id);
      
      if (!profile) {
        setError('Profile ID not found. Please check and try again.');
        setLoading(false);
        return;
      }

      if (profileAuth.full_name.toLowerCase() !== profile.name.toLowerCase()) {
        setError('Full name does not match the profile. Please verify.');
        setLoading(false);
        return;
      }

      // Generate and send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      setOtpData({
        otp_code: otpCode, // In production, this would be sent via SMS/Email
        expires_at: expiresAt,
        attempts_left: 3
      });

      // Mock sending OTP
      if (profileAuth.verification_method === 'sms') {
        setSuccess(`OTP sent to ${profile.phone.slice(0, -4)}****`);
      } else {
        setSuccess(`OTP sent to ${profile.email.replace(/(.{3}).*@/, '$1***@')}`);
      }

      // For demo purposes, show the OTP code (remove in production)
      console.log('Demo OTP Code:', otpCode);
      setError(`Demo Mode - OTP Code: ${otpCode}`);
      
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification
  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otpData.otp_code !== otpData.otp_code) {
        setOtpData(prev => ({ ...prev, attempts_left: prev.attempts_left - 1 }));
        
        if (otpData.attempts_left <= 1) {
          setError('Maximum attempts reached. Please start over.');
          setCurrentStep(1);
          setOtpData({ otp_code: '', expires_at: null, attempts_left: 3 });
          setLoading(false);
          return;
        }
        
        setError(`Invalid OTP. ${otpData.attempts_left - 1} attempts remaining.`);
        setLoading(false);
        return;
      }

      if (new Date() > otpData.expires_at) {
        setError('OTP has expired. Please request a new one.');
        setCurrentStep(1);
        setLoading(false);
        return;
      }

      // Generate temporary credentials
      const profile = mockProfiles.find(p => p.id === profileAuth.profile_id);
      const tempUsername = `${profile.name.toLowerCase().replace(/\s+/g, '')}_${profileAuth.profile_id.slice(-3)}`;
      const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      setTempCredentials({
        username: tempUsername,
        password: tempPassword,
        sent_via: profileAuth.verification_method
      });

      // Mock sending credentials
      if (profileAuth.verification_method === 'sms') {
        setSuccess(`Login credentials sent to ${profile.phone.slice(0, -4)}****`);
      } else {
        setSuccess(`Login credentials sent to ${profile.email.replace(/(.{3}).*@/, '$1***@')}`);
      }

      // For demo, show credentials (remove in production)
      console.log('Demo Credentials:', { username: tempUsername, password: tempPassword });
      
      setCurrentStep(3);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login with temporary credentials
  const handleTempCredentialsLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock user creation/login with profile-based account
      const profile = mockProfiles.find(p => p.id === profileAuth.profile_id);
      const mockUser = {
        id: `user_${profileAuth.profile_id}`,
        email: profile.email,
        name: profile.name,
        role: 'user', // Profile-based users get 'user' role by default
        profile_id: profileAuth.profile_id,
        created_via: 'profile_auth'
      };

      login(mockUser);
      setSuccess('Login successful! Welcome to your dashboard.');
    } catch (err) {
      setError('Login failed with temporary credentials.');
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
        style={{ backgroundImage: `url(${APP_CONFIG.images.heroBackground})` }}
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
              <h1 className="text-4xl font-bold mb-2">{APP_CONFIG.appName}</h1>
              <p className="text-xl text-emerald-100">{APP_CONFIG.appTagline}</p>
            </div>
            
            {/* Authentication Methods Info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-emerald-100">Multiple Login Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50">Email & Password (Admin Access)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50">Profile ID with OTP Verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50">SMS & Email Credential Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <span className="text-emerald-50">Role-Based Access Control</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG.aboutUs.clientsServed}</div>
                <div className="text-sm text-emerald-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{APP_CONFIG.aboutUs.uptime}</div>
                <div className="text-sm text-emerald-200">Security Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Authentication Forms */}
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
            
            {/* Authentication Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              {/* Auth Mode Selector */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setAuthMode('email')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      authMode === 'email' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    data-testid="email-auth-tab"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => setAuthMode('profile_id')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      authMode === 'profile_id' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    data-testid="profile-auth-tab"
                  >
                    Profile Login
                  </button>
                </div>
              </div>

              {/* Email/Password Login */}
              {authMode === 'email' && (
                <div data-testid="email-auth-form">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Access</h2>
                    <p className="text-slate-600">Sign in with your admin credentials</p>
                  </div>
                  
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="auth-error">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={emailAuth.email}
                        onChange={(e) => setEmailAuth({...emailAuth, email: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70"
                        placeholder="Enter your email"
                        required
                        data-testid="email-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={emailAuth.password}
                        onChange={(e) => setEmailAuth({...emailAuth, password: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70"
                        placeholder="Enter your password"
                        required
                        data-testid="password-input"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      data-testid="email-login-button"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing In...
                        </div>
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-slate-600 mb-3 font-medium">Demo Admin Credentials:</p>
                    <div className="space-y-2">
                      {APP_CONFIG.demoCredentials.map((cred, index) => (
                        <div key={index} className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{cred.role}:</span> {cred.email} / {cred.password}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile ID Login */}
              {authMode === 'profile_id' && (
                <div data-testid="profile-auth-form">
                  {/* Step 1: Profile ID & Verification Method */}
                  {currentStep === 1 && (
                    <div>
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Access</h2>
                        <p className="text-slate-600">Access your account using Profile ID</p>
                      </div>
                      
                      <form onSubmit={handleProfileIdSubmit} className="space-y-4">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="profile-auth-error">
                            {error}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Profile ID</label>
                          <input
                            type="text"
                            value={profileAuth.profile_id}
                            onChange={(e) => setProfileAuth({...profileAuth, profile_id: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/70"
                            placeholder="Enter your Profile ID"
                            required
                            data-testid="profile-id-input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={profileAuth.full_name}
                            onChange={(e) => setProfileAuth({...profileAuth, full_name: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/70"
                            placeholder="Enter your full name as registered"
                            required
                            data-testid="full-name-input"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Verification Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setProfileAuth({...profileAuth, verification_method: 'sms'})}
                              className={`p-3 border-2 rounded-lg text-center transition-all ${
                                profileAuth.verification_method === 'sms'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              data-testid="sms-verification-option"
                            >
                              <div className="text-lg mb-1">📱</div>
                              <div className="text-sm font-medium">SMS</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfileAuth({...profileAuth, verification_method: 'email'})}
                              className={`p-3 border-2 rounded-lg text-center transition-all ${
                                profileAuth.verification_method === 'email'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              data-testid="email-verification-option"
                            >
                              <div className="text-lg mb-1">📧</div>
                              <div className="text-sm font-medium">Email</div>
                            </button>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-200 disabled:opacity-50 shadow-lg"
                          data-testid="send-otp-button"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending Verification...
                            </div>
                          ) : (
                            'Send Verification Code'
                          )}
                        </button>
                      </form>

                      {/* Demo Profile IDs */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 mb-3 font-medium">Demo Profile IDs:</p>
                        <div className="space-y-1">
                          {mockProfiles.map((profile) => (
                            <div key={profile.id} className="text-xs text-blue-500">
                              <span className="font-medium">{profile.id}:</span> {profile.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: OTP Verification */}
                  {currentStep === 2 && (
                    <div>
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Code</h2>
                        <p className="text-slate-600">Enter the verification code we sent you</p>
                      </div>
                      
                      <form onSubmit={handleOTPVerification} className="space-y-4">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="otp-error">
                            {error}
                          </div>
                        )}

                        {success && (
                          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm" data-testid="otp-success">
                            {success}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                          <input
                            type="text"
                            value={otpData.otp_code}
                            onChange={(e) => setOtpData({...otpData, otp_code: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 text-center text-2xl font-mono tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            required
                            data-testid="otp-input"
                          />
                          <p className="text-xs text-slate-500 mt-1 text-center">
                            {otpData.attempts_left} attempts remaining
                          </p>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-green-200 disabled:opacity-50 shadow-lg"
                          data-testid="verify-otp-button"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Verifying...
                            </div>
                          ) : (
                            'Verify Code'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="w-full text-slate-600 hover:text-slate-800 py-2 text-sm transition-colors"
                          data-testid="back-to-profile-id"
                        >
                          ← Back to Profile ID
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Step 3: Temporary Credentials */}
                  {currentStep === 3 && (
                    <div>
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Granted</h2>
                        <p className="text-slate-600">Your temporary login credentials have been sent</p>
                      </div>
                      
                      <form onSubmit={handleTempCredentialsLogin} className="space-y-4">
                        {success && (
                          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm" data-testid="credentials-success">
                            {success}
                          </div>
                        )}

                        {/* Demo credentials display (remove in production) */}
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials Generated:</p>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <div><strong>Username:</strong> {tempCredentials.username}</div>
                            <div><strong>Password:</strong> {tempCredentials.password}</div>
                            <div><strong>Sent via:</strong> {tempCredentials.sent_via.toUpperCase()}</div>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 shadow-lg"
                          data-testid="login-with-credentials-button"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Logging In...
                            </div>
                          ) : (
                            'Access Dashboard'
                          )}
                        </button>

                        <div className="text-center text-sm text-slate-600">
                          <p>Check your {profileAuth.verification_method === 'sms' ? 'phone' : 'email'} for login credentials</p>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

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
    </div>
  );
};

export default EnhancedAuthSystem;