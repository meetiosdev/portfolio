import json
import urllib.request

with open('data/app_data_maximum.json', 'r') as f:
    apps = json.load(f)

# Fetch latest iTunes data
url = "https://itunes.apple.com/lookup?id=1483470338"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
itunes_data = json.loads(response.read().decode('utf-8'))

if itunes_data['resultCount'] > 0:
    app_info = itunes_data['results'][0]
    
    # Update Melpot in local JSON
    for app in apps:
        if app.get('app_store_id') == '1483470338':
            # Update Category
            app['category'] = app_info.get('primaryGenreName', 'Lifestyle')
            # Update Description
            app['description'] = app_info.get('description', app['description'])
            # Update Version
            app['version'] = app_info.get('version', app['version'])
            break

with open('data/app_data_maximum.json', 'w') as f:
    json.dump(apps, f, indent=2)

print("Updated Melpot data in JSON.")

