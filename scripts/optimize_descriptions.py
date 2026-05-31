#!/usr/bin/env python3
"""
App Store Description Optimizer Pipeline
Swarajmeet Portfolio Website Tool

This script fetches the latest descriptions of your portfolio apps, rewrites/normalizes
them into highly engaging, layman-friendly, and professional summaries of approximately
400 characters, and automatically recompiles the portfolio Projects view.

Usage:
  python3 scripts/optimize_descriptions.py

Supports:
  - Dynamic live App Store lookup (iTunes API).
  - Dynamic AI-powered generation (Gemini REST API) if GEMINI_API_KEY is in environment.
  - Premium high-impact built-in caching fallback to run instantly without setup/CORS blocks.
"""

import os
import json
import urllib.request
import urllib.parse
import shutil
import ssl
import subprocess

# Secure SSL Context (OWASP A07:2021)
ctx = ssl.create_default_context()

# Backup Paths
DB_PATH = 'data/app_data_maximum.json'
DB_BACKUP_PATH = 'data/app_data_maximum.json.bak'
HTML_PATH = 'projects/index.html'
HTML_BACKUP_PATH = 'projects/index.html.bak'

# High-fidelity, hand-crafted summaries (Layman-friendly, ~400 chars, clean English translations)
PRE_OPTIMIZED_SUMMARIES = {
    "1483470338": (
        "Melpot is a community-driven social platform designed for creators, educators, and niche group leaders "
        "to build, manage, and monetize their content in one unified space. Unlike feed-based networks, it "
        "focuses on interest-based groups, enabling deep audience engagement through posts, media, and voice "
        "conversations. It solves platform fatigue by giving creators direct control and clean monetization tools."
    ),
    "6502833919": (
        "MO - mobyyou is a cutting-edge lifestyle and productivity platform designed to deliver a modern, "
        "intuitive mobile experience. The app connects users with local events, personalized activity "
        "recommendations, and seamless social sharing features. By streamlining daily planning and intuitive "
        "navigation, it solves the challenge of finding relevant local experiences, combining creativity with "
        "technical excellence."
    ),
    "1594612656": (
        "Droob is an innovative logistics app that connects customers with reliable moving and delivery "
        "services. It offers real-time route tracking, instant pricing, and seamless booking for a "
        "stress-free experience. By integrating advanced route optimization, flexible delivery scheduling, "
        "and secure payments, Droob solves common moving headaches and brings transparency, efficiency, "
        "and speed to local logistics."
    ),
    "1658528448": (
        "Franck Muller Labs is a premium lifestyle application that connects watch enthusiasts with the world "
        "of haute horlogerie. It bridges traditional craftsmanship with modern digital innovation, offering "
        "personalized luxury watch collections, interactive experiences, and high-end tracking features. "
        "Designed for collectors and connoisseurs, the app delivers a seamless digital gateway to timeless elegance."
    ),
    "1563894860": (
        "LuxBubble Provider is a business management app tailored for beauty, hair, makeup, and wellness "
        "professionals. It serves as a salon-in-your-pocket, allowing service providers to manage their "
        "profiles, calendars, and online payments easily. With built-in tools for appointment notifications, "
        "staff scheduling, and revenue tracking, it empowers local beauty experts to grow their business and go mobile."
    ),
    "1613869173": (
        "LuxBubble Staff is a dedicated app designed for beauty and styling professionals working under registered "
        "salons. It simplifies daily workflows by letting staff members manage their booking calendars, receive "
        "real-time appointment notifications, and chat directly with clients. By facilitating schedule "
        "coordination, booking reviews, and earnings tracking, it helps salon staff optimize their daily productivity."
    ),
    "1620827707": (
        "LuxBubble is a premium lifestyle app that connects customers with local beauty and wellness service "
        "providers. It serves as a personal salon finder, enabling users to easily search, book, and pay for "
        "services like hair, makeup, and massage using geo-location. With instant pre-payment, live provider "
        "tracking, and in-app chat, it simplifies booking beauty services on-demand, anywhere, anytime."
    ),
    "1615705146": (
        "LandBurro is a comprehensive outdoor rental marketplace that connects travelers with daily land rentals, "
        "private lodging, and outdoor experiences like hunting, fishing, and camping. It solves the challenge of "
        "finding exclusive private land for recreational activities, offering hosts secure general liability "
        "insurance and guests interactive search tools, map views, and real-time booking flexibility."
    ),
    "1580558024": (
        "Blendly is a premium, free digital business card platform designed for modern professionals and "
        "entrepreneurs. The app enables users to easily create multiple custom digital business cards, share "
        "them instantly via QR code or links, and organize received contacts in a smart, searchable library. "
        "It solves the problem of paper waste and lost connections, keeping networking efficient, clean, and organized."
    ),
    "1580720703": (
        "MentorCalls is an innovative business and personal development app that connects users with the world’s "
        "leading minds for instant 1:1 video consultations. It solves the barrier of accessing high-profile advice, "
        "letting mentees ask burning questions about sports, music, and business. Users receive personalized "
        "video mentorship, take a memorable call photo, and support global charities in the process."
    ),
    "1580735075": (
        "MC For Mentors is a professional video consultation app designed for industry experts, global leaders, "
        "and mentors to conduct 1:1 sessions with eager mentees. It provides a secure, streamlined platform "
        "for managing booking requests, hosting high-quality video calls, and organizing charity donations. "
        "It solves calendar scheduling for high-profile advisors while helping them easily monetize their expertise."
    ),
    "1556052164": (
        "Cabau is a premium health and fitness companion designed to help women build healthy workout habits "
        "anywhere, anytime. The app offers high-quality, step-by-step video workouts coached by Yolanthe, "
        "alongside integrated music apps, progress tracking, and daily motivational tips. By providing flexible "
        "10 to 30-minute training plans and mindfulness sessions, it makes achieving a balanced lifestyle easy."
    ),
    "1510612580": (
        "Tabler is a social marketplace for clubbing and VIP hospitality, allowing users to invite others, "
        "share table costs, and access exclusive venues worldwide. It solves the high cost of VIP night outs by "
        "letting hosts list available spots and allowing guests to request joins and split bills with a few taps. "
        "It creates a fun, affordable way to make friends and enjoy premium nightlife experiences."
    ),
    "1487463982": (
        "Diet Zone is a comprehensive health app designed to make dieting simple and effective. It integrates "
        "seamlessly with Apple HealthKit to automatically track steps and calculate active calories burned, "
        "enabling precise calorie balance management. The app serves as a personal wellness guide, helping "
        "users track their diet progress, discover healthy recipes, and shop for curated international products."
    ),
    "1482766414": (
        "Audiovibes is a dedicated educational and entertainment platform that produces and curates regional "
        "language audiobooks and podcasts. It focuses on bringing rich Asian literature, which is not yet "
        "widely digitized, into high-quality audio formats. Solving the lack of localized cultural content, "
        "the app provides a smooth, accessible listening experience for audio enthusiasts and lifelong learners."
    ),
    "853081662": (
        "Alhendín is a comprehensive local community application designed for the residents and visitors of "
        "Alhendín, Spain. It serves as a digital town guide, providing real-time local news, cultural and sports "
        "calendars, bus schedules, and a geo-localized directory of municipal services. By delivering instant "
        "push alerts, it solves the challenge of keeping the community connected, informed, and safe."
    ),
    "1527996761": (
        "Canna&Biotic is a pioneer social venture and medical cannabis platform that provides reliable, "
        "up-to-date guidance for patients in Israel and abroad. The app serves as an informative hub, "
        "offering users accessible medical cannabis research, doctor consult paths, and safety advice. By "
        "centralizing expert guides and product information, it solves the challenge of navigating complex "
        "medical treatments."
    ),
    "6739875013": (
        "Henri is a premium personal finance app designed to help users master their money through "
        "interactive learning, expense tracking, and goal setting. It turns complex budgeting, income "
        "tracking, and investment planning into a fun, gamified experience with quizzes and friendly "
        "competitions. Suitable for anyone seeking financial wellness, Henri simplifies wealth building "
        "and guides your financial journey."
    )
}

