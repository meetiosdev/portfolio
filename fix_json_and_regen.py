import json

with open('data/app_data_maximum.json', 'r') as f:
    apps = json.load(f)

# Find Melpot and MO mobyyou
melpot_idx = -1
mo_idx = -1

for i, app in enumerate(apps):
    if app.get('name') == 'Melpot':
        melpot_idx = i
        # Fix missing release_date_human
        if 'release_date_human' not in app:
            app['release_date_human'] = 'Monday 25 November 2019'
    elif app.get('name') == 'MO - mobyyou':
        mo_idx = i

# Reorder: Melpot first, MO mobyyou second
if melpot_idx != -1 and mo_idx != -1:
    melpot_app = apps.pop(melpot_idx)
    
    # After popping Melpot, mo_idx might have changed if mo_idx > melpot_idx
    # So let's find it again
    for i, app in enumerate(apps):
        if app.get('name') == 'MO - mobyyou':
            mo_idx = i
            break
            
    mo_app = apps.pop(mo_idx)
    
    # Insert at top
    apps.insert(0, mo_app)
    apps.insert(0, melpot_app)

with open('data/app_data_maximum.json', 'w') as f:
    json.dump(apps, f, indent=2)

print("JSON updated.")

