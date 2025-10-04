// App Configuration - Easily modify app details here
export const APP_CONFIG = {
  // App Identity
  appName: "Utility Manager Pro",
  appTagline: "Complete Utility Management Solution",
  companyName: "UtilityTech Solutions",
  
  // App Description
  description: "Streamline your utility operations with our comprehensive CRM platform designed for modern utility providers and facility managers.",
  
  // Key Features
  keyFeatures: [
    "Real-time Service Monitoring",
    "Automated Billing & Invoicing",
    "Customer Account Management",
    "Payment Processing & Tracking",
    "Analytics & Reporting Dashboard",
    "Multi-utility Support (Electric, Water, Gas, Internet)"
  ],
  
  // About Us
  aboutUs: {
    title: "Leading Utility Management Platform",
    mission: "Empowering utility providers with cutting-edge technology to deliver exceptional service while optimizing operational efficiency.",
    established: "2020",
    clientsServed: "500+",
    uptime: "99.9%",
    supportTeam: "24/7"
  },
  
  // Contact Information
  contact: {
    phone: "+1 (555) 123-4567",
    email: "support@utilitymanager.com",
    website: "www.utilitymanager.com",
    address: "123 Tech Street, Digital City, DC 12345"
  },
  
  // Social Links
  socialLinks: {
    linkedin: "https://linkedin.com/company/utilitytech",
    twitter: "https://twitter.com/utilitytech",
    facebook: "https://facebook.com/utilitytech"
  },
  
  // Visual Assets URLs
  images: {
    logo: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWdufGVufDB8fHx8MTc1OTA0ODE5M3ww&ixlib=rb-4.1.0&q=85&w=200&h=200", // Configurable company logo
    heroBackground: "https://images.unsplash.com/photo-1708086632816-91d5008f4542?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHx1dGlsaXRpZXMlMjBtYW5hZ2VtZW50fGVufDB8fHx8MTc1OTA0ODE5M3ww&ixlib=rb-4.1.0&q=85",
    corporateBuilding: "https://images.pexels.com/photos/34058567/pexels-photo-34058567.jpeg",
    businessMeeting: "https://images.unsplash.com/photo-1758520144420-3e5b22e9b9a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxjb3Jwb3JhdGUlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzU5MDQ4MTk5fDA&ixlib=rb-4.1.0&q=85",
    sidebarBackground: "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc1OTA0ODE5M3ww&ixlib=rb-4.1.0&q=85", // Sidebar background
    dashboardBackground: "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc1OTA0ODE5M3ww&ixlib=rb-4.1.0&q=85" // Dashboard background
  },
  
  // Demo Credentials (for development)
  demoCredentials: [
    { role: 'Super Admin', email: 'superadmin@example.com', password: 'password' },
    { role: 'Admin', email: 'admin@example.com', password: 'password' },
    { role: 'User', email:'user@example.com', password: 'password' }
  ],
  
  // Profile Testing Configuration
  profileConfig: {
    // Set to true to force show all profile buttons for testing
    showAllProfileButtons: true,
    // Set to true to show add profile button for all users
    showAddProfileButton: true
  }
};

// Helper function to get app config
export const getAppConfig = () => APP_CONFIG;

// Helper function to update app config (for admin settings in future)
export const updateAppConfig = (newConfig) => {
  Object.assign(APP_CONFIG, newConfig);
  // In a real app, this would save to backend/localStorage
  localStorage.setItem('appConfig', JSON.stringify(APP_CONFIG));
};

// Load saved config on startup
const savedConfig = localStorage.getItem('appConfig');
if (savedConfig) {
  try {
    const parsedConfig = JSON.parse(savedConfig);
    Object.assign(APP_CONFIG, parsedConfig);
  } catch (error) {
    console.warn('Failed to load saved app config:', error);
  }
}