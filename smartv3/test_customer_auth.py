#!/usr/bin/env python3
"""
Test Customer Authentication
"""

import requests
import json
import random

BASE_URL = "http://localhost:8000/api"

def test_registration():
    print("🧪 TESTING CUSTOMER REGISTRATION")
    print("=" * 40)
    
    # Generate unique test data
    user_id = random.randint(1000, 9999)
    test_data = {
        "first_name": "Test",
        "last_name": "Customer",
        "email": f"test{user_id}@example.com",
        "phone": f"+25571234{user_id}",
        "password": "testpass123"
    }
    
    print(f"📤 Registering user: {test_data['email']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/accounts/register/",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📋 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📋 Response Body: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return test_data
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

def test_login(user_data):
    if not user_data:
        print("❌ No user data to test login")
        return False
        
    print(f"\n🧪 TESTING CUSTOMER LOGIN")
    print("=" * 40)
    
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }
    
    print(f"📤 Logging in user: {login_data['username']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/accounts/login/",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📋 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📋 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_backend_health():
    print("🧪 TESTING BACKEND HEALTH")
    print("=" * 40)
    
    try:
        # Test if Django server is running
        response = requests.get(f"{BASE_URL}/")
        print(f"📋 Backend Status: {response.status_code}")
        
        # Test specific endpoints
        endpoints = [
            "/accounts/register/",
            "/accounts/login/",
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.options(f"{BASE_URL}{endpoint}")
                print(f"✅ {endpoint}: Available (OPTIONS {response.status_code})")
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")
                
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")

if __name__ == "__main__":
    print("🔍 CUSTOMER AUTHENTICATION TEST SUITE")
    print("=" * 50)
    
    # Test backend health first
    test_backend_health()
    
    # Test registration
    user_data = test_registration()
    
    # Test login
    test_login(user_data)
    
    print(f"\n🎉 TEST SUITE COMPLETED")
    print("=" * 50)