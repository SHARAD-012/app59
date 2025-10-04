from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from enum import Enum
import json
import io
import base64

ROOT_DIR = Path(__file__).parent

# Dummy data storage (replacing MongoDB for now)
dummy_data = {
    'users': [],
    'profiles': [],
    'accounts': [],
    'plans': [],
    'services': [],
    'invoices': [],
    'payments': [],
    'system_config': {
        'deposit_multiplier': 2.0  # Default multiplier for deposits
    }
}

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = 'demo-secret-key-for-testing'
ALGORITHM = "HS256"

# Utility functions 
def verify_password(plain_password, hashed_password):
    try:
        truncated_password = plain_password[:72] if len(plain_password.encode('utf-8')) > 72 else plain_password
        return pwd_context.verify(truncated_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    try:
        truncated_password = password[:72] if len(password.encode('utf-8')) > 72 else password
        return pwd_context.hash(truncated_password)
    except Exception as e:
        print(f"Password hashing error: {e}")
        return None

# Initialize dummy data
def init_dummy_data():
    # Add demo users
    demo_users = [
        {
            'id': 'user_001',
            'email': 'superadmin@example.com',
            'name': 'Super Admin',
            'role': 'super_admin',
            'password': get_password_hash('password'),
            'profile_id': 'prof_master',
            'department': 'Executive Management',
            'title': 'Chief Executive Officer',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_002',
            'email': 'admin@example.com',
            'name': 'Admin User',
            'role': 'admin',
            'password': get_password_hash('password'),
            'profile_id': 'prof_001',
            'department': 'Administration',
            'title': 'System Administrator',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_003',
            'email': 'user@example.com',
            'name': 'Regular User',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_001',
            'department': 'Operations',
            'title': 'Operations Manager',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_004',
            'email': 'manager@techsolutions.com',
            'name': 'Tech Manager',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_001',
            'department': 'Technology',
            'title': 'Technical Manager',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_005',
            'email': 'staff@greenrestaurant.com',
            'name': 'Restaurant Staff',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_002',
            'department': 'Food Service',
            'title': 'Restaurant Manager',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_006',
            'email': 'chef@greenrestaurant.com',
            'name': 'Head Chef',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_002',
            'department': 'Kitchen',
            'title': 'Executive Chef',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_007',
            'email': 'creative@digitalmarketing.com',
            'name': 'Creative Director',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_003',
            'department': 'Creative',
            'title': 'Creative Director',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_008',
            'email': 'doctor@healthcaresolutions.com',
            'name': 'Dr. Sarah Johnson',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_004',
            'department': 'Medical',
            'title': 'Chief Medical Officer',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_009',
            'email': 'supervisor@manufacturing.com',
            'name': 'Production Supervisor',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_005',
            'department': 'Manufacturing',
            'title': 'Production Supervisor',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_010',
            'email': 'john.smith@personal.com',
            'name': 'John Smith',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_enduser',
            'department': 'Personal',
            'title': 'Individual Customer',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_011',
            'email': 'analyst@techsolutions.com',
            'name': 'Data Analyst',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_001',
            'department': 'Analytics',
            'title': 'Senior Data Analyst',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_012',
            'email': 'support@techsolutions.com',
            'name': 'Support Specialist',
            'role': 'user',
            'password': get_password_hash('password'),
            'profile_id': 'prof_001',
            'department': 'Customer Support',
            'title': 'Support Specialist',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
    ]
    
    # Add demo profiles with master profile references and user tags
    demo_profiles = [
        {
            'id': 'prof_master',
            'name': 'UtilityTech Master Organization',
            'email': 'master@utilitytech.com',
            'phone': '+1-800-UTILITY-MASTER',
            'profession': 'Master Utility Organization',
            'address': '1000 Corporate Blvd, Suite 1200',
            'city': 'San Francisco',
            'state': 'CA',
            'zipcode': '94105',
            'deposit_amount': 0.0,
            'linked_plan_id': None,
            'is_master_profile': True,
            'license_number': 'UTIL-MASTER-2024-001',
            'established_year': '2020',
            'service_area': 'California, Nevada, Arizona',
            'total_customers': 50000,
            'annual_revenue': 50000000.0,
            'is_active': True,
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_001',
            'name': 'Tech Solutions Inc',
            'email': 'contact@techsolutions.com',
            'phone': '+1-555-0101',
            'profession': 'Technology Company',
            'address': '123 Tech Street, Floor 5',
            'city': 'San Francisco',
            'state': 'CA',
            'zipcode': '94102',
            'deposit_amount': 1500.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'department': 'IT Services',
            'employee_count': 25,
            'monthly_usage': 2500.0,
            'is_active': True,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_002',
            'name': 'Green Restaurant Group',
            'email': 'info@greenrestaurant.com',
            'phone': '+1-555-0102',
            'profession': 'Restaurant Chain',
            'address': '456 Food Avenue, Building A',
            'city': 'Los Angeles',
            'state': 'CA',
            'zipcode': '90210',
            'deposit_amount': 2000.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'department': 'Food & Beverage',
            'employee_count': 150,
            'monthly_usage': 8500.0,
            'is_active': True,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_003',
            'name': 'Digital Marketing Hub',
            'email': 'hello@digitalmarketing.com',
            'phone': '+1-555-0103',
            'profession': 'Marketing Agency',
            'address': '789 Creative Blvd, Studio 12',
            'city': 'Los Angeles',
            'state': 'CA',
            'zipcode': '90211',
            'deposit_amount': 1200.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'department': 'Creative Services',
            'employee_count': 35,
            'monthly_usage': 3200.0,
            'is_active': True,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_004',
            'name': 'Healthcare Solutions LLC',
            'email': 'admin@healthcaresolutions.com',
            'phone': '+1-555-0104',
            'profession': 'Healthcare Provider',
            'address': '321 Medical Center Dr',
            'city': 'San Diego',
            'state': 'CA',
            'zipcode': '92101',
            'deposit_amount': 3000.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'department': 'Medical Services',
            'employee_count': 75,
            'monthly_usage': 5500.0,
            'is_active': True,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_005',
            'name': 'Manufacturing Corp',
            'email': 'operations@manufacturing.com',
            'phone': '+1-555-0105',
            'profession': 'Manufacturing',
            'address': '555 Industrial Way',
            'city': 'Sacramento',
            'state': 'CA',
            'zipcode': '95814',
            'deposit_amount': 5000.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'department': 'Production',
            'employee_count': 200,
            'monthly_usage': 15000.0,
            'is_active': True,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'prof_enduser',
            'name': 'John Smith Personal Account',
            'email': 'john.smith@personal.com',
            'phone': '+1-555-0199',
            'profession': 'Individual Consumer',
            'address': '999 Residential St, Apt 5B',
            'city': 'Oakland',
            'state': 'CA',
            'zipcode': '94607',
            'deposit_amount': 200.0,
            'linked_plan_id': None,
            'master_profile_id': 'prof_master',
            'end_user': True,
            'account_type': 'Personal',
            'monthly_usage': 350.0,
            'is_active': True,
            'created_by': 'user_010',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
    ]
    
    # Enhanced demo service plans with new fields (Base Plans - plan_type: 1, Addon Plans - plan_type: 2)
    demo_plans = [
        # Base Plans (plan_type = 1)
        {
            'id': 'plan_001',
            'name': 'Enterprise Electricity Pro',
            'description': 'High-capacity electricity plan for large businesses',
            'plan_type': 1,  # Base Plan
            'service_type': 'electricity',
            'charge_type': 'recurring',
            'charge_category': 'utility',
            'base_price': 250.0,
            'setup_fee': 100.0,
            'charges': 250.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 2.0,
            'features': ['24/7 Priority Support', 'Dedicated Account Manager', 'Green Energy Option', 'Load Balancing'],
            'terms_conditions': 'Enterprise-level service agreement with SLA guarantees',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,  # for end users
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'plan_002',
            'name': 'Admin Internet Management',
            'description': 'Special internet plan for admin management',
            'plan_type': 1,  # Base Plan
            'service_type': 'internet',
            'charge_type': 'recurring',
            'charge_category': 'administrative',
            'base_price': 120.0,
            'setup_fee': 50.0,
            'charges': 120.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.5,
            'features': ['Admin Dashboard Access', 'Management Tools', '99.9% Uptime SLA', 'Priority Support'],
            'terms_conditions': 'Administrative service agreement',
            'is_proration_enabled': False,
            'status': 'active',
            'is_for_admin': True,  # for admins
            'assigned_to_role': 'admin',
            'created_for_admin': 'user_002',
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'plan_003',
            'name': 'Commercial Water Supply Plus',
            'description': 'Enhanced water supply for commercial operations',
            'plan_type': 1,  # Base Plan
            'service_type': 'water',
            'charge_type': 'recurring',
            'charge_category': 'utility',
            'base_price': 85.0,
            'setup_fee': 25.0,
            'charges': 85.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 2.5,
            'features': ['High Pressure System', 'Quality Testing', 'Emergency Support', 'Usage Analytics'],
            'terms_conditions': 'Monthly service with consumption-based billing',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        
        # Addon Plans (plan_type = 2)
        {
            'id': 'addon_001',
            'name': 'Premium Support Addon',
            'description': '24/7 premium technical support with dedicated engineer',
            'plan_type': 2,  # Addon Plan
            'service_type': 'electricity',
            'charge_type': 'recurring',
            'charge_category': 'service',
            'base_price': 50.0,
            'setup_fee': 0.0,
            'charges': 50.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['24/7 Premium Support', 'Dedicated Engineer', '2-Hour Response Time', 'Priority Queue'],
            'terms_conditions': 'Premium support addon for electricity services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'addon_002',
            'name': 'Advanced Monitoring Addon',
            'description': 'Real-time monitoring and analytics dashboard',
            'plan_type': 2,  # Addon Plan
            'service_type': 'electricity',
            'charge_type': 'recurring',
            'charge_category': 'service',
            'base_price': 30.0,
            'setup_fee': 25.0,
            'charges': 30.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['Real-time Monitoring', 'Custom Analytics Dashboard', 'Usage Forecasting', 'Automated Alerts'],
            'terms_conditions': 'Advanced monitoring addon for electricity services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'addon_003',
            'name': 'Green Energy Addon',
            'description': '100% renewable energy sourcing with carbon credits',
            'plan_type': 2,  # Addon Plan
            'service_type': 'electricity',
            'charge_type': 'recurring',
            'charge_category': 'utility',
            'base_price': 40.0,
            'setup_fee': 0.0,
            'charges': 40.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['100% Renewable Energy', 'Carbon Credits', 'Green Certification', 'Environmental Reports'],
            'terms_conditions': 'Green energy addon for electricity services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'addon_004',
            'name': 'High-Speed Internet Addon',
            'description': 'Gigabit internet speed upgrade with dedicated bandwidth',
            'plan_type': 2,  # Addon Plan
            'service_type': 'internet',
            'charge_type': 'recurring',
            'charge_category': 'service',
            'base_price': 75.0,
            'setup_fee': 100.0,
            'charges': 75.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['Gigabit Speed', 'Dedicated Bandwidth', 'Low Latency', 'Static IP Address'],
            'terms_conditions': 'High-speed internet addon for internet services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': True,
            'assigned_to_role': 'admin',
            'created_for_admin': 'user_002',
            'created_by': 'user_001',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'addon_005',
            'name': 'Water Quality Plus Addon',
            'description': 'Advanced water filtration and quality monitoring',
            'plan_type': 2,  # Addon Plan
            'service_type': 'water',
            'charge_type': 'recurring',
            'charge_category': 'service',
            'base_price': 25.0,
            'setup_fee': 50.0,
            'charges': 25.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['Advanced Filtration', 'Quality Monitoring', 'Purity Reports', 'Automated Testing'],
            'terms_conditions': 'Water quality addon for water services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'addon_006',
            'name': 'Emergency Backup Addon',
            'description': 'Emergency backup service with instant switchover',
            'plan_type': 2,  # Addon Plan
            'service_type': 'water',
            'charge_type': 'recurring',
            'charge_category': 'service',
            'base_price': 35.0,
            'setup_fee': 75.0,
            'charges': 35.0,
            'billing_frequency': 'monthly',
            'start_date': datetime.now(timezone.utc),
            'end_date': datetime.now(timezone.utc) + timedelta(days=365),
            'deposit_multiplier': 1.0,
            'features': ['Emergency Backup', 'Instant Switchover', '24/7 Monitoring', 'Automatic Failover'],
            'terms_conditions': 'Emergency backup addon for water services',
            'is_proration_enabled': True,
            'status': 'active',
            'is_for_admin': False,
            'assigned_to_role': 'user',
            'created_for_admin': None,
            'created_by': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
    ]
    
    # Add demo accounts with enhanced financial statistics
    demo_accounts = [
        {
            'id': 'acc_001',
            'profile_id': 'prof_001',
            'name': 'Tech Solutions Main Office',
            'email': 'billing@techsolutions.com',
            'phone': '+1-555-0101',
            'address': '123 Tech Street',
            'city': 'San Francisco',
            'state': 'CA',
            'zipcode': '94102',
            'business_type': 'Technology',
            'tax_id': '12-3456789',
            'deposit_paid': 1500.0,
            'is_active': True,
            'user_id': 'user_002',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
            # Enhanced Account Statistics
            'total_deposit': 2500.0,
            'monthly_billing': 1245.75,
            'active_services': 8,
            'outstanding_balance': 187.25,
            'credit_balance': 450.50,
            'total_credit': 2800.00,
            'credit_limit': 5000.00,
            'total_debit': 15420.80,
            'total_payment': 14820.55,
            'last_payment': 325.75,
            'last_payment_date': datetime.now(timezone.utc) - timedelta(days=5),
            'total_user_deposit': 3250.00
        }
    ]
    
    # Add comprehensive demo services with categories
    demo_services = [
        # Master Services - System level services managed by super admin/master
        {
            'id': 'master_serv_001',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Master Grid Connection',
            'service_description': 'Primary grid connection for entire network',
            'service_category': 'master_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 2500.0,
            'start_date': datetime.now(timezone.utc),
            'end_date': None,
            'service_address': 'Master Grid Station, San Francisco, CA',
            'installation_notes': 'Main grid connection with redundancy',
            'meter_number': 'GRID-MASTER-001',
            'connection_type': 'high_voltage',
            'capacity': '10 MW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_001',
            'assigned_to': 'master',
            'priority': 'critical',
            'last_reading': 125420.5,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'master_serv_002',
            'account_id': 'acc_001', 
            'plan_id': 'plan_003',
            'service_name': 'Master Water Distribution',
            'service_description': 'Central water distribution system',
            'service_category': 'master_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 1800.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=90),
            'end_date': None,
            'service_address': 'Water Treatment Plant, San Francisco, CA',
            'installation_notes': 'Main distribution network with monitoring',
            'meter_number': 'WATER-MASTER-001',
            'connection_type': 'distribution',
            'capacity': '50,000 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_001',
            'assigned_to': 'master',
            'priority': 'critical',
            'last_reading': 485230.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=90),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'master_serv_003',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Master Internet Infrastructure',
            'service_description': 'Core internet infrastructure management',
            'service_category': 'master_service',
            'service_type': 'internet',
            'custom_price': 5000.0,
            'monthly_charges': 5000.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=180),
            'end_date': None,
            'service_address': 'Data Center, San Francisco, CA',
            'installation_notes': 'Fiber backbone with redundancy',
            'meter_number': 'NET-MASTER-001',
            'connection_type': 'fiber_backbone',
            'capacity': '10 Gbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_001',
            'assigned_to': 'master',
            'priority': 'high',
            'last_reading': 8542.8,
            'created_at': datetime.now(timezone.utc) - timedelta(days=180),
            'updated_at': datetime.now(timezone.utc)
        },

        # Self Services - Services managed by current admin user
        {
            'id': 'self_serv_001',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Admin Office Electricity',
            'service_description': 'Electricity service for admin office',
            'service_category': 'self_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 245.50,
            'start_date': datetime.now(timezone.utc),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Standard office electrical connection',
            'meter_number': 'ELC-ADMIN-001',
            'connection_type': 'single_phase',
            'capacity': '50 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'medium',
            'last_reading': 1240.5,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'self_serv_002',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Admin Office Water',
            'service_description': 'Water supply for admin facilities',
            'service_category': 'self_service',
            'service_type': 'water',
            'custom_price': 95.0,
            'monthly_charges': 95.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=30),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Water connection with basic monitoring',
            'meter_number': 'WTR-ADMIN-001',
            'connection_type': 'municipal',
            'capacity': '200 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'medium',
            'last_reading': 850.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=30),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'self_serv_003',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Admin Internet Service',
            'service_description': 'High-speed internet for administrative tasks',
            'service_category': 'self_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 120.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=45),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Dedicated business line with SLA',
            'meter_number': 'NET-ADMIN-001',
            'connection_type': 'fiber',
            'capacity': '500 Mbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'high',
            'last_reading': 2542.1,
            'created_at': datetime.now(timezone.utc) - timedelta(days=45),
            'updated_at': datetime.now(timezone.utc)
        },

        # User Services - Services for end users with various statuses
        {
            'id': 'user_serv_001',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Tech Solutions Electricity',
            'service_description': 'Electricity service for Tech Solutions Inc',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 450.75,
            'start_date': datetime.now(timezone.utc) - timedelta(days=60),
            'end_date': None,
            'service_address': '123 Tech Street, San Francisco, CA',
            'installation_notes': 'Three-phase connection for tech equipment',
            'meter_number': 'ELC-TECH-001',
            'connection_type': 'three_phase',
            'capacity': '75 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 5420.3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=60),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_002',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Restaurant Water Service',
            'service_description': 'Water service for Green Restaurant Group',
            'service_category': 'user_service',
            'service_type': 'water',
            'custom_price': 185.25,
            'monthly_charges': 185.25,
            'start_date': datetime.now(timezone.utc) - timedelta(days=120),
            'end_date': None,
            'service_address': '456 Food Avenue, Los Angeles, CA',
            'installation_notes': 'High-capacity line for restaurant use',
            'meter_number': 'WTR-REST-001',
            'connection_type': 'commercial',
            'capacity': '1,000 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 12850.7,
            'created_at': datetime.now(timezone.utc) - timedelta(days=120),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_003',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Marketing Hub Internet',
            'service_description': 'High-speed internet for Digital Marketing Hub',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 325.80,
            'start_date': datetime.now(timezone.utc) - timedelta(days=90),
            'end_date': None,
            'service_address': '789 Creative Blvd, Los Angeles, CA',
            'installation_notes': 'Fiber connection with static IP',
            'meter_number': 'NET-MKT-001',
            'connection_type': 'fiber',
            'capacity': '1 Gbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 8542.1,
            'created_at': datetime.now(timezone.utc) - timedelta(days=90),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_004',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Healthcare Power Service',
            'service_description': 'Electricity for Healthcare Solutions LLC',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': 1250.50,
            'monthly_charges': 1250.50,
            'start_date': datetime.now(timezone.utc) - timedelta(days=150),
            'end_date': None,
            'service_address': '321 Medical Center Dr, San Diego, CA',
            'installation_notes': 'Hospital-grade connection with backup',
            'meter_number': 'ELC-HLTH-001',
            'connection_type': 'three_phase_backup',
            'capacity': '200 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'critical',
            'last_reading': 18750.8,
            'created_at': datetime.now(timezone.utc) - timedelta(days=150),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_005',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Manufacturing Power Grid',
            'service_description': 'High-capacity electricity for Manufacturing Corp',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 2150.75,
            'start_date': datetime.now(timezone.utc) - timedelta(days=200),
            'end_date': None,
            'service_address': '555 Industrial Way, Sacramento, CA',
            'installation_notes': 'Industrial-grade three-phase with monitoring',
            'meter_number': 'ELC-MFG-001',
            'connection_type': 'industrial',
            'capacity': '500 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 45820.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=200),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_006',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Retail Chain Water',
            'service_description': 'Water service for Metro Retail Chain',
            'service_category': 'user_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 875.25,
            'start_date': datetime.now(timezone.utc) - timedelta(days=75),
            'end_date': None,
            'service_address': '888 Shopping Center Blvd, San Jose, CA',
            'installation_notes': 'Multiple connection points for retail complex',
            'meter_number': 'WTR-RETAIL-001',
            'connection_type': 'commercial_multi',
            'capacity': '2,500 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 22100.5,
            'created_at': datetime.now(timezone.utc) - timedelta(days=75),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_007',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Academy Power Service',
            'service_description': 'Electricity service for Sunrise Academy',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 650.40,
            'start_date': datetime.now(timezone.utc) - timedelta(days=180),
            'end_date': None,
            'service_address': '222 Education Drive, Fresno, CA',
            'installation_notes': 'Educational facility connection',
            'meter_number': 'ELC-EDU-001',
            'connection_type': 'educational',
            'capacity': '100 kW',
            'is_active': False, # Deactivated service
            'status': 'suspended',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'low',
            'last_reading': 9850.3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=180),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=30)
        },
        {
            'id': 'user_serv_008',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Hotel Complex Internet',
            'service_description': 'Internet service for Grand Plaza Hotel',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 1450.90,
            'start_date': datetime.now(timezone.utc) - timedelta(days=100),
            'end_date': None,
            'service_address': '777 Hospitality Row, San Francisco, CA',
            'installation_notes': 'High-speed wifi infrastructure for hotel',
            'meter_number': 'NET-HOTEL-001',
            'connection_type': 'hospitality_fiber',
            'capacity': '2 Gbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 15420.7,
            'created_at': datetime.now(timezone.utc) - timedelta(days=100),
            'updated_at': datetime.now(timezone.utc)
        },
        # Additional Self Services
        {
            'id': 'self_serv_004',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Admin Backup Power',
            'service_description': 'Backup electricity for admin operations',
            'service_category': 'self_service',
            'service_type': 'electricity',
            'custom_price': 180.0,
            'monthly_charges': 180.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=20),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Emergency backup power system',
            'meter_number': 'ELC-ADMIN-002',
            'connection_type': 'backup',
            'capacity': '25 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'high',
            'last_reading': 450.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=20),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'self_serv_005',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Admin Fire Safety Water',
            'service_description': 'Fire safety water system for admin building',
            'service_category': 'self_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 65.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=15),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Fire suppression system water line',
            'meter_number': 'WTR-ADMIN-002',
            'connection_type': 'safety',
            'capacity': '100 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'critical',
            'last_reading': 125.8,
            'created_at': datetime.now(timezone.utc) - timedelta(days=15),
            'updated_at': datetime.now(timezone.utc)
        },
        # Additional User Services
        {
            'id': 'user_serv_009',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Shopping Mall Electricity',
            'service_description': 'Main power supply for Metro Shopping Complex',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 2850.75,
            'start_date': datetime.now(timezone.utc) - timedelta(days=45),
            'end_date': None,
            'service_address': '999 Commerce Ave, Los Angeles, CA',
            'installation_notes': 'High-capacity mall electrical grid',
            'meter_number': 'ELC-MALL-001',
            'connection_type': 'commercial',
            'capacity': '750 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 68420.3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=45),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_010',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'University Campus Internet',
            'service_description': 'Campus-wide internet for State University',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': 2200.0,
            'monthly_charges': 2200.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=80),
            'end_date': None,
            'service_address': '500 University Drive, Berkeley, CA',
            'installation_notes': 'High-speed campus network infrastructure',
            'meter_number': 'NET-UNI-001',
            'connection_type': 'educational',
            'capacity': '5 Gbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 25840.1,
            'created_at': datetime.now(timezone.utc) - timedelta(days=80),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_011',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Sports Complex Water',
            'service_description': 'Water supply for Metro Sports Complex',
            'service_category': 'user_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 750.25,
            'start_date': datetime.now(timezone.utc) - timedelta(days=35),
            'end_date': None,
            'service_address': '300 Athletic Way, San Jose, CA',
            'installation_notes': 'Pool and facility water systems',
            'meter_number': 'WTR-SPORTS-001',
            'connection_type': 'recreational',
            'capacity': '3,000 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 18450.7,
            'created_at': datetime.now(timezone.utc) - timedelta(days=35),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_012',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Airport Terminal Power',
            'service_description': 'Electricity for Regional Airport Terminal',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': 4200.0,
            'monthly_charges': 4200.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=120),
            'end_date': None,
            'service_address': '1200 Airport Blvd, San Francisco, CA',
            'installation_notes': 'Critical infrastructure power supply',
            'meter_number': 'ELC-AIRPORT-001',
            'connection_type': 'critical',
            'capacity': '1.2 MW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'critical',
            'last_reading': 98750.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=120),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_013',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Residential Complex Water',
            'service_description': 'Water supply for Sunset Residential Complex',
            'service_category': 'user_service',
            'service_type': 'water',
            'custom_price': 1250.0,
            'monthly_charges': 1250.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=60),
            'end_date': None,
            'service_address': '850 Sunset Ave, Oakland, CA',
            'installation_notes': 'Multi-building residential water supply',
            'meter_number': 'WTR-RES-001',
            'connection_type': 'residential',
            'capacity': '5,000 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 42850.1,
            'created_at': datetime.now(timezone.utc) - timedelta(days=60),
            'updated_at': datetime.now(timezone.utc)
        },
        
        # Additional Self Services for Admin (user_002) with Addon Plans
        {
            'id': 'self_serv_006',
            'account_id': 'acc_001',
            'plan_id': 'addon_001', # Premium Support Addon
            'service_name': 'Admin Premium Support',
            'service_description': '24/7 premium support for admin operations',
            'service_category': 'self_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 50.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=10),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Premium support addon activated',
            'meter_number': 'ADDON-ADMIN-001',
            'connection_type': 'addon_service',
            'capacity': '24/7 Support',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'high',
            'last_reading': None,
            'is_addon': True,
            'parent_service_id': 'self_serv_001', # Linked to main electricity service
            'created_at': datetime.now(timezone.utc) - timedelta(days=10),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'self_serv_007',
            'account_id': 'acc_001',
            'plan_id': 'addon_002', # Advanced Monitoring Addon
            'service_name': 'Admin Advanced Monitoring',
            'service_description': 'Real-time monitoring for admin electricity service',
            'service_category': 'self_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 30.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=15),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Advanced monitoring system installed',
            'meter_number': 'MON-ADMIN-001',
            'connection_type': 'addon_service',
            'capacity': 'Real-time Analytics',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'medium',
            'last_reading': None,
            'is_addon': True,
            'parent_service_id': 'self_serv_001',
            'created_at': datetime.now(timezone.utc) - timedelta(days=15),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'self_serv_008',
            'account_id': 'acc_001',
            'plan_id': 'addon_005', # Water Quality Plus Addon
            'service_name': 'Admin Water Quality Plus',
            'service_description': 'Advanced water filtration for admin facilities',
            'service_category': 'self_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 25.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=20),
            'end_date': None,
            'service_address': '123 Admin Street, San Francisco, CA',
            'installation_notes': 'Water quality system addon',
            'meter_number': 'WQ-ADMIN-001',
            'connection_type': 'addon_service',
            'capacity': 'Quality Monitoring',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'admin',
            'priority': 'medium',
            'last_reading': None,
            'is_addon': True,
            'parent_service_id': 'self_serv_002',
            'created_at': datetime.now(timezone.utc) - timedelta(days=20),
            'updated_at': datetime.now(timezone.utc)
        },

        # Additional User Services managed by Admin (user_002)
        {
            'id': 'user_serv_014',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Office Complex Electricity',
            'service_description': 'Main electricity supply for office complex',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 850.75,
            'start_date': datetime.now(timezone.utc) - timedelta(days=45),
            'end_date': None,
            'service_address': '456 Business Ave, San Francisco, CA',
            'installation_notes': 'High-capacity office electrical system',
            'meter_number': 'ELC-OFF-001',
            'connection_type': 'commercial',
            'capacity': '150 kW',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 15420.8,
            'created_at': datetime.now(timezone.utc) - timedelta(days=45),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_015',
            'account_id': 'acc_001',
            'plan_id': 'addon_001', # Premium Support Addon for user service
            'service_name': 'Office Premium Support Addon',
            'service_description': '24/7 premium support for office complex',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 50.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=30),
            'end_date': None,
            'service_address': '456 Business Ave, San Francisco, CA',
            'installation_notes': 'Premium support addon for office electricity',
            'meter_number': 'SUPP-OFF-001',
            'connection_type': 'addon_service',
            'capacity': '24/7 Support',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': None,
            'is_addon': True,
            'parent_service_id': 'user_serv_014',
            'created_at': datetime.now(timezone.utc) - timedelta(days=30),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_016',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Corporate Internet Hub',
            'service_description': 'High-speed internet for corporate operations',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 450.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=60),
            'end_date': None,
            'service_address': '789 Corporate Blvd, San Francisco, CA',
            'installation_notes': 'Dedicated fiber for corporate use',
            'meter_number': 'NET-CORP-001',
            'connection_type': 'fiber',
            'capacity': '2 Gbps',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'high',
            'last_reading': 8520.3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=60),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_017',
            'account_id': 'acc_001',
            'plan_id': 'addon_004', # High-Speed Internet Addon
            'service_name': 'Corporate Gigabit Upgrade',
            'service_description': 'Gigabit speed upgrade for corporate internet',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 75.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=25),
            'end_date': None,
            'service_address': '789 Corporate Blvd, San Francisco, CA',
            'installation_notes': 'Gigabit speed upgrade addon',
            'meter_number': 'GIG-CORP-001',
            'connection_type': 'addon_service',
            'capacity': 'Gigabit Speed',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': None,
            'is_addon': True,
            'parent_service_id': 'user_serv_016',
            'created_at': datetime.now(timezone.utc) - timedelta(days=25),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'id': 'user_serv_018',
            'account_id': 'acc_001',
            'plan_id': 'plan_003',
            'service_name': 'Retail Water Supply',
            'service_description': 'Commercial water supply for retail stores',
            'service_category': 'user_service',
            'service_type': 'water',
            'custom_price': None,
            'monthly_charges': 320.50,
            'start_date': datetime.now(timezone.utc) - timedelta(days=40),
            'end_date': None,
            'service_address': '321 Retail Plaza, San Francisco, CA',
            'installation_notes': 'Multi-outlet water supply system',
            'meter_number': 'WTR-RET-001',
            'connection_type': 'commercial',
            'capacity': '800 gallons/day',
            'is_active': True,
            'status': 'active',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'medium',
            'last_reading': 5240.2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=40),
            'updated_at': datetime.now(timezone.utc)
        },
        
        # Some Inactive/Suspended Services to test status filtering
        {
            'id': 'user_serv_019',
            'account_id': 'acc_001',
            'plan_id': 'plan_001',
            'service_name': 'Warehouse Electricity - Suspended',
            'service_description': 'Electricity service for warehouse (suspended)',
            'service_category': 'user_service',
            'service_type': 'electricity',
            'custom_price': None,
            'monthly_charges': 650.25,
            'start_date': datetime.now(timezone.utc) - timedelta(days=90),
            'end_date': None,
            'service_address': '999 Warehouse District, San Francisco, CA',
            'installation_notes': 'Suspended due to maintenance',
            'meter_number': 'ELC-WARE-001',
            'connection_type': 'industrial',
            'capacity': '200 kW',
            'is_active': True,
            'status': 'suspended',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'low',
            'last_reading': 25420.1,
            'created_at': datetime.now(timezone.utc) - timedelta(days=90),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=5)
        },
        {
            'id': 'user_serv_020',
            'account_id': 'acc_001',
            'plan_id': 'plan_002',
            'service_name': 'Branch Office Internet - Cancelled',
            'service_description': 'Internet service for branch office (cancelled)',
            'service_category': 'user_service',
            'service_type': 'internet',
            'custom_price': None,
            'monthly_charges': 180.0,
            'start_date': datetime.now(timezone.utc) - timedelta(days=120),
            'end_date': datetime.now(timezone.utc) - timedelta(days=10),
            'service_address': '555 Branch St, Oakland, CA',
            'installation_notes': 'Service cancelled - office closure',
            'meter_number': 'NET-BRANCH-001',
            'connection_type': 'fiber',
            'capacity': '500 Mbps',
            'is_active': False,
            'status': 'terminated',
            'managed_by': 'user_002',
            'assigned_to': 'user',
            'priority': 'low',
            'last_reading': 1520.3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=120),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=10)
        }
    ]
    
    # Add demo bill cycles
    demo_bill_cycles = [
        {
            'id': 'cycle_001',
            'name': 'Monthly Utility Cycle',
            'frequency': 'monthly',
            'day_of_cycle': 1
        },
        {
            'id': 'cycle_002', 
            'name': 'Quarterly Business Cycle',
            'frequency': 'quarterly',
            'day_of_cycle': 15
        },
        {
            'id': 'cycle_003',
            'name': 'Weekly Service Cycle', 
            'frequency': 'weekly',
            'day_of_cycle': 1
        }
    ]
    
    # Add demo bill schedules
    demo_bill_schedules = [
        {
            'id': 'schedule_001',
            'bill_cycle_id': 'cycle_001',
            'bill_run_name': 'January 2024 Utility Bills',
            'bill_date': datetime.now(timezone.utc),
            'status': 'completed',
            'account_count': 5,
            'created_at': datetime.now(timezone.utc) - timedelta(days=30),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=25)
        },
        {
            'id': 'schedule_002',
            'bill_cycle_id': 'cycle_001',
            'bill_run_name': 'February 2024 Utility Bills',
            'bill_date': datetime.now(timezone.utc) + timedelta(days=5),
            'status': 'pending',
            'account_count': 6,
            'created_at': datetime.now(timezone.utc) - timedelta(days=5),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=5)
        },
        {
            'id': 'schedule_003',
            'bill_cycle_id': 'cycle_002',
            'bill_run_name': 'Q1 2024 Business Bills',
            'bill_date': datetime.now(timezone.utc) + timedelta(days=10),
            'status': 'processing',
            'account_count': 3,
            'created_at': datetime.now(timezone.utc) - timedelta(days=2),
            'updated_at': datetime.now(timezone.utc) - timedelta(days=1)
        }
    ]
    
    # Add demo bill runs
    demo_bill_runs = [
        {
            'id': 'run_001',
            'bill_schedule_id': 'schedule_001',
            'bill_cycle_id': 'cycle_001',
            'run_name': 'January 2024 Utility Bills',
            'run_date': datetime.now(timezone.utc) - timedelta(days=30),
            'status': 'completed',
            'total_accounts': 5,
            'bills_generated': 5,
            'bills_approved': 4,
            'created_at': datetime.now(timezone.utc) - timedelta(days=30)
        },
        {
            'id': 'run_002', 
            'bill_schedule_id': 'schedule_002',
            'bill_cycle_id': 'cycle_001',
            'run_name': 'February 2024 Utility Bills',
            'run_date': datetime.now(timezone.utc) + timedelta(days=5),
            'status': 'processing',
            'total_accounts': 6,
            'bills_generated': 2,
            'bills_approved': 0,
            'created_at': datetime.now(timezone.utc) - timedelta(days=5)
        },
        {
            'id': 'run_003',
            'bill_schedule_id': 'schedule_003', 
            'bill_cycle_id': 'cycle_002',
            'run_name': 'Q1 2024 Business Bills',
            'run_date': datetime.now(timezone.utc) + timedelta(days=10),
            'status': 'processing',
            'total_accounts': 3,
            'bills_generated': 3,
            'bills_approved': 2,
            'created_at': datetime.now(timezone.utc) - timedelta(days=2)
        }
    ]
    
    # Add demo billed accounts
    demo_billed_accounts = [
        {
            'id': 'bill_acc_001',
            'bill_run_id': 'run_001',
            'account_id': 'acc_001',
            'account_name': 'Tech Solutions Inc',
            'charges': 295.50,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=30),
            'due_date': datetime.now(timezone.utc) - timedelta(days=15),
            'status': 'approved',
            'created_at': datetime.now(timezone.utc) - timedelta(days=30)
        },
        {
            'id': 'bill_acc_002',
            'bill_run_id': 'run_003',
            'account_id': 'acc_001', 
            'account_name': 'Tech Solutions Inc',
            'charges': 425.75,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=2),
            'due_date': datetime.now(timezone.utc) + timedelta(days=28),
            'status': 'billed',
            'created_at': datetime.now(timezone.utc) - timedelta(days=2)
        },
        {
            'id': 'bill_acc_003',
            'bill_run_id': 'run_003',
            'account_id': 'acc_001',
            'account_name': 'Green Restaurant Group', 
            'charges': 567.25,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=2),
            'due_date': datetime.now(timezone.utc) + timedelta(days=28),
            'status': 'approved',
            'created_at': datetime.now(timezone.utc) - timedelta(days=2)
        },
        {
            'id': 'bill_acc_004',
            'bill_run_id': 'run_003',
            'account_id': 'acc_001',
            'account_name': 'Digital Marketing Hub',
            'charges': 234.80,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=2), 
            'due_date': datetime.now(timezone.utc) + timedelta(days=28),
            'status': 'billed',
            'created_at': datetime.now(timezone.utc) - timedelta(days=2)
        },
        {
            'id': 'bill_acc_005',
            'bill_run_id': 'run_002',
            'account_id': 'acc_001',
            'account_name': 'Tech Solutions Inc',
            'charges': 189.99,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=1), 
            'due_date': datetime.now(timezone.utc) + timedelta(days=29),
            'status': 'billed',
            'created_at': datetime.now(timezone.utc) - timedelta(days=1)
        },
        {
            'id': 'bill_acc_006',
            'bill_run_id': 'run_002',
            'account_id': 'acc_001',
            'account_name': 'Green Restaurant Group',
            'charges': 456.78,
            'bill_date': datetime.now(timezone.utc) - timedelta(days=1), 
            'due_date': datetime.now(timezone.utc) + timedelta(days=29),
            'status': 'billed',
            'created_at': datetime.now(timezone.utc) - timedelta(days=1)
        }
    ]

    # Add demo invoices with multiple services
    demo_invoices = [
        {
            'id': 'inv_demo_001',
            'invoice_number': 'INV-000789',
            'account_name': 'Tech Solutions Inc',
            'account_id': 'acc_001',
            'total_amount': 2076.60,
            'subtotal': 1920.00,
            'tax_amount': 156.60,
            'discount_amount': 0.00,
            'status': 'overdue',
            'paid_status': False,
            'days_overdue': 15,
            'created_at': datetime.now(timezone.utc) - timedelta(days=45),
            'issue_date': datetime.now(timezone.utc) - timedelta(days=45),
            'due_date': datetime.now(timezone.utc) - timedelta(days=15),
            'month': 'March 2024',
            'category': 'utility',
            'items': [
                {
                    'description': 'Electricity Service - Enterprise Pro',
                    'quantity': 1,
                    'amount': 195.25,
                    'service_id': 'srv_001'
                },
                {
                    'description': 'Water Service - Commercial Plus',
                    'quantity': 1, 
                    'amount': 133.10,
                    'service_id': 'srv_002'
                },
                {
                    'description': 'Gas Service - Business Standard',
                    'quantity': 1,
                    'amount': 1748.25,
                    'service_id': 'srv_003'
                },
                {
                    'description': 'Internet Service - High-Speed Fiber',
                    'quantity': 1,
                    'amount': 450.00,
                    'service_id': 'srv_004'
                },
                {
                    'description': 'Waste Management Service',
                    'quantity': 1,
                    'amount': 85.75,
                    'service_id': 'srv_005'
                },
                {
                    'description': 'Security System Monitoring',
                    'quantity': 1,
                    'amount': 120.50,
                    'service_id': 'srv_006'
                }
            ]
        },
        {
            'id': 'inv_demo_002',
            'invoice_number': 'INV-000790',
            'account_name': 'Green Restaurant Group',
            'account_id': 'acc_001', 
            'total_amount': 856.30,
            'subtotal': 792.00,
            'tax_amount': 64.30,
            'discount_amount': 0.00,
            'status': 'paid',
            'paid_status': True,
            'days_overdue': 0,
            'created_at': datetime.now(timezone.utc) - timedelta(days=30),
            'issue_date': datetime.now(timezone.utc) - timedelta(days=30),
            'due_date': datetime.now(timezone.utc) - timedelta(days=15),
            'month': 'March 2024',
            'category': 'utility',
            'items': [
                {
                    'description': 'Electricity Service - Commercial',
                    'quantity': 1,
                    'amount': 345.75,
                    'service_id': 'srv_001'
                },
                {
                    'description': 'Water Service - High Volume',
                    'quantity': 1,
                    'amount': 256.25,
                    'service_id': 'srv_002'
                },
                {
                    'description': 'Waste Management - Restaurant',
                    'quantity': 1,
                    'amount': 190.00,
                    'service_id': 'srv_005'
                }
            ]
        }
    ]

    dummy_data.update({
        'users': demo_users,
        'profiles': demo_profiles,
        'plans': demo_plans,
        'accounts': demo_accounts,
        'services': demo_services,
        'invoices': demo_invoices,
        'payments': [],
        'bill_cycles': demo_bill_cycles,
        'bill_schedules': demo_bill_schedules,
        'bill_runs': demo_bill_runs,
        'billed_accounts': demo_billed_accounts
    })

