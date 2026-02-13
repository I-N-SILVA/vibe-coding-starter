#!/usr/bin/env python3

import requests
import sys
import os
import json
from datetime import datetime
import uuid

class PLYAZAPITester:
    def __init__(self, base_url="http://localhost:6006"):
        self.base_url = base_url
        self.session_cookie = None
        self.access_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        print(f"🎯 Testing PLYAZ League Management API at: {base_url}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Setup headers
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
        
        # Setup cookies
        request_cookies = {}
        if cookies:
            request_cookies.update(cookies)
        if self.session_cookie:
            request_cookies.update(self.session_cookie)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, cookies=request_cookies, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, cookies=request_cookies, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, cookies=request_cookies, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, cookies=request_cookies, timeout=30)

            print(f"   Status: {response.status_code}")
            
            # Try to parse JSON response
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)}")
            except:
                response_data = response.text
                print(f"   Response (text): {response_data[:200]}...")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")

            return success, response_data, response

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}, None

    def test_health_check(self):
        """Test basic app health"""
        print("\n🏥 Testing basic app health...")
        
        # Test if the main page loads
        success, _, response = self.run_test(
            "Main page load",
            "GET",
            "/",
            200
        )
        
        if success:
            print("✅ Main app is running")
        return success

    def test_login_page_loads(self):
        """Test if login page loads correctly"""
        success, _, _ = self.run_test(
            "Login page loads",
            "GET",
            "/login",
            200
        )
        return success

    def test_organization_api_get_without_auth(self):
        """Test organizations API without authentication - should fail"""
        success, response_data, _ = self.run_test(
            "Get organizations (no auth)",
            "GET",
            "/api/league/organizations",
            401  # Should be unauthorized
        )
        return success

    def test_organization_api_post_without_auth(self):
        """Test create organization API without authentication - should fail"""
        org_data = {
            "name": f"Test Organization {uuid.uuid4().hex[:8]}",
            "slug": f"test-org-{uuid.uuid4().hex[:8]}"
        }
        
        success, response_data, _ = self.run_test(
            "Create organization (no auth)",
            "POST",
            "/api/league/organizations",
            401,  # Should be unauthorized
            data=org_data
        )
        return success

    def test_signup_api_flow(self):
        """Test the signup API flow directly"""
        print("\n👤 Testing Supabase Auth Integration...")
        
        # Since we can't easily test the full Supabase auth flow in a simple script,
        # we'll check if the auth endpoints are properly set up
        
        # Test auth callback endpoint (should exist)
        success, _, _ = self.run_test(
            "Auth callback endpoint",
            "GET",
            "/auth/callback",
            400  # Bad request without proper auth params is expected
        )
        
        return success

    def test_api_routes_structure(self):
        """Test that API routes are structured correctly"""
        print("\n🛤️  Testing API route structure...")
        
        # Test league API base
        success1, _, _ = self.run_test(
            "League API base access",
            "GET",
            "/api/league",
            404  # Not found is expected as this isn't a real endpoint
        )
        
        # Test league organizations endpoint structure
        success2, _, _ = self.run_test(
            "Organizations endpoint structure",
            "GET",
            "/api/league/organizations",
            401  # Unauthorized is expected
        )
        
        return success2  # Focus on the organizations endpoint

def main():
    """Main testing function"""
    print("🚀 Starting PLYAZ League Management API Tests")
    print("=" * 50)
    
    # Get base URL from environment or use default
    base_url = os.environ.get('NEXT_PUBLIC_APP_URL', 'http://localhost:6006')
    print(f"Testing against: {base_url}")
    
    tester = PLYAZAPITester(base_url)
    
    # Run health checks first
    if not tester.test_health_check():
        print("❌ App is not running properly. Stopping tests.")
        return 1
    
    # Test page loads
    tester.test_login_page_loads()
    
    # Test API structure
    tester.test_api_routes_structure()
    
    # Test authentication requirements
    tester.test_organization_api_get_without_auth()
    tester.test_organization_api_post_without_auth()
    
    # Test auth integration
    tester.test_signup_api_flow()
    
    # Print results
    print(f"\n📊 Test Summary")
    print("=" * 30)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())