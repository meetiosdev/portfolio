import sys
import requests

# Local Host Server Configuration
LOCAL_API_URL = "http://localhost:3000/api/outreach/single-send"
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1lZXRpb3MiLCJpYXQiOjE3ODAyNDM1MzIsImV4cCI6MTc4MDMyOTkzMn0.SEQy4qsbTUHGyM1sbqq8K4gsBvnRro9TDJGSLcH-d5Q"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {JWT_TOKEN}"
}

payload = {
    "email": "stara93@gmail.com",
    "name": "Jane",
    "subject": "Senior iOS Engineer Opportunity - Swarajmeet Singh",
    "body": "Hi Jane,\n\nI hope you are doing well. I am a Senior iOS Software Engineer currently looking for a professional job change.\n\nYou can review my credentials here: https://meetiosdev.com/\n\nBest regards,\nSwarajmeet Singh"
}

def test_localhost():
    print("📡 Sending local test request...")
    print(f"🔗 Target: {LOCAL_API_URL}")
    print(f"✉️ Recipient: {payload['email']}")
    
    try:
        # Send post request with a standard 15s timeout
        response = requests.post(LOCAL_API_URL, json=payload, headers=headers, timeout=15)
        
        print("\n---------------- RESPONSE DETAILS ----------------")
        print(f"📊 Status Code: {response.status_code}")
        
        try:
            print(f"📦 Body: {response.json()}")
        except ValueError:
            print(f"📦 Body (Raw): {response.text}")
            
        if response.status_code == 200:
            print("\n🚀 SUCCESS! Your local server successfully sent the email via Gmail SMTP!")
            print("You can open http://localhost:3000/single_email in your browser to run the workstation locally!")
        else:
            print("\n❌ FAILED: The local server returned an error.")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR: Could not connect to http://localhost:3000.")
        print("👉 Make sure your local Node.js server is running!")
        print("👉 Go to the '/backend' directory and run: npm run dev")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_localhost()
