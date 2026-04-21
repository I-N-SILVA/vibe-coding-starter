import requests

def test_api():
    url = "https://vibe-coding-starter-black.vercel.app/api/league/public/matches"
    try:
        response = requests.get(url)
        print(f"API Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"API Data: {data}")
            print(f"Number of matches: {len(data)}")
        else:
            print(f"API Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_api()
