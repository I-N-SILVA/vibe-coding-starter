#!/usr/bin/env python3
"""
Backend API Testing for PLYAZ
Tests the FastAPI proxy server and Next.js API endpoints
"""
import requests
import sys
from datetime import datetime

class PLYAZAPITester:
    def __init__(self, base_url="https://repo-review-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    json_response = response.json()
                    print(f"   Response: {json_response}")
                except:
                    print(f"   Response: {response.text[:200]}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test main health endpoint
        self.run_test(
            "Main Health Check",
            "GET",
            "health",
            200
        )
        
        # Test API health endpoint
        self.run_test(
            "API Health Check",
            "GET",
            "api/health",
            200
        )

    def test_api_proxy(self):
        """Test API proxy functionality"""
        print("\n" + "="*50)
        print("TESTING API PROXY")
        print("="*50)
        
        # Test basic API route
        self.run_test(
            "API Root",
            "GET",
            "api",
            200
        )

def main():
    print("🚀 Starting PLYAZ Backend API Tests")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Setup
    tester = PLYAZAPITester()
    
    # Run tests
    tester.test_health_endpoints()
    tester.test_api_proxy()

    # Print results
    print("\n" + "="*50)
    print("📊 TEST RESULTS")
    print("="*50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend tests PASSED!")
        return 0
    else:
        print("❌ Backend tests FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())