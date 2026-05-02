import json
import datetime

with open('data/app_data_maximum.json', 'r') as f:
    apps = json.load(f)

for app in apps:
    if app.get('name') == 'Melpot':
        app['release_date_human'] = 'Wednesday 15 April 2026'
        break

with open('data/app_data_maximum.json', 'w') as f:
    json.dump(apps, f, indent=2)

print("Updated Melpot date in JSON.")