# Initialize dummy data on startup
try:
    init_dummy_data()
    print("✅ Enhanced dummy data initialized successfully")
except Exception as e:
    print(f"❌ Error initializing dummy data: {e}")

# Create the main app without a prefix
app = FastAPI(title="Enhanced Utility Manager CRM API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enhanced Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"

class ServiceType(str, Enum):
    ELECTRICITY = "electricity"
    WATER = "water"
    GAS = "gas"
    INTERNET = "internet"
    SAAS = "saas"
    FACILITY = "facility"
    OTHER = "other"

class PlanType(int, Enum):
    BASE_PLAN = 1  # Base plans
    ADDON_PLAN = 2  # Addon plans

class ChargeType(str, Enum):
    ARREAR = "arrear"
    ADVANCE = "advance"
    ONE_TIME = "one_time"
    RECURRING = "recurring"

class ChargeCategory(str, Enum):
    UTILITY = "utility"
    ADMINISTRATIVE = "administrative"
    SERVICE = "service"
    MAINTENANCE = "maintenance"
    INSTALLATION = "installation"
    OTHER = "other"

class BillingFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    CUSTOM = "custom"

class PlanStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    SUSPENDED = "suspended"

class ServiceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"
    TERMINATED = "terminated"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# Enhanced Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Enhanced Profile Models
class ProfileBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    profession: str
    address: str
    city: str
    state: str
    zipcode: str
    deposit_amount: float = 0.0
    linked_plan_id: Optional[str] = None
    is_active: bool = True

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profession: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    deposit_amount: Optional[float] = None
    linked_plan_id: Optional[str] = None
    is_active: Optional[bool] = None

class ProfileResponse(ProfileBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    linked_plan: Optional[Dict] = None

# Enhanced Account Models
class AccountBase(BaseModel):
    profile_id: str
    name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    zipcode: str
    business_type: Optional[str] = None
    tax_id: Optional[str] = None
    deposit_paid: float = 0.0
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    business_type: Optional[str] = None
    tax_id: Optional[str] = None
    deposit_paid: Optional[float] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    profile: Optional[ProfileResponse] = None
    # Enhanced Account Statistics
    total_deposit: Optional[float] = 0.0
    monthly_billing: Optional[float] = 0.0
    active_services: Optional[int] = 0
    outstanding_balance: Optional[float] = 0.0
    credit_balance: Optional[float] = 0.0
    total_credit: Optional[float] = 0.0
    credit_limit: Optional[float] = 0.0
    total_debit: Optional[float] = 0.0
    total_payment: Optional[float] = 0.0
    last_payment: Optional[float] = 0.0
    last_payment_date: Optional[datetime] = None
    total_user_deposit: Optional[float] = 0.0

# Enhanced Service Plan Models
class ServicePlanBase(BaseModel):
    name: str
    description: str
    plan_type: PlanType
    service_type: ServiceType
    charge_type: ChargeType
    charge_category: ChargeCategory
    base_price: float
    charges: float  # The main charges field
    setup_fee: float = 0.0
    billing_frequency: BillingFrequency
    start_date: datetime
    end_date: Optional[datetime] = None
    deposit_multiplier: float = 2.0  # Configurable multiplier for deposit calculation
    features: List[str] = []
    terms_conditions: str = ""
    is_proration_enabled: bool = False
    status: PlanStatus = PlanStatus.ACTIVE
    is_for_admin: bool = False  # True if plan is for admin, False for end users
    assigned_to_role: UserRole = UserRole.USER
    created_for_admin: Optional[str] = None

class ServicePlanCreate(ServicePlanBase):
    pass

class ServicePlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    plan_type: Optional[PlanType] = None
    charge_type: Optional[ChargeType] = None
    charge_category: Optional[ChargeCategory] = None
    base_price: Optional[float] = None
    charges: Optional[float] = None
    setup_fee: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    deposit_multiplier: Optional[float] = None
    features: Optional[List[str]] = None
    terms_conditions: Optional[str] = None
    is_proration_enabled: Optional[bool] = None
    status: Optional[PlanStatus] = None
    is_for_admin: Optional[bool] = None

class ServicePlanResponse(ServicePlanBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    calculated_deposit: Optional[float] = None  # Auto-calculated based on charges * deposit_multiplier

# Enhanced Service Models
class ServiceBase(BaseModel):
    account_id: str
    plan_id: str
    service_name: str
    service_description: Optional[str] = None
    service_category: Optional[str] = None  # master_service, self_service, user_service
    service_type: Optional[str] = None  # electricity, water, gas, internet, etc.
    custom_price: Optional[float] = None
    monthly_charges: Optional[float] = None  # Monthly charges for the service
    start_date: datetime
    end_date: Optional[datetime] = None
    service_address: str
    installation_notes: Optional[str] = None
    meter_number: Optional[str] = None
    connection_type: Optional[str] = None
    capacity: Optional[str] = None
    status: ServiceStatus = ServiceStatus.ACTIVE
    managed_by: Optional[str] = None  # User ID who manages this service
    assigned_to: Optional[str] = None  # master, admin, user
    priority: Optional[str] = None  # critical, high, medium, low
    last_reading: Optional[float] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    # All fields updatable except service_id (which is not included)
    account_id: Optional[str] = None
    plan_id: Optional[str] = None
    service_name: Optional[str] = None
    service_description: Optional[str] = None
    service_category: Optional[str] = None  # master_service, self_service, user_service
    service_type: Optional[str] = None  # electricity, water, gas, internet, etc.
    custom_price: Optional[float] = None
    monthly_charges: Optional[float] = None  # Monthly charges for the service
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    service_address: Optional[str] = None
    installation_notes: Optional[str] = None
    meter_number: Optional[str] = None
    connection_type: Optional[str] = None
    capacity: Optional[str] = None
    status: Optional[ServiceStatus] = None
    managed_by: Optional[str] = None  # User ID who manages this service
    assigned_to: Optional[str] = None  # master, admin, user
    priority: Optional[str] = None  # critical, high, medium, low
    last_reading: Optional[float] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    updated_at: datetime
    plan: Optional[ServicePlanResponse] = None
    account: Optional[AccountResponse] = None

# Enhanced Invoice Models
class InvoiceItemBase(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float
    amount: float

class InvoiceBase(BaseModel):
    account_id: str
    profile_id: Optional[str] = None
    service_ids: List[str] = []
    items: List[InvoiceItemBase] = []
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    billing_period_start: datetime
    billing_period_end: datetime
    due_date: datetime
    status: InvoiceStatus = InvoiceStatus.DRAFT
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: str
    invoice_number: str
    created_at: datetime
    updated_at: datetime
    account: Optional[AccountResponse] = None
    profile: Optional[ProfileResponse] = None

# Payment Models
class PaymentBase(BaseModel):
    invoice_id: str
    amount: float
    payment_method: str
    transaction_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str
    payment_date: datetime
    created_at: datetime
    updated_at: datetime
    invoice: Optional[InvoiceResponse] = None

# System Configuration Models
class SystemConfig(BaseModel):
    deposit_multiplier: float = 2.0

# Analytics Models
class DashboardStats(BaseModel):
    total_profiles: Optional[int] = None
    total_accounts: Optional[int] = None
    total_users: Optional[int] = None
    total_plans: Optional[int] = None
    active_services: Optional[int] = None
    monthly_revenue: Optional[float] = None
    pending_invoices: Optional[int] = None
    overdue_payments: Optional[int] = None
    current_month_bill: Optional[float] = None
    system_health: Optional[float] = None
    total_revenue: Optional[float] = None

# Due Alert Model
class DueAlert(BaseModel):
    invoice_id: str
    invoice_number: str
    account_name: str
    amount: float
    due_date: datetime
    days_overdue: int

# Utility functions
def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

def parse_from_mongo(item):
    """Parse datetime strings from MongoDB back to datetime objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key.endswith(('_at', '_date')):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(i) if isinstance(i, dict) else i for i in value]
    return item

def generate_invoice_pdf(invoice_data: dict) -> str:
    """Generate a simple PDF invoice representation (mock for now)"""
    invoice_content = f"""
    INVOICE
    
    Invoice Number: {invoice_data.get('invoice_number', '')}
    Date: {invoice_data.get('created_at', datetime.now()).strftime('%Y-%m-%d')}
    Due Date: {invoice_data.get('due_date', datetime.now()).strftime('%Y-%m-%d')}
    Total Amount: ${invoice_data.get('total_amount', 0):.2f}
    
    Thank you for your business!
    """
    
    # Convert to base64 (mock PDF)
    pdf_data = invoice_content.encode('utf-8')
    return base64.b64encode(pdf_data).decode('utf-8')

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    # Find user in dummy data
    user = next((u for u in dummy_data['users'] if u['id'] == user_id), None)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Role-based access control
def require_role(required_roles: List[UserRole]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [role.value for role in required_roles]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Routes
@api_router.get("/")
async def root():
    return {"message": "Enhanced Utility Manager CRM API", "version": "2.0.0"}

# Authentication routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = next((u for u in dummy_data['users'] if u['email'] == user_data.email), None)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = get_password_hash(user_data.password)
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    dummy_data['users'].append(user_dict.copy())
    
    del user_dict["password"]
    return UserResponse(**user_dict)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    print(f"🔍 Login attempt for email: {login_data.email}")
    print(f"🔍 Total users in dummy_data: {len(dummy_data['users'])}")
    
    # Find user in dummy data
    user = next((u for u in dummy_data['users'] if u['email'] == login_data.email), None)
    
    if user:
        print(f"✅ User found: {user['email']}")
        password_valid = verify_password(login_data.password, user['password'])
        print(f"🔍 Password verification result: {password_valid}")
        
        if password_valid:
            if not user.get("is_active", True):
                print("❌ Account is disabled")
                raise HTTPException(status_code=401, detail="Account is disabled")
            
            access_token = create_access_token(data={"sub": user["id"]})
            
            # Remove password from response
            user_data = user.copy()
            if "password" in user_data:
                del user_data["password"]
            
            print("✅ Login successful")
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": UserResponse(**user_data)
            }
        else:
            print("❌ Password verification failed")
    else:
        print(f"❌ User not found with email: {login_data.email}")
        print(f"🔍 Available users: {[u['email'] for u in dummy_data['users']]}")
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Enhanced Profile Management Routes
@api_router.post("/profiles", response_model=ProfileResponse)
async def create_profile(profile_data: ProfileCreate, current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    """Create new profile (Super Admin only)"""
    profile_dict = profile_data.dict()
    profile_dict["id"] = str(uuid.uuid4())
    profile_dict["created_by"] = current_user["id"]
    profile_dict["created_at"] = datetime.now(timezone.utc)
    profile_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    dummy_data['profiles'].append(profile_dict)
    
    return ProfileResponse(**profile_dict)

@api_router.get("/profiles", response_model=List[ProfileResponse])
async def get_profiles(current_user: dict = Depends(get_current_user)):
    """Get profiles based on user role"""
    return [ProfileResponse(**profile) for profile in dummy_data['profiles']]

@api_router.put("/profiles/{profile_id}", response_model=ProfileResponse)
async def update_profile(profile_id: str, profile_data: ProfileUpdate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Update profile (Admin and Super Admin only)"""
    # Find and update profile in dummy data
    for i, profile in enumerate(dummy_data['profiles']):
        if profile['id'] == profile_id:
            # Update fields
            update_dict = profile_data.dict(exclude_unset=True)
            dummy_data['profiles'][i].update(update_dict)
            dummy_data['profiles'][i]['updated_at'] = datetime.now(timezone.utc)
            return ProfileResponse(**dummy_data['profiles'][i])
    
    raise HTTPException(status_code=404, detail="Profile not found")

# Enhanced Service Plan Routes
@api_router.post("/plans", response_model=ServicePlanResponse)
async def create_service_plan(plan_data: ServicePlanCreate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Create service plan with enhanced fields"""
    plan_dict = plan_data.dict()
    plan_dict["id"] = str(uuid.uuid4())
    plan_dict["created_by"] = current_user["id"]
    plan_dict["created_at"] = datetime.now(timezone.utc)
    plan_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    dummy_data['plans'].append(plan_dict)
    
    # Calculate deposit for response
    response_dict = plan_dict.copy()
    response_dict['calculated_deposit'] = plan_dict['charges'] * plan_dict['deposit_multiplier']
    
    return ServicePlanResponse(**response_dict)

@api_router.get("/plans", response_model=List[ServicePlanResponse])
async def get_service_plans(current_user: dict = Depends(get_current_user)):
    """Get service plans based on user role"""
    plans = dummy_data['plans'].copy()
    
    # Filter based on role
    if current_user["role"] == "user":
        # Users see plans assigned to them or general plans
        plans = [p for p in plans if not p.get('is_for_admin', False) and p.get('assigned_to_role') == 'user']
    elif current_user["role"] == "admin":
        # Admins see plans they can manage
        plans = [p for p in plans if p.get('created_for_admin') == current_user['id'] or p.get('created_by') == current_user['id'] or p.get('assigned_to_role') in ['admin', 'user']]
    # Super admin sees all plans
    
    # Add calculated deposit to each plan
    enhanced_plans = []
    for plan in plans:
        plan_dict = plan.copy()
        plan_dict['calculated_deposit'] = plan['charges'] * plan.get('deposit_multiplier', 2.0)
        enhanced_plans.append(ServicePlanResponse(**plan_dict))
    
    return enhanced_plans

@api_router.put("/plans/{plan_id}", response_model=ServicePlanResponse)
async def update_service_plan(plan_id: str, plan_data: ServicePlanUpdate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Update service plan"""
    # Find and update plan in dummy data
    for i, plan in enumerate(dummy_data['plans']):
        if plan['id'] == plan_id:
            # Check permissions
            if current_user['role'] == 'admin' and plan.get('created_for_admin') != current_user['id'] and plan.get('created_by') != current_user['id']:
                raise HTTPException(status_code=403, detail="Cannot modify this plan")
            
            # Update fields
            update_dict = plan_data.dict(exclude_unset=True)
            dummy_data['plans'][i].update(update_dict)
            dummy_data['plans'][i]['updated_at'] = datetime.now(timezone.utc)
            
            # Add calculated deposit
            response_dict = dummy_data['plans'][i].copy()
            response_dict['calculated_deposit'] = response_dict['charges'] * response_dict.get('deposit_multiplier', 2.0)
            
            return ServicePlanResponse(**response_dict)
    
    raise HTTPException(status_code=404, detail="Plan not found")

# Enhanced Account Management Routes
@api_router.post("/accounts", response_model=AccountResponse)
async def create_account(account_data: AccountCreate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Create new account"""
    account_dict = account_data.dict()
    account_dict["id"] = str(uuid.uuid4())
    account_dict["user_id"] = current_user["id"]
    account_dict["created_at"] = datetime.now(timezone.utc)
    account_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    dummy_data['accounts'].append(account_dict)
    
    return AccountResponse(**account_dict)

@api_router.get("/accounts", response_model=List[AccountResponse])
async def get_accounts(current_user: dict = Depends(get_current_user)):
    """Get accounts with enhanced data"""
    accounts = dummy_data['accounts'].copy()
    
    # Filter based on role
    if current_user["role"] == "user":
        accounts = [a for a in accounts if a.get('user_id') == current_user['id']]
    
    return [AccountResponse(**account) for account in accounts]

@api_router.get("/accounts/{account_id}", response_model=AccountResponse)
async def get_account_by_id(account_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific account by ID"""
    account = next((a for a in dummy_data['accounts'] if a['id'] == account_id), None)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Check permissions
    if current_user["role"] == "user" and account.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return AccountResponse(**account)

# Enhanced Service Routes
@api_router.post("/services", response_model=ServiceResponse)
async def create_service(service_data: ServiceCreate, current_user: dict = Depends(get_current_user)):
    """Create service with enhanced fields"""
    service_dict = service_data.dict()
    service_dict["id"] = str(uuid.uuid4())
    service_dict["created_at"] = datetime.now(timezone.utc)
    service_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Validate account access
    account = next((a for a in dummy_data['accounts'] if a['id'] == service_data.account_id), None)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Check permissions
    if current_user["role"] == "user" and account.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Cannot create service for this account")
    
    # Validate plan exists
    plan = next((p for p in dummy_data['plans'] if p['id'] == service_data.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Add to dummy data
    dummy_data['services'].append(service_dict)
    
    return ServiceResponse(**service_dict)

@api_router.get("/services", response_model=List[ServiceResponse])
async def get_services(account_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get services with enhanced data"""
    services = dummy_data['services'].copy()
    
    # Filter by account if specified
    if account_id:
        services = [s for s in services if s['account_id'] == account_id]
        
        # Check permissions for specific account
        if current_user["role"] == "user":
            account = next((a for a in dummy_data['accounts'] if a['id'] == account_id), None)
            if account and account.get('user_id') != current_user['id']:
                raise HTTPException(status_code=403, detail="Access denied")
    
    # Add plan and account details
    enhanced_services = []
    for service in services:
        service_dict = service.copy()
        
        # Get plan details
        plan = next((p for p in dummy_data['plans'] if p['id'] == service['plan_id']), None)
        if plan:
            plan_copy = plan.copy()
            plan_copy['calculated_deposit'] = plan['charges'] * plan.get('deposit_multiplier', 2.0)
            service_dict['plan'] = plan_copy
            
        # Get account details
        account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
        if account:
            service_dict['account'] = account
            
        enhanced_services.append(ServiceResponse(**service_dict))
    
    return enhanced_services

@api_router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(service_id: str, service_data: ServiceUpdate, current_user: dict = Depends(get_current_user)):
    """Update service (all fields except service_id are updatable)"""
    # Find service in dummy data
    for i, service in enumerate(dummy_data['services']):
        if service['id'] == service_id:
            # Check permissions
            if current_user["role"] == "user":
                account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
                if account and account.get('user_id') != current_user['id']:
                    raise HTTPException(status_code=403, detail="Access denied")
            
            # Update fields (all except id are updatable)
            update_dict = service_data.dict(exclude_unset=True)
            dummy_data['services'][i].update(update_dict)
            dummy_data['services'][i]['updated_at'] = datetime.now(timezone.utc)
            
            # Return updated service with enhanced data
            service_dict = dummy_data['services'][i].copy()
            
            # Get plan details
            plan = next((p for p in dummy_data['plans'] if p['id'] == service_dict['plan_id']), None)
            if plan:
                plan_copy = plan.copy()
                plan_copy['calculated_deposit'] = plan['charges'] * plan.get('deposit_multiplier', 2.0)
                service_dict['plan'] = plan_copy
            
            # Get account details
            account = next((a for a in dummy_data['accounts'] if a['id'] == service_dict['account_id']), None)
            if account:
                service_dict['account'] = account
            
            return ServiceResponse(**service_dict)
    
    raise HTTPException(status_code=404, detail="Service not found")

@api_router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service_by_id(service_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific service by ID"""
    service = next((s for s in dummy_data['services'] if s['id'] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check permissions
    if current_user["role"] == "user":
        account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
        if account and account.get('user_id') != current_user['id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Add enhanced data
    service_dict = service.copy()
    
    # Get plan details
    plan = next((p for p in dummy_data['plans'] if p['id'] == service['plan_id']), None)
    if plan:
        plan_copy = plan.copy()
        plan_copy['calculated_deposit'] = plan['charges'] * plan.get('deposit_multiplier', 2.0)
        service_dict['plan'] = plan_copy
    
    # Get account details
    account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
    if account:
        service_dict['account'] = account
    
    return ServiceResponse(**service_dict)

# Enhanced Invoice Routes
@api_router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(invoice_data: InvoiceCreate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Create enhanced invoice"""
    invoice_count = len(dummy_data['invoices']) + 1
    invoice_number = f"INV-{invoice_count:06d}"
    
    invoice_dict = invoice_data.dict()
    invoice_dict["id"] = str(uuid.uuid4())
    invoice_dict["invoice_number"] = invoice_number
    invoice_dict["created_at"] = datetime.now(timezone.utc)
    invoice_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    dummy_data['invoices'].append(invoice_dict)
    
    return InvoiceResponse(**invoice_dict)

@api_router.get("/invoices")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """Get invoices for current user"""
    # For demo, return all invoices - in real app, filter by user permissions
    return dummy_data['invoices']

@api_router.get("/invoices/{invoice_id}")
async def get_invoice_details(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific invoice details"""
    invoice = next((i for i in dummy_data['invoices'] if i['id'] == invoice_id), None)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@api_router.post("/invoices/{invoice_id}/generate-pdf")
async def generate_invoice_pdf_endpoint(invoice_id: str, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Generate PDF for invoice"""
    # Find invoice
    invoice = next((i for i in dummy_data['invoices'] if i['id'] == invoice_id), None)
    if not invoice:
        # Mock invoice data for demo
        invoice_data = {
            "invoice_number": f"INV-{invoice_id[:6].upper()}",
            "created_at": datetime.now(timezone.utc),
            "due_date": datetime.now(timezone.utc) + timedelta(days=30),
            "total_amount": 245.50
        }
    else:
        invoice_data = invoice
    
    pdf_base64 = generate_invoice_pdf(invoice_data)
    
    return {
        "pdf_data": pdf_base64,
        "filename": f"invoice_{invoice_data['invoice_number']}.pdf"
    }

# Bill Generation Models
class BillScheduleStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"

class BillRunStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"

class BillCycle(BaseModel):
    id: str
    name: str
    frequency: str  # monthly, quarterly, yearly
    day_of_cycle: int  # day of month/quarter/year to run

class BillScheduleCreate(BaseModel):
    bill_cycle_id: str
    bill_run_name: str
    bill_date: datetime
    account_ids: List[str] = []  # empty means all accounts

class BillScheduleResponse(BaseModel):
    id: str
    bill_cycle_id: str
    bill_cycle_name: str
    bill_run_name: str
    bill_date: datetime
    status: BillScheduleStatus
    account_count: int
    created_at: datetime
    updated_at: datetime

class BillRunResponse(BaseModel):
    id: str
    bill_schedule_id: str
    bill_cycle_id: str
    bill_cycle_name: str
    run_name: str
    run_date: datetime
    status: BillRunStatus
    total_accounts: int
    bills_generated: int
    bills_approved: int
    created_at: datetime

class BilledAccountResponse(BaseModel):
    id: str
    bill_run_id: str
    account_id: str
    account_name: str
    charges: float
    bill_date: datetime
    due_date: datetime
    status: str  # billed, approved
    created_at: datetime

# Bill Generation API Endpoints

@api_router.get("/billing/cycles")
async def get_bill_cycles(current_user: dict = Depends(get_current_user)):
    """Get all bill cycles"""
    bill_cycles = dummy_data.get('bill_cycles', [])
    return bill_cycles

@api_router.get("/billing/schedules")
async def get_bill_schedules(current_user: dict = Depends(get_current_user)):
    """Get all bill schedules with pagination"""
    bill_schedules = dummy_data.get('bill_schedules', [])
    
    # Add bill cycle name to each schedule
    enhanced_schedules = []
    for schedule in bill_schedules:
        cycle = next((c for c in dummy_data.get('bill_cycles', []) if c['id'] == schedule['bill_cycle_id']), None)
        schedule_copy = schedule.copy()
        schedule_copy['bill_cycle_name'] = cycle['name'] if cycle else 'Unknown Cycle'
        enhanced_schedules.append(schedule_copy)
    
    return enhanced_schedules

@api_router.post("/billing/schedules")
async def create_bill_schedule(schedule_data: BillScheduleCreate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Create a new bill schedule"""
    schedule_dict = schedule_data.dict()
    schedule_dict["id"] = str(uuid.uuid4())
    schedule_dict["status"] = BillScheduleStatus.PENDING
    schedule_dict["account_count"] = len(schedule_data.account_ids) if schedule_data.account_ids else len(dummy_data['accounts'])
    schedule_dict["created_at"] = datetime.now(timezone.utc)
    schedule_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Add to dummy data
    if 'bill_schedules' not in dummy_data:
        dummy_data['bill_schedules'] = []
    dummy_data['bill_schedules'].append(schedule_dict)
    
    # Also create a corresponding bill run
    bill_run = {
        "id": str(uuid.uuid4()),
        "bill_schedule_id": schedule_dict["id"],
        "bill_cycle_id": schedule_data.bill_cycle_id,
        "run_name": schedule_data.bill_run_name,
        "run_date": schedule_data.bill_date,
        "status": BillRunStatus.PENDING,
        "total_accounts": schedule_dict["account_count"],
        "bills_generated": 0,
        "bills_approved": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    if 'bill_runs' not in dummy_data:
        dummy_data['bill_runs'] = []
    dummy_data['bill_runs'].append(bill_run)
    
    return {"message": "Bill schedule created successfully", "schedule_id": schedule_dict["id"]}

@api_router.get("/billing/runs")
async def get_bill_runs(bill_cycle_id: str = None, bill_run_id: str = None, status: str = None, current_user: dict = Depends(get_current_user)):
    """Get all bill runs with optional filtering"""
    bill_runs = dummy_data.get('bill_runs', [])
    
    # Apply filters
    if bill_cycle_id:
        bill_runs = [r for r in bill_runs if r['bill_cycle_id'] == bill_cycle_id]
    if bill_run_id:
        bill_runs = [r for r in bill_runs if r['id'] == bill_run_id]
    if status:
        bill_runs = [r for r in bill_runs if r['status'] == status]
    
    # Add bill cycle name to each run
    enhanced_runs = []
    for run in bill_runs:
        cycle = next((c for c in dummy_data.get('bill_cycles', []) if c['id'] == run['bill_cycle_id']), None)
        run_copy = run.copy()
        run_copy['bill_cycle_name'] = cycle['name'] if cycle else 'Unknown Cycle'
        enhanced_runs.append(run_copy)
    
    return enhanced_runs

@api_router.get("/billing/accounts")
async def get_billed_accounts(bill_cycle_id: str = None, bill_run_id: str = None, account_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get all billed accounts with optional filtering"""
    billed_accounts = dummy_data.get('billed_accounts', [])
    
    # Apply filters
    if bill_run_id:
        billed_accounts = [a for a in billed_accounts if a['bill_run_id'] == bill_run_id]
    if account_id:
        billed_accounts = [a for a in billed_accounts if a['account_id'] == account_id]
    if bill_cycle_id:
        # Filter by bill cycle through bill runs
        matching_runs = [r['id'] for r in dummy_data.get('bill_runs', []) if r['bill_cycle_id'] == bill_cycle_id]
        billed_accounts = [a for a in billed_accounts if a['bill_run_id'] in matching_runs]
    
    return billed_accounts

@api_router.put("/billing/accounts/{account_bill_id}/approve")
async def approve_billed_account(account_bill_id: str, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Approve a billed account"""
    billed_accounts = dummy_data.get('billed_accounts', [])
    
    # Find and update the account bill
    for i, account in enumerate(billed_accounts):
        if account['id'] == account_bill_id:
            dummy_data['billed_accounts'][i]['status'] = 'approved'
            dummy_data['billed_accounts'][i]['updated_at'] = datetime.now(timezone.utc)
            
            # Update bill run counts
            bill_run_id = account['bill_run_id']
            bill_runs = dummy_data.get('bill_runs', [])
            for j, run in enumerate(bill_runs):
                if run['id'] == bill_run_id:
                    dummy_data['bill_runs'][j]['bills_approved'] += 1
                    break
            
            return {"message": "Account bill approved successfully"}
    
    raise HTTPException(status_code=404, detail="Billed account not found")

# Subscription Management Models
class SubscriptionBase(BaseModel):
    account_id: str
    account_name: str
    service_id: str
    plan_id: str
    plan_name: str
    amount: float
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None

class SubscriptionResponse(SubscriptionBase):
    id: str
    service_name: str
    service_category: str
    is_addon: Optional[bool] = False
    parent_service_id: Optional[str] = None
    plan_type: Optional[int] = 1

class PlanChangeRequest(BaseModel):
    current_service_id: str
    new_plan_id: str
    activation_date: datetime

class DeactivateRequest(BaseModel):
    service_id: str
    deactivation_date: datetime

# Subscription Management Routes
@api_router.get("/subscriptions/self", response_model=List[SubscriptionResponse])
async def get_self_subscriptions(
    page: int = 1, 
    limit: int = 10,
    account_id: str = None,
    plan_name: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get self subscriptions - active services managed by current user"""
    # Filter services for current user (self_service category)
    # Super admin can see all self_service category services
    if current_user["role"] == "super_admin":
        services = [s for s in dummy_data['services'] 
                   if s.get('service_category') == 'self_service' and
                      s.get('is_active', True)]
    else:
        services = [s for s in dummy_data['services'] 
                   if s.get('service_category') == 'self_service' and 
                      s.get('managed_by') == current_user['id'] and
                      s.get('is_active', True)]
    
    # Apply filters
    if account_id:
        services = [s for s in services if s.get('account_id') == account_id]
    if plan_name:
        plan_ids = [p['id'] for p in dummy_data['plans'] if plan_name.lower() in p['name'].lower()]
        services = [s for s in services if s.get('plan_id') in plan_ids]
    
    # Build subscription responses
    subscriptions = []
    for service in services:
        # Get plan details
        plan = next((p for p in dummy_data['plans'] if p['id'] == service['plan_id']), None)
        # Get account details
        account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
        
        if plan and account:
            subscription = SubscriptionResponse(
                id=service['id'],
                account_id=service['account_id'],
                account_name=account['name'],
                service_id=service['id'],
                service_name=service['service_name'],
                service_category=service['service_category'],
                plan_id=service['plan_id'],
                plan_name=plan['name'],
                amount=service.get('monthly_charges', plan['charges']),
                status=service['status'],
                start_date=service['start_date'],
                end_date=service.get('end_date'),
                is_addon=service.get('is_addon', False),
                parent_service_id=service.get('parent_service_id'),
                plan_type=plan.get('plan_type', 1)
            )
            subscriptions.append(subscription)
    
    # Apply pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_subscriptions = subscriptions[start_idx:end_idx]
    
    return paginated_subscriptions

@api_router.get("/subscriptions/users", response_model=List[SubscriptionResponse])
async def get_user_subscriptions(
    page: int = 1,
    limit: int = 10,
    account_id: str = None,
    plan_name: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user subscriptions - active services for end users"""
    # Filter services for end users (user_service category)
    # Super admin can see all user_service category services
    if current_user["role"] == "super_admin":
        services = [s for s in dummy_data['services'] 
                   if s.get('service_category') == 'user_service' and
                      s.get('is_active', True)]
    else:
        services = [s for s in dummy_data['services'] 
                   if s.get('service_category') == 'user_service' and
                      s.get('managed_by') == current_user['id'] and
                      s.get('is_active', True)]
    
    # Apply filters
    if account_id:
        services = [s for s in services if s.get('account_id') == account_id]
    if plan_name:
        plan_ids = [p['id'] for p in dummy_data['plans'] if plan_name.lower() in p['name'].lower()]
        services = [s for s in services if s.get('plan_id') in plan_ids]
    
    # Build subscription responses
    subscriptions = []
    for service in services:
        # Get plan details
        plan = next((p for p in dummy_data['plans'] if p['id'] == service['plan_id']), None)
        # Get account details
        account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
        
        if plan and account:
            subscription = SubscriptionResponse(
                id=service['id'],
                account_id=service['account_id'],
                account_name=account['name'],
                service_id=service['id'],
                service_name=service['service_name'],
                service_category=service['service_category'],
                plan_id=service['plan_id'],
                plan_name=plan['name'],
                amount=service.get('monthly_charges', plan['charges']),
                status=service['status'],
                start_date=service['start_date'],
                end_date=service.get('end_date'),
                is_addon=service.get('is_addon', False),
                parent_service_id=service.get('parent_service_id'),
                plan_type=plan.get('plan_type', 1)
            )
            subscriptions.append(subscription)
    
    # Apply pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_subscriptions = subscriptions[start_idx:end_idx]
    
    return paginated_subscriptions

@api_router.get("/subscriptions/{subscription_id}/details")
async def get_subscription_details(subscription_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed subscription information"""
    # Find the service - subscription_id could be the service id or subscription id
    service = None
    
    # First try to find by service id
    service = next((s for s in dummy_data['services'] if s['id'] == subscription_id), None)
    
    # If not found, try to find by matching in the subscription data structure
    if not service:
        # Look through services to find matching subscription
        for s in dummy_data['services']:
            if s.get('id') == subscription_id or str(s.get('id', '')).endswith(subscription_id):
                service = s
                break
    
    if not service:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # For permissions, check if current user manages this or if it's a user subscription
    user_role = current_user.get('role', 'user')
    if user_role not in ['super_admin', 'admin'] and service.get('managed_by') != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get plan and account details
    plan = next((p for p in dummy_data['plans'] if p['id'] == service['plan_id']), None)
    account = next((a for a in dummy_data['accounts'] if a['id'] == service['account_id']), None)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Associated plan not found")
    
    # Return enhanced details
    return {
        "id": service['id'],
        "service_id": service['id'],
        "service_name": service['service_name'],
        "service_category": service.get('service_category', 'N/A'),
        "service_address": service.get('service_address', 'N/A'),
        "monthly_charges": service.get('monthly_charges', 0),
        "amount": service.get('monthly_charges', plan.get('charges', 0)),
        "status": service.get('status', 'active'),
        "start_date": service.get('start_date'),
        "end_date": service.get('end_date'),
        "account_name": account['name'] if account else 'N/A',
        "account_id": service.get('account_id'),
        "plan_id": service.get('plan_id'),
        "plan_name": plan['name'] if plan else 'N/A',
        "plan_type": plan.get('plan_type', 1) if plan else 1,
        "is_addon": plan.get('plan_type') == 2 if plan else False,
        "service": service,
        "plan": plan,
        "account": account
    }

@api_router.post("/subscriptions/{subscription_id}/deactivate")
async def deactivate_subscription(
    subscription_id: str, 
    deactivate_data: DeactivateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate a subscription"""
    # Find the service in dummy data
    for i, service in enumerate(dummy_data['services']):
        if service['id'] == subscription_id:
            # Check permissions
            if service.get('managed_by') != current_user['id']:
                raise HTTPException(status_code=403, detail="Access denied")
            
            # Update service status and end date
            dummy_data['services'][i]['status'] = 'inactive'
            dummy_data['services'][i]['is_active'] = False
            dummy_data['services'][i]['end_date'] = deactivate_data.deactivation_date
            dummy_data['services'][i]['updated_at'] = datetime.now(timezone.utc)
            
            return {"message": "Subscription deactivated successfully", "service_id": subscription_id}
    
    raise HTTPException(status_code=404, detail="Subscription not found")

@api_router.post("/subscriptions/change-plan")
async def change_subscription_plan(
    plan_change: PlanChangeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change subscription plan - deactivate current and activate new"""
    # Find current service
    current_service = None
    current_service_idx = None
    for i, service in enumerate(dummy_data['services']):
        if service['id'] == plan_change.current_service_id:
            # Check permissions
            if service.get('managed_by') != current_user['id']:
                raise HTTPException(status_code=403, detail="Access denied")
            current_service = service
            current_service_idx = i
            break
    
    if not current_service:
        raise HTTPException(status_code=404, detail="Current subscription not found")
    
    # Get new plan details
    new_plan = next((p for p in dummy_data['plans'] if p['id'] == plan_change.new_plan_id), None)
    if not new_plan:
        raise HTTPException(status_code=404, detail="New plan not found")
    
    # Deactivate current service
    dummy_data['services'][current_service_idx]['status'] = 'inactive'
    dummy_data['services'][current_service_idx]['is_active'] = False
    dummy_data['services'][current_service_idx]['end_date'] = plan_change.activation_date
    dummy_data['services'][current_service_idx]['updated_at'] = datetime.now(timezone.utc)
    
    # Create new service with new plan
    new_service = {
        'id': str(uuid.uuid4()),
        'account_id': current_service['account_id'],
        'plan_id': plan_change.new_plan_id,
        'service_name': current_service['service_name'] + f" (Changed to {new_plan['name']})",
        'service_description': f"Plan changed from {current_service.get('plan_id')} to {new_plan['name']}",
        'service_category': current_service['service_category'],
        'service_type': current_service['service_type'],
        'custom_price': None,
        'monthly_charges': new_plan['charges'],
        'start_date': plan_change.activation_date,
        'end_date': None,
        'service_address': current_service['service_address'],
        'installation_notes': f"Plan change from {current_service['service_name']}",
        'meter_number': current_service.get('meter_number'),
        'connection_type': current_service.get('connection_type'),
        'capacity': current_service.get('capacity'),
        'is_active': True,
        'status': 'active',
        'managed_by': current_service['managed_by'],
        'assigned_to': current_service['assigned_to'],
        'priority': current_service.get('priority'),
        'last_reading': current_service.get('last_reading'),
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc)
    }
    
    # Add new service to dummy data
    dummy_data['services'].append(new_service)
    
    return {
        "message": "Plan changed successfully",
        "old_service_id": plan_change.current_service_id,
        "new_service_id": new_service['id'],
        "new_plan": new_plan
    }

@api_router.get("/subscriptions/available-plans/{current_plan_id}")
async def get_available_plans_for_change(
    current_plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get available plans for plan change (excluding current plan)"""
    # Filter out current plan and get available plans
    available_plans = [p for p in dummy_data['plans'] 
                      if p['id'] != current_plan_id and 
                         p.get('status') == 'active']
    
    # Filter based on user role if needed
    if current_user["role"] == "user":
        available_plans = [p for p in available_plans if not p.get('is_for_admin', False)]
    
    return available_plans

# Addon Plans API Endpoints
@api_router.get("/subscriptions/addon-plans/{service_type}")
async def get_available_addon_plans(
    service_type: str,
    current_user: dict = Depends(get_current_user)
):
    """Get available addon plans for a specific service type"""
    # Filter addon plans (plan_type = 2) for the specific service type
    addon_plans = [p for p in dummy_data['plans'] 
                   if p.get('plan_type') == 2 and 
                      p.get('service_type') == service_type and
                      p.get('status') == 'active']
    
    # Filter based on user role if needed
    if current_user["role"] == "user":
        addon_plans = [p for p in addon_plans if not p.get('is_for_admin', False)]
    elif current_user["role"] == "admin":
        # Admins can see all addon plans
        pass
    
    return addon_plans

@api_router.post("/subscriptions/activate-addon")
async def activate_addon_plan(
    addon_request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Activate an addon plan for an existing service"""
    try:
        # Extract request data
        base_service_id = addon_request.get('base_service_id')
        addon_plan_id = addon_request.get('addon_plan_id')
        activation_date = addon_request.get('activation_date', datetime.now(timezone.utc).isoformat())
        
        if not base_service_id or not addon_plan_id:
            raise HTTPException(status_code=400, detail="Missing required fields: base_service_id and addon_plan_id")
        
        # Find the base service
        base_service = next((s for s in dummy_data['services'] if s['id'] == base_service_id), None)
        if not base_service:
            raise HTTPException(status_code=404, detail="Base service not found")
        
        # Find the addon plan
        addon_plan = next((p for p in dummy_data['plans'] if p['id'] == addon_plan_id and p.get('plan_type') == 2), None)
        if not addon_plan:
            raise HTTPException(status_code=404, detail="Addon plan not found")
        
        # Check if user has permission to activate addon for this service
        if current_user["role"] == "user":
            if base_service.get('assigned_to') != 'user':
                raise HTTPException(status_code=403, detail="Insufficient permissions to activate addon for this service")
        
        # Create new addon service
        addon_service_id = f"addon_{len(dummy_data['services']) + 1:03d}"
        addon_service = {
            'id': addon_service_id,
            'account_id': base_service['account_id'],
            'plan_id': addon_plan_id,
            'service_name': f"{addon_plan['name']} (Addon)",
            'service_description': f"Addon service: {addon_plan['description']}",
            'service_category': base_service.get('service_category', 'user_service'),
            'service_type': addon_plan['service_type'],
            'custom_price': None,
            'monthly_charges': addon_plan['charges'],
            'start_date': datetime.fromisoformat(activation_date.replace('Z', '+00:00')),
            'end_date': None,
            'service_address': base_service.get('service_address', 'Same as base service'),
            'installation_notes': f"Addon activated for base service: {base_service['service_name']}",
            'meter_number': f"{base_service.get('meter_number', 'N/A')}-ADDON",
            'connection_type': 'addon',
            'capacity': addon_plan.get('features', ['Standard'])[0],
            'status': 'active',
            'managed_by': current_user['id'],
            'assigned_to': base_service.get('assigned_to', 'user'),
            'priority': 'medium',
            'last_reading': 0.0,
            'is_active': True,
            'parent_service_id': base_service_id,  # Link to base service
            'is_addon': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Add to dummy data
        dummy_data['services'].append(addon_service)
        
        return {
            "success": True,
            "message": f"Addon plan '{addon_plan['name']}' activated successfully",
            "addon_service_id": addon_service_id,
            "monthly_charge": addon_plan['charges']
        }
        
    except Exception as e:
        print(f"Error activating addon plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/subscriptions/deactivate-addon")
async def deactivate_addon_plan(
    deactivation_request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate an addon plan"""
    try:
        addon_service_id = deactivation_request.get('addon_service_id')
        deactivation_date = deactivation_request.get('deactivation_date', datetime.now(timezone.utc).isoformat())
        
        if not addon_service_id:
            raise HTTPException(status_code=400, detail="Missing required field: addon_service_id")
        
        # Find the addon service
        addon_service = next((s for s in dummy_data['services'] if s['id'] == addon_service_id and s.get('is_addon', False)), None)
        if not addon_service:
            raise HTTPException(status_code=404, detail="Addon service not found")
        
        # Check permissions
        if current_user["role"] == "user":
            if addon_service.get('assigned_to') != 'user':
                raise HTTPException(status_code=403, detail="Insufficient permissions to deactivate this addon")
        
        # Deactivate the addon service
        addon_service['is_active'] = False
        addon_service['status'] = 'inactive'
        addon_service['end_date'] = datetime.fromisoformat(deactivation_date.replace('Z', '+00:00'))
        addon_service['updated_at'] = datetime.now(timezone.utc)
        
        return {
            "success": True,
            "message": "Addon plan deactivated successfully"
        }
        
    except Exception as e:
        print(f"Error deactivating addon plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Dashboard Stats
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_enhanced_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get enhanced dashboard statistics"""
    if current_user["role"] == "user":
        return DashboardStats(
            active_services=len([s for s in dummy_data['services'] if s.get('is_active', True)]),
            pending_invoices=2,
            current_month_bill=245.50
        )
    elif current_user["role"] == "admin":
        return DashboardStats(
            total_accounts=len(dummy_data['accounts']),
            active_services=len([s for s in dummy_data['services'] if s.get('is_active', True)]),
            monthly_revenue=34250.00,
            pending_invoices=28,
            overdue_payments=8
        )
    else:  # super_admin
        return DashboardStats(
            total_users=len(dummy_data['users']),
            total_profiles=len(dummy_data['profiles']),
            total_accounts=len(dummy_data['accounts']),
            total_plans=len(dummy_data['plans']),
            active_services=len([s for s in dummy_data['services'] if s.get('is_active', True)]),
            total_revenue=142500.00,
            monthly_revenue=45800.00,
            pending_invoices=45,
            overdue_payments=12,
            system_health=99.8
        )

# Due Alerts Route
@api_router.get("/alerts/due-payments", response_model=List[DueAlert])
async def get_due_payment_alerts(current_user: dict = Depends(get_current_user)):
    """Get due payment alerts"""
    mock_alerts = []
    
    # Mock overdue invoices for demonstration
    if current_user["role"] in ["admin", "super_admin"]:
        mock_alerts = [
            DueAlert(
                invoice_id="inv_001",
                invoice_number="INV-000123",
                account_name="Smith Enterprises",
                amount=295.50,
                due_date=datetime.now(timezone.utc) - timedelta(days=5),
                days_overdue=5
            ),
            DueAlert(
                invoice_id="inv_002",
                invoice_number="INV-000124",
                account_name="Johnson LLC",
                amount=187.25,
                due_date=datetime.now(timezone.utc) - timedelta(days=2),
                days_overdue=2
            )
        ]
    elif current_user["role"] == "user":
        mock_alerts = [
            DueAlert(
                invoice_id="inv_003",
                invoice_number="INV-000125",
                account_name="My Account",
                amount=125.80,
                due_date=datetime.now(timezone.utc) - timedelta(days=1),
                days_overdue=1
            )
        ]
    
    return mock_alerts

# Reports Route
@api_router.get("/reports/monthly-revenue")
async def get_monthly_revenue_report(current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    """Get monthly revenue report"""
    if current_user["role"] == "super_admin":
        # Profile-based grouping for super admin
        return {
            "report_type": "profile_based",
            "data": [
                {
                    "profile_id": "prof_001",
                    "profile_name": "John Smith",
                    "monthly_revenue": 2450.00,
                    "account_count": 3,
                    "service_count": 8,
                    "invoices_generated": 12,
                    "payments_received": 10
                },
                {
                    "profile_id": "prof_002", 
                    "profile_name": "Sarah Johnson",
                    "monthly_revenue": 1875.50,
                    "account_count": 2,
                    "service_count": 5,
                    "invoices_generated": 8,
                    "payments_received": 7
                }
            ],
            "total_revenue": 4325.50
        }
    else:  # admin
        # Account-based grouping for admin
        return {
            "report_type": "account_based",
            "data": [
                {
                    "account_id": "acc_001",
                    "account_name": "Smith Enterprises",
                    "monthly_revenue": 1250.00,
                    "service_count": 4,
                    "invoices_generated": 6,
                    "payments_received": 5
                },
                {
                    "account_id": "acc_002",
                    "account_name": "Johnson LLC",
                    "monthly_revenue": 975.25,
                    "service_count": 3,
                    "invoices_generated": 4,
                    "payments_received": 4
                }
            ],
            "total_revenue": 2225.25
        }

# System Configuration Routes
@api_router.get("/system/config", response_model=SystemConfig)
async def get_system_config(current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    """Get system configuration"""
    return SystemConfig(**dummy_data['system_config'])

@api_router.put("/system/config", response_model=SystemConfig)
async def update_system_config(config: SystemConfig, current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    """Update system configuration"""
    dummy_data['system_config'].update(config.dict())
    return SystemConfig(**dummy_data['system_config'])

# User management routes
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    users = dummy_data['users'].copy()
    result = []
    for user in users:
        user_data = user.copy()
        del user_data["password"]
        result.append(UserResponse(**user_data))
    return result

@api_router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user_data = current_user.copy()
    if "password" in user_data:
        del user_data["password"]
    return UserResponse(**user_data)

@api_router.get("/users/me/profile-info")
async def get_current_user_profile_info(current_user: dict = Depends(get_current_user)):
    """Get current user's profile information and related data"""
    user_data = current_user.copy()
    if "password" in user_data:
        del user_data["password"]
    
    # Get user's profile
    user_profile = None
    if user_data.get('profile_id'):
        user_profile = next((p for p in dummy_data['profiles'] if p['id'] == user_data['profile_id']), None)
    
    # Get master profile if exists
    master_profile = None
    has_master_profile = False
    if user_profile and user_profile.get('master_profile_id'):
        master_profile = next((p for p in dummy_data['profiles'] if p['id'] == user_profile['master_profile_id']), None)
        has_master_profile = True
    elif user_profile and user_profile.get('is_master_profile'):
        master_profile = user_profile
        has_master_profile = True
    
    # For testing purposes, always provide a master profile if none exists
    if not has_master_profile:
        # Find any master profile or create dummy one for testing
        test_master = next((p for p in dummy_data['profiles'] if p.get('is_master_profile')), None)
        if test_master:
            master_profile = test_master
            has_master_profile = True
    
    # Check if user is end user - but for testing, make it configurable
    is_end_user = user_profile and user_profile.get('end_user', False)
    # For testing, we can override this to show all buttons
    test_mode_end_user = False  # Set to False for testing to show user profile options
    
    # Get child users (users with same profile_id or profiles under same master)
    child_users = []
    if not test_mode_end_user and user_profile:
        if user_profile.get('is_master_profile'):
            # Master profile - get all users under profiles that have this as master
            child_profiles = [p for p in dummy_data['profiles'] if p.get('master_profile_id') == user_profile['id']]
            for profile in child_profiles:
                profile_users = [u for u in dummy_data['users'] if u.get('profile_id') == profile['id'] and u['id'] != current_user['id']]
                for child_user in profile_users:
                    child_user_data = child_user.copy()
                    if "password" in child_user_data:
                        del child_user_data["password"]
                    child_user_data['profile_name'] = profile['name']
                    child_users.append(child_user_data)
        else:
            # Regular profile - get users with same profile or under same master
            if user_profile.get('master_profile_id') or master_profile:
                # Get all profiles under the same master (or all profiles for testing)
                if master_profile:
                    master_profiles = [p for p in dummy_data['profiles'] if p.get('master_profile_id') == master_profile['id'] or p['id'] == master_profile['id']]
                else:
                    master_profiles = [p for p in dummy_data['profiles'] if p.get('master_profile_id') == user_profile.get('master_profile_id') or p['id'] == user_profile.get('master_profile_id')]
                
                for profile in master_profiles:
                    profile_users = [u for u in dummy_data['users'] if u.get('profile_id') == profile['id'] and u['id'] != current_user['id']]
                    for child_user in profile_users:
                        child_user_data = child_user.copy()
                        if "password" in child_user_data:
                            del child_user_data["password"]
                        child_user_data['profile_name'] = profile['name']
                        child_users.append(child_user_data)
    
    # For testing, ensure we always have some child users to show user profile functionality
    if not child_users:
        # Add some dummy child users for testing
        all_users = [u for u in dummy_data['users'] if u['id'] != current_user['id']][:5]  # Take first 5 other users
        for test_user in all_users:
            test_user_data = test_user.copy()
            if "password" in test_user_data:
                del test_user_data["password"]
            # Find their profile name
            test_user_profile = next((p for p in dummy_data['profiles'] if p['id'] == test_user.get('profile_id')), None)
            test_user_data['profile_name'] = test_user_profile['name'] if test_user_profile else 'Unknown Profile'
            child_users.append(test_user_data)
    
    return {
        "user": user_data,
        "user_profile": user_profile,
        "master_profile": master_profile,
        "has_master_profile": has_master_profile,
        "is_end_user": test_mode_end_user,  # Use test mode override
        "child_users": child_users,
        "show_user_profiles": not test_mode_end_user and len(child_users) > 0
    }

@api_router.get("/users/{user_id}/profile-details")
async def get_user_profile_details(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed profile information for a specific user"""
    # Find the target user
    target_user = next((u for u in dummy_data['users'] if u['id'] == user_id), None)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's profile
    user_profile = None
    if target_user.get('profile_id'):
        user_profile = next((p for p in dummy_data['profiles'] if p['id'] == target_user['profile_id']), None)
    
    # Remove password from user data
    target_user_data = target_user.copy()
    if "password" in target_user_data:
        del target_user_data["password"]
    
    return {
        "user": target_user_data,
        "profile": user_profile
    }

# Payments API Endpoints
@api_router.get("/payments")
async def get_payments(
    account_id: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get payment history with pagination"""
    # Enhanced dummy payment data with invoice details
    dummy_payments = [
        {
            'id': 'PAY-001',
            'payment_id': 'PAY-001',
            'account_id': 'self_acc_001',
            'amount': 245.50,
            'comment': 'Monthly electricity bill payment',
            'status': 'Completed',
            'payment_date': '2024-10-01',
            'method': 'Credit Card',
            'reference': 'PAY-CC-001',
            'invoice_id': 'INV-2024-001',
            'invoice_date': '2024-10-01',
            'due_date': '2024-11-01',
            'invoice_amount': 245.50
        },
        {
            'id': 'PAY-002',
            'payment_id': 'PAY-002',
            'account_id': 'self_acc_001',
            'amount': 95.00,
            'comment': 'Water service monthly charge',
            'status': 'Completed',
            'payment_date': '2024-09-28',
            'method': 'Bank Transfer',
            'reference': 'PAY-BT-002',
            'invoice_id': 'INV-2024-002',
            'invoice_date': '2024-09-28',
            'due_date': '2024-10-28',
            'invoice_amount': 95.00
        },
        {
            'id': 'PAY-003',
            'payment_id': 'PAY-003',
            'account_id': 'self_acc_001',
            'amount': 120.00,
            'comment': 'Internet service payment - pending processing',
            'status': 'Pending',
            'payment_date': '2024-09-25',
            'method': 'Credit Card',
            'reference': 'PAY-CC-003',
            'invoice_id': 'INV-2024-003',
            'invoice_date': '2024-09-25',
            'due_date': '2024-10-25',
            'invoice_amount': 120.00
        },
        {
            'id': 'PAY-004',
            'payment_id': 'PAY-004',
            'account_id': 'self_acc_001',
            'amount': 85.00,
            'comment': 'Security system maintenance fee',
            'status': 'Completed',
            'payment_date': '2024-09-22',
            'method': 'Cash',
            'reference': 'PAY-CSH-004',
            'invoice_id': 'INV-2024-004',
            'invoice_date': '2024-09-22',
            'due_date': '2024-10-22',
            'invoice_amount': 85.00
        },
        {
            'id': 'PAY-005',
            'payment_id': 'PAY-005',
            'account_id': 'self_acc_001',
            'amount': 320.00,
            'comment': 'HVAC system quarterly maintenance',
            'status': 'Completed',
            'payment_date': '2024-09-20',
            'method': 'Bank Transfer',
            'reference': 'PAY-BT-005',
            'invoice_id': 'INV-2024-005',
            'invoice_date': '2024-09-20',
            'due_date': '2024-10-20',
            'invoice_amount': 320.00
        },
        {
            'id': 'PAY-006',
            'payment_id': 'PAY-006',
            'account_id': 'self_acc_001',
            'amount': 150.00,
            'comment': 'Generator maintenance - payment failed, retrying',
            'status': 'Failed',
            'payment_date': '2024-09-18',
            'method': 'Credit Card',
            'reference': 'PAY-CC-006',
            'invoice_id': 'INV-2024-006',
            'invoice_date': '2024-09-15',
            'due_date': '2024-10-15',
            'invoice_amount': 150.00
        },
        {
            'id': 'PAY-007',
            'payment_id': 'PAY-007',
            'account_id': 'self_acc_001',
            'amount': 2500.00,
            'comment': 'Monthly office rent payment',
            'status': 'Completed',
            'payment_date': '2024-09-15',
            'method': 'Wire Transfer',
            'reference': 'PAY-WT-007',
            'invoice_id': 'INV-2024-007',
            'invoice_date': '2024-09-15',
            'due_date': '2024-10-15',
            'invoice_amount': 2500.00
        },
        {
            'id': 'PAY-008',
            'payment_id': 'PAY-008',
            'account_id': 'self_acc_001',
            'amount': 75.00,
            'comment': 'Parking fee monthly charge',
            'status': 'Completed',
            'payment_date': '2024-09-12',
            'method': 'Credit Card',
            'reference': 'PAY-CC-008',
            'invoice_id': 'INV-2024-008',
            'invoice_date': '2024-09-12',
            'due_date': '2024-10-12',
            'invoice_amount': 75.00
        },
        {
            'id': 'PAY-009',
            'payment_id': 'PAY-009',
            'account_id': 'self_acc_001',
            'amount': 450.00,
            'comment': 'Equipment lease payment - currently processing',
            'status': 'Processing',
            'payment_date': '2024-09-10',
            'method': 'Bank Transfer',
            'reference': 'PAY-BT-009',
            'invoice_id': 'INV-2024-009',
            'invoice_date': '2024-09-10',
            'due_date': '2024-10-10',
            'invoice_amount': 450.00
        },
        {
            'id': 'PAY-010',
            'payment_id': 'PAY-010',
            'account_id': 'self_acc_001',
            'amount': 180.00,
            'comment': 'Insurance premium auto-payment',
            'status': 'Completed',
            'payment_date': '2024-09-08',
            'method': 'Auto-pay',
            'reference': 'PAY-AP-010',
            'invoice_id': 'INV-2024-010',
            'invoice_date': '2024-09-08',
            'due_date': '2024-10-08',
            'invoice_amount': 180.00
        },
        {
            'id': 'PAY-011',
            'payment_id': 'PAY-011',
            'account_id': 'self_acc_001',
            'amount': 125.00,
            'comment': 'Office supplies purchase',
            'status': 'Completed',
            'payment_date': '2024-09-05',
            'method': 'Credit Card',
            'reference': 'PAY-CC-011',
            'invoice_id': 'INV-2024-011',
            'invoice_date': '2024-09-05',
            'due_date': '2024-10-05',
            'invoice_amount': 125.00
        },
        {
            'id': 'PAY-012',
            'payment_id': 'PAY-012',
            'account_id': 'self_acc_001',
            'amount': 299.00,
            'comment': 'Software license - refunded due to cancellation',
            'status': 'Refunded',
            'payment_date': '2024-09-02',
            'method': 'Credit Card',
            'reference': 'PAY-CC-012',
            'invoice_id': 'INV-2024-012',
            'invoice_date': '2024-09-02',
            'due_date': '2024-10-02',
            'invoice_amount': 299.00
        },
        {
            'id': 'PAY-013',
            'payment_id': 'PAY-013',
            'account_id': 'self_acc_001',
            'amount': 520.75,
            'comment': 'Quarterly utility bundle payment',
            'status': 'Completed',
            'payment_date': '2024-08-30',
            'method': 'Bank Transfer',
            'reference': 'PAY-BT-013',
            'invoice_id': 'INV-2024-013',
            'invoice_date': '2024-08-30',
            'due_date': '2024-09-30',
            'invoice_amount': 520.75
        },
        {
            'id': 'PAY-014',
            'payment_id': 'PAY-014',
            'account_id': 'self_acc_001',
            'amount': 67.25,
            'comment': 'Phone service monthly bill',
            'status': 'Completed',
            'payment_date': '2024-08-28',
            'method': 'Auto-pay',
            'reference': 'PAY-AP-014',
            'invoice_id': 'INV-2024-014',
            'invoice_date': '2024-08-28',
            'due_date': '2024-09-28',
            'invoice_amount': 67.25
        },
        {
            'id': 'PAY-015',
            'payment_id': 'PAY-015',
            'account_id': 'self_acc_001',
            'amount': 89.50,
            'comment': 'Maintenance service charge',
            'status': 'Completed',
            'payment_date': '2024-08-25',
            'method': 'Credit Card',
            'reference': 'PAY-CC-015',
            'invoice_id': 'INV-2024-015',
            'invoice_date': '2024-08-25',
            'due_date': '2024-09-25',
            'invoice_amount': 89.50
        }
    ]
    
    # Filter by account_id if provided
    if account_id:
        dummy_payments = [p for p in dummy_payments if p['account_id'] == account_id]
    
    # Pagination
    total_count = len(dummy_payments)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_payments = dummy_payments[start_idx:end_idx]
    
    return {
        'payments': paginated_payments,
        'total_count': total_count,
        'page': page,
        'limit': limit,
        'total_pages': (total_count + limit - 1) // limit
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)