def backup_files():
    """Generates redundant recovery backups before executing database edits."""
    if os.path.exists(DB_PATH):
        shutil.copy2(DB_PATH, DB_BACKUP_PATH)
        print(f"✓ Backed up database to {DB_BACKUP_PATH}")
    if os.path.exists(HTML_PATH):
        shutil.copy2(HTML_PATH, HTML_BACKUP_PATH)
        print(f"✓ Backed up projects page to {HTML_BACKUP_PATH}")

def fetch_app_store_description(app_id):
    """Fetches full production description from iTunes API."""
    url = f"https://itunes.apple.com/lookup?id={app_id}&country=us"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data['resultCount'] > 0:
                return data['results'][0].get('description', '')
    except Exception as e:
        print(f"  ⚠ iTunes API fetch failed for {app_id}: {e}")
    return None

def generate_ai_summary(api_key, app_name, raw_desc):
    """Performs a direct REST API call to Gemini model endpoint to generate the ~400 character summary."""
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = (
        f"You are an expert copywriter. Optimize the following App Store description for a premium developer portfolio website.\n"
        f"The goal is to have consistent, user-friendly project descriptions of roughly 400 characters (MUST be between 370 and 430 characters).\n\n"
        f"Requirements:\n"
        f"- Rewrite the description into a simple, easy-to-understand summary that clearly explains the app's purpose, key features, and business objective.\n"
        f"- If the description is in a foreign language (e.g. Spanish, Hebrew), rewrite it fully in clean English.\n"
        f"- Use simple, layperson-friendly language (no technical jargon).\n"
        f"- Focus on explaining what the app does, who it is for, and what problem it solves.\n"
        f"- Ensure the final summary is concise, professional, and suitable for a Senior iOS Developer's portfolio.\n"
        f"- DO NOT return any preamble, quotes, markdown formatting, or HTML tags. Return ONLY the raw plain text summary.\n"
        f"- Keep the length strictly around 400 characters.\n\n"
        f"App Name: {app_name}\n"
        f"Original Description:\n{raw_desc}"
    )

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2
        }
    }
    
    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, context=ctx) as response:
            res = json.loads(response.read().decode('utf-8'))
            candidate = res['candidates'][0]['content']['parts'][0]['text']
            return candidate.strip()
    except Exception as e:
        print(f"  ⚠ Gemini API call failed: {e}")
    return None

def optimize_descriptions():
    """Execution pipeline targeting app_data_maximum.json."""
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    print("--- STARTING APP STORE DESCRIPTION OPTIMIZER ---")
    backup_files()

    with open(DB_PATH, 'r') as f:
        apps = json.load(f)

    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        print("⚡ Active GEMINI_API_KEY detected. Running live AI optimization pipeline.")
    else:
        print("ℹ No GEMINI_API_KEY in environment. Using premium pre-optimized cache dictionary.")

    modified_count = 0

    for idx, app in enumerate(apps):
        app_id = str(app.get('app_store_id', ''))
        app_name = app.get('name', 'Unknown App')
        
        if not app_id:
            print(f"\n[{idx+1}/{len(apps)}] Skipping '{app_name}' (No App Store ID).")
            continue

        print(f"\n[{idx+1}/{len(apps)}] Processing '{app_name}' (ID: {app_id})...")
        
        summary = None

        if api_key:
            # 1. Attempt live App Store description fetch
            print(f"  → Fetching description from App Store...")
            raw_desc = fetch_app_store_description(app_id)
            if not raw_desc:
                print("  → App Store description empty or unavailable. Using database fallback description.")
                raw_desc = app.get('description', '')
                
            if raw_desc:
                # 2. Query Gemini model dynamically
                print("  → Generating optimized summary via Gemini AI...")
                summary = generate_ai_summary(api_key, app_name, raw_desc)
                if summary:
                    print(f"  ✓ Dynamic summary generated successfully ({len(summary)} chars).")
            
        # 3. Cache fallback
        if not summary:
            if app_id in PRE_OPTIMIZED_SUMMARIES:
                summary = PRE_OPTIMIZED_SUMMARIES[app_id]
                print(f"  ✓ Loaded hand-crafted cache summary ({len(summary)} chars).")
            else:
                print("  ⚠ No pre-optimized summary found in cache. Truncating current description.")
                desc = app.get('description', '')
                summary = desc[:400] + "..." if len(desc) > 400 else desc

        # Update JSON record
        app['description'] = summary
        modified_count += 1

    # Save database changes
    with open(DB_PATH, 'w') as f:
        json.dump(apps, f, indent=2)
    print(f"\n✓ Saved updated descriptions for {modified_count} apps to {DB_PATH}")

    # 4. Recompile Projects view
    print("\n→ Recompiling portfolio projects/index.html web view...")
    try:
        res = subprocess.run(['python3', 'scripts/generate_projects_page.py'], capture_output=True, text=True)
        if res.returncode == 0:
            print("✓ Successfully regenerated projects/index.html")
        else:
            print(f"⚠ generate_projects_page.py returned exit code {res.returncode}: {res.stderr}")
    except Exception as e:
        print(f"⚠ Failed to execute generate_projects_page.py: {e}")

    print("\n--- OPTIMIZATION PIPELINE COMPLETE ---")

if __name__ == '__main__':
    optimize_descriptions()
