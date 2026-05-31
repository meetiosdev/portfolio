import os
import sys
import time
import subprocess
import requests

API_URL = "https://admin.meetiosdev.com/api/outreach/single-send"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1lZXRpb3MiLCJpYXQiOjE3ODAyNDM1MzIsImV4cCI6MTc4MDMyOTkzMn0.SEQy4qsbTUHGyM1sbqq8K4gsBvnRro9TDJGSLcH-d5Q"
STATE_FILE = "trial_state.txt"

TRIAL_1_BODY = """  // Explicit SMTP configuration using Port 465 (SSL) to bypass firewalls
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    auth: {
      user,
      pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });"""

TRIAL_2_BODY = """  // Explicit SMTP configuration using Port 587 (STARTTLS) with requireTLS
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user,
      pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });"""

TRIAL_3_BODY = """  // Explicit SMTP configuration using Port 465 (SSL) with verbose logs
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    auth: {
      user,
      pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });"""

TRIALS = {
    1: ("Trial 1: Port 465 with direct pool", TRIAL_1_BODY),
    2: ("Trial 2: Port 587 TLS with requireTLS", TRIAL_2_BODY),
    3: ("Trial 3: Port 465 SSL with Logger & Debug enabled", TRIAL_3_BODY)
}

def get_current_trial():
    if not os.path.exists(STATE_FILE):
        return 1
    with open(STATE_FILE, "r") as f:
        try:
            return int(f.read().strip())
        except ValueError:
            return 1

def save_current_trial(trial):
    with open(STATE_FILE, "w") as f:
        f.write(str(trial))

def apply_fix_to_file(trial_index):
    if trial_index not in TRIALS:
        print(f"❌ Error: Trial index {trial_index} does not exist.")
        return False
    
    desc, body = TRIALS[trial_index]
    print(f"🔧 Applying: {desc}...")

    route_path = "routes/outreach.js"
    if not os.path.exists(route_path):
        route_path = "backend/routes/outreach.js"
    if not os.path.exists(route_path):
        route_path = "../backend/routes/outreach.js"

    with open(route_path, "r") as f:
        content = f.read()

    # Find the bounds of getTransporter helper function
    start_tag = "const getTransporter = () => {"
    end_tag = "};"
    
    start_idx = content.find(start_tag)
    if start_idx == -1:
        print("❌ Could not find getTransporter function in outreach.js!")
        return False
    
    # Locate the matching end tag of the function
    # Search forward from start_idx
    # The getTransporter helper ends with "};" followed by newline or next route comments
    # We find the next closing bracket + semicolon of the function
    end_idx = content.find("};", start_idx + len(start_tag))
    if end_idx == -1:
        print("❌ Could not find closing of getTransporter function in outreach.js!")
        return False
    
    end_idx += 2 # include the closing bracket and semicolon

    # Reconstruct function
    new_function = f"""const getTransporter = () => {{
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {{
    throw new Error('Gmail outreach credentials (GMAIL_USER or GMAIL_APP_PASSWORD) are not configured in backend/.env');
  }}

{body}
}};"""

    updated_content = content[:start_idx] + new_function + content[end_idx:]

    with open(route_path, "w") as f:
        f.write(updated_content)
    
    print(f"✅ Modified routes/outreach.js successfully.")
    return True

def trigger_git_deploy(trial_index):
    desc, _ = TRIALS[trial_index]
    print("🐙 Committing and pushing changes to trigger Render redeployment...")
    try:
        subprocess.run(["git", "add", "routes/outreach.js"], check=True)
    except subprocess.CalledProcessError:
        subprocess.run(["git", "add", "backend/routes/outreach.js"], check=True)
    
    subprocess.run(["git", "commit", "-m", f"fix: Apply nodemailer SMTP timeout {desc}"], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)
    print("🚀 Git Push succeeded! Render build triggered.")

def run_loop():
    while True:
        print("\n--------------------------------------------------")
        print(f"📡 Testing Outreach API Endpoint: {API_URL}...")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        }
        
        payload = {
            "email": "stara93@gmail.com",
            "name": "Jane",
            "subject": "Senior iOS Engineer Opportunity - Swarajmeet Singh",
            "body": "Hi Jane,\n\nI hope you are doing well. I am looking for a professional job change.\n\nPortfolio: https://meetiosdev.com/"
        }

        try:
            # 10s connection timeout, 20s read timeout
            response = requests.post(API_URL, json=payload, headers=headers, timeout=(10, 20))
            print(f"📊 Response Status: {response.status_code}")
            try:
                print(f"📦 Response Body: {response.json()}")
                body_data = response.json()
            except ValueError:
                print(f"📦 Response Body (Raw): {response.text[:200]}")
                body_data = {}

            if response.status_code == 200:
                print("\n🚀 SUCCESS: Email endpoint is working 100%!")
                # Reset trial state on ultimate success
                if os.path.exists(STATE_FILE):
                    os.remove(STATE_FILE)
                break

            elif response.status_code == 500 or "timeout" in str(body_data.get("error", "")).lower():
                print("⚠️ API returned 500 error or SMTP Connection Timeout.")
                trial = get_current_trial()
                if trial > 3:
                    print("🛑 All 3 trials have been attempted and failed. Loop stopped.")
                    break
                
                print(f"🔄 Activating Self-Healing Protocol: Trial {trial}/3")
                if apply_fix_to_file(trial):
                    trigger_git_deploy(trial)
                    save_current_trial(trial + 1)
                    
                    wait_time = 90
                    print(f"⏳ Waiting {wait_time} seconds for Render to build and start the new server container...")
                    time.sleep(wait_time)
                else:
                    print("❌ Aborting self-healing: file edit failed.")
                    break
            else:
                print(f"🛑 Received unhandled status code {response.status_code}. Stopping test loop.")
                break

        except requests.exceptions.RequestException as req_err:
            print(f"🔌 Network request failed: {req_err}")
            # If it's a request timeout, treat it as a 500 timeout for the next trial
            trial = get_current_trial()
            if trial > 3:
                print("🛑 All 3 trials have been attempted. Loop stopped.")
                break
            
            print(f"🔄 Activating Self-Healing Protocol via Connection Error: Trial {trial}/3")
            if apply_fix_to_file(trial):
                trigger_git_deploy(trial)
                save_current_trial(trial + 1)
                
                wait_time = 90
                print(f"⏳ Waiting {wait_time} seconds for Render to build...")
                time.sleep(wait_time)
            else:
                break

if __name__ == "__main__":
    run_loop()
