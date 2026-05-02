import json
import urllib.request
import os
import ssl
from datetime import datetime

# Bypass SSL verification issues if any
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('data/app_data_maximum.json', 'r') as f:
    apps = json.load(f)

headers = {'User-Agent': 'Mozilla/5.0'}

def download_image(url, save_path):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response, open(save_path, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

for app in apps:
    app_id = app.get('app_store_id')
    if not app_id:
        continue
        
    print(f"\nSyncing {app.get('name')} (ID: {app_id})...")
    
    # Try fetching from iTunes API (India first, fallback to US)
    urls = [
        f"https://itunes.apple.com/lookup?id={app_id}&country=in",
        f"https://itunes.apple.com/lookup?id={app_id}&country=us"
    ]
    
    app_info = None
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            response = urllib.request.urlopen(req, context=ctx)
            data = json.loads(response.read().decode('utf-8'))
            if data['resultCount'] > 0:
                app_info = data['results'][0]
                break
        except Exception as e:
            continue
            
    if not app_info:
        print(f"Could not find data for {app.get('name')}")
        continue
        
    # Format current date to human readable (e.g. Wednesday 15 April 2026)
    # The iTunes API usually gives: "2026-04-15T10:34:07Z"
    try:
        raw_date = app_info.get('currentVersionReleaseDate', app_info.get('releaseDate'))
        dt = datetime.strptime(raw_date, "%Y-%m-%dT%H:%M:%SZ")
        app['release_date_human'] = dt.strftime("%A %d %B %Y")
    except Exception as e:
        pass
        
    app['category'] = app_info.get('primaryGenreName', app.get('category'))
    app['description'] = app_info.get('description', app.get('description'))
    app['version'] = app_info.get('version', app.get('version'))
    
    # Setup directory for images
    safe_name = app.get('name').lower().replace(' ', '_').replace('-', '').replace('__', '_').strip('_')
    # Use existing folder name if it exists in the icon path
    existing_icon = app.get('icon', '')
    if 'assets/images/' in existing_icon:
        parts = existing_icon.split('assets/images/')
        if len(parts) > 1:
            safe_name = parts[1].split('/')[0]
            
    img_dir = os.path.join('assets', 'images', safe_name)
    os.makedirs(img_dir, exist_ok=True)
    
    # Download Icon
    icon_url = app_info.get('artworkUrl512')
    if icon_url:
        icon_path = os.path.join(img_dir, 'appicon_official.png')
        if download_image(icon_url, icon_path):
            app['icon'] = f"./assets/images/{safe_name}/appicon_official.png"
            print(f"Downloaded icon for {app.get('name')}")
            
    # Download Screenshots
    screenshot_urls = app_info.get('screenshotUrls', [])
    new_screenshots = []
    for idx, s_url in enumerate(screenshot_urls[:4]):
        s_path = os.path.join(img_dir, f'screenshot_{idx+1}.png')
        if download_image(s_url, s_path):
            new_screenshots.append(f"./assets/images/{safe_name}/screenshot_{idx+1}.png")
            
    if new_screenshots:
        app['screenshots'] = new_screenshots
        print(f"Downloaded {len(new_screenshots)} screenshots for {app.get('name')}")

with open('data/app_data_maximum.json', 'w') as f:
    json.dump(apps, f, indent=2)

print("\n--- SYNC COMPLETE ---")
