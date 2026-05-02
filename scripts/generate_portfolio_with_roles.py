import json
from datetime import datetime

# Load the app data
with open('app_data_maximum.json', 'r') as f:
    app_data_list = json.load(f)

# Generate the HTML portfolio
html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App Development Portfolio - Maximum Data Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .search-bar {{
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .app-card {{
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            overflow: hidden;
        }}
        .app-card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }}
        .screenshot-carousel {{
            display: flex;
            overflow-x: auto;
            gap: 0.5rem;
            padding: 0.5rem;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }}
        .screenshot-carousel::-webkit-scrollbar {{
            height: 6px;
        }}
        .screenshot-carousel::-webkit-scrollbar-track {{
            background: #f1f5f9;
            border-radius: 3px;
        }}
        .screenshot-carousel::-webkit-scrollbar-thumb {{
            background: #cbd5e1;
            border-radius: 3px;
        }}
        .screenshot-carousel::-webkit-scrollbar-thumb:hover {{
            background: #94a3b8;
        }}
        .screenshot-item {{
            flex-shrink: 0;
            width: 120px;
            height: 213px;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: transform 0.2s ease;
            border: 2px solid transparent;
        }}
        .screenshot-item:hover {{
            transform: scale(1.05);
            border-color: #3b82f6;
        }}
        .modal {{
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
        }}
        .modal-content {{
            margin: auto;
            display: block;
            max-width: 90%;
            max-height: 90%;
            margin-top: 5%;
        }}
        .close {{
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }}
        .description-content {{
            max-height: 4.5rem;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }}
        .description-content.expanded {{
            max-height: none;
        }}
        .expand-btn {{
            color: #3b82f6;
            cursor: pointer;
            font-weight: 500;
            margin-top: 0.5rem;
            display: inline-block;
        }}
        .expand-btn:hover {{
            text-decoration: underline;
        }}
        .stats-card {{
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }}
        .source-api {{
            background: #3b82f6;
            color: white;
        }}
        .source-web {{
            background: #10b981;
            color: white;
        }}
        .source-local {{
            background: #f59e0b;
            color: white;
        }}
        .update-date {{
            position: absolute;
            top: 10px;
            right: 10px;
            background: #8b5cf6;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }}
        .metadata-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
        }}
        .metadata-item {{
            display: flex;
            justify-content: space-between;
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 0.5rem;
            border-left: 4px solid #3b82f6;
        }}
        .metadata-label {{
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
        }}
        .metadata-value {{
            font-size: 13px;
            color: #1e293b;
            font-weight: 500;
        }}
        .screenshot-count {{
            position: absolute;
            top: 10px;
            right: 50px;
            background: #ef4444;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
        }}
        
        /* App Header Layout */
        .app-header {{
            display: flex;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
        }}
        
        .app-icon {{
            width: 6rem;
            height: 6rem;
            border-radius: 0.75rem;
            flex-shrink: 0;
            object-fit: cover;
        }}
        
        .app-basic-info {{
            flex: 1;
            min-width: 0;
        }}
        
        .app-name {{
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }}
        
        .app-developer {{
            font-size: 1.125rem;
            color: #2563eb;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }}
        
        .app-version {{
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.75rem;
        }}
        
        /* My Role Badge */
        .my-role-badge {{
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 100%;
        }}
        
        .role-icon {{
            margin-right: 0.5rem;
            font-size: 1rem;
        }}
        
        .role-text {{
            line-height: 1.3;
        }}

        /* Source Badge Updates */
        .source-badge {{
            padding: 0.375rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
    </style>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div class="container mx-auto p-6">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold text-gray-800 mb-4">My App Development Portfolio</h1>
            <p class="text-xl text-gray-600">Showcasing {len(app_data_list)} innovative mobile applications</p>
            <p class="text-lg text-gray-500 mt-2">Maximum Data Edition - Sorted by latest updates</p>
        </div>

        <!-- Search and Stats -->
        <div class="mb-8">
            <div class="flex flex-col md:flex-row gap-4 mb-6">
                <input type="text" id="searchInput" placeholder="Search apps by name, developer, or category..." 
                       class="search-bar flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <select id="categoryFilter" class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                </select>
                <select id="sourceFilter" class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Sources</option>
                    <option value="iTunes API Enhanced">iTunes API Enhanced</option>
                    <option value="Web Scraping Enhanced">Web Scraping Enhanced</option>
                    <option value="Local Data">Local Data</option>
                </select>
            </div>
            
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="stats-card">
                    <div class="text-3xl font-bold text-blue-600">{len(app_data_list)}</div>
                    <div class="text-gray-600">Total Apps</div>
                </div>
                <div class="stats-card">
                    <div class="text-3xl font-bold text-green-600">{sum(len(app.get('screenshots', [])) for app in app_data_list)}</div>
                    <div class="text-gray-600">Total Screenshots</div>
                </div>
                <div class="stats-card">
                    <div class="text-3xl font-bold text-purple-600">{len(set(app.get('category', 'Unknown') for app in app_data_list))}</div>
                    <div class="text-gray-600">Categories</div>
                </div>
                <div class="stats-card">
                    <div class="text-3xl font-bold text-orange-600">{len([app for app in app_data_list if app.get('source') == 'Local Data'])}</div>
                    <div class="text-gray-600">Local Apps</div>
                </div>
            </div>
        </div>

        <!-- Apps Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
'''

# Generate app cards
for app in app_data_list:
    # Determine source badge class
    source_class = "source-api" if "iTunes API" in app.get('source', '') else "source-web" if "Web Scraping" in app.get('source', '') else "source-local"
    
    # Update date badge
    if app.get('last_updated_human'):
        update_date = app['last_updated_human']
    elif app.get('last_updated') and app['last_updated'] != 'Unknown':
        update_date = app['last_updated']
    else:
        update_date = 'Unknown'

    # Release date
    if app.get('release_date_human'):
        release_date = app['release_date_human']
    elif app.get('release_date') and app['release_date'] != 'Unknown':
        release_date = app['release_date']
    else:
        release_date = 'Unknown'

    # Current version release date
    if app.get('current_version_release_date_human'):
        current_version_date = app['current_version_release_date_human']
    elif app.get('current_version_release_date') and app['current_version_release_date'] != 'Unknown':
        current_version_date = app['current_version_release_date']
    else:
        current_version_date = 'Unknown'
    
    # Get screenshot count
    screenshot_count = len(app.get('screenshots', []))
    
    # Get description
    description = app.get('description', 'No description available.')
    is_long_description = len(description) > 200
    
    html_content += f'''
            <div class="app-card p-6 relative">
                <!-- Source Badge -->
                <div class="source-badge {source_class}">{app.get('source', 'Unknown')}</div>
                
                <!-- Update Date Badge -->
                <div class="update-date">{update_date}</div>
                
                <!-- Screenshot Count Badge -->
                <div class="screenshot-count">{screenshot_count}</div>
                
                <!-- App Icon and Basic Info -->
                <div class="app-header">
                    <img src="{app.get('icon', '')}" alt="{app.get('name', 'Unknown')} Icon" class="app-icon">
                    <div class="app-basic-info">
                        <h3 class="app-name">{app.get('name', 'Unknown')}</h3>
                        <p class="app-developer">{app.get('developer', 'Unknown')}</p>
                        <p class="app-version">Version {app.get('version', 'Unknown')}</p>
                        
                        <!-- My Role Field -->
                        <div class="my-role-badge">
                            <span class="role-icon">👨‍💻</span>
                            <span class="role-text">{app.get('my_role', 'Role not specified')}</span>
                        </div>
                    </div>
                </div>
                
                <!-- App Details -->
                <div class="mb-4">
                    <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>📱 {app.get('version', 'Unknown')}</span>
                        <span>💰 {app.get('price', 'Unknown')}</span>
                        <span>🎯 {app.get('age_rating', 'Unknown')}</span>
                        <span>⭐ {app.get('ratings', 'No ratings')}</span>
                    </div>
                    
                    <div class="mb-4">
                        <div class="description-content" id="desc-{app.get('app_store_id', 'unknown')}">
                            {description}
                        </div>
                        {f'<div class="expand-btn" onclick="toggleDescription(\'{app.get("app_store_id", "unknown")}\')">Show More</div>' if is_long_description else ''}
                    </div>
                </div>
                
                <!-- Screenshots -->
                {f'<div class="screenshot-carousel mb-4">' + ''.join([f'<img src="{screenshot}" alt="Screenshot" class="screenshot-item" onclick="openModal(\'{screenshot}\')">' for screenshot in app.get('screenshots', [])]) + '</div>' if app.get('screenshots') else ''}
                
                <!-- Metadata Grid -->
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <span class="metadata-label">Category:</span>
                        <span class="metadata-value">{app.get('category', 'Unknown')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Bundle ID:</span>
                        <span class="metadata-value">{app.get('bundle_id', 'Unknown')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Min OS Version:</span>
                        <span class="metadata-value">{app.get('minimum_os_version', 'Unknown')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Release Date:</span>
                        <span class="metadata-value">{release_date}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Last Updated:</span>
                        <span class="metadata-value">{update_date}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Current Version Date:</span>
                        <span class="metadata-value">{current_version_date}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">App Status:</span>
                        <span class="metadata-value">{app.get('app_status', 'Unknown')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Primary Genre ID:</span>
                        <span class="metadata-value">{app.get('primary_genre_id', 'Unknown')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Game Center:</span>
                        <span class="metadata-value">{'Yes' if app.get('is_game_center_enabled') else 'No'}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">VPP Licensing:</span>
                        <span class="metadata-value">{'Yes' if app.get('is_vpp_device_based_licensing_enabled') else 'No'}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Current Version Rating:</span>
                        <span class="metadata-value">{app.get('average_user_rating_for_current_version', 'No ratings')}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Current Version Rating Count:</span>
                        <span class="metadata-value">{app.get('user_rating_count_for_current_version', '0')}</span>
                    </div>
                </div>
            </div>
    '''

# Complete the HTML
html_content += '''
        </div>
    </div>

    <!-- Image Modal -->
    <div id="imageModal" class="modal" onclick="closeModal()">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script>
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const appCards = document.querySelectorAll('.app-card');
            
            appCards.forEach(card => {
                const appName = card.querySelector('.app-name').textContent.toLowerCase();
                const developer = card.querySelector('.app-developer').textContent.toLowerCase();
                const category = card.querySelector('.metadata-item .metadata-value').textContent.toLowerCase();
                
                if (appName.includes(searchTerm) || developer.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', function() {
            const selectedCategory = this.value.toLowerCase();
            const appCards = document.querySelectorAll('.app-card');
            
            appCards.forEach(card => {
                const category = card.querySelector('.metadata-item .metadata-value').textContent.toLowerCase();
                
                if (!selectedCategory || category === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Source filter
        document.getElementById('sourceFilter').addEventListener('change', function() {
            const selectedSource = this.value;
            const appCards = document.querySelectorAll('.app-card');
            
            appCards.forEach(card => {
                const source = card.querySelector('.source-badge').textContent;
                
                if (!selectedSource || source === selectedSource) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Populate category filter
        const categories = new Set();
        document.querySelectorAll('.metadata-item .metadata-value').forEach(el => {
            if (el.previousElementSibling && el.previousElementSibling.textContent.includes('Category:')) {
                categories.add(el.textContent);
            }
        });
        
        const categoryFilter = document.getElementById('categoryFilter');
        categories.forEach(category => {
            if (category !== 'Unknown') {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            }
        });

        // Modal functionality
        function openModal(imageSrc) {
            document.getElementById('modalImage').src = imageSrc;
            document.getElementById('imageModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        // Description toggle
        function toggleDescription(appId) {
            const content = document.getElementById('desc-' + appId);
            const btn = content.nextElementSibling;
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                btn.textContent = 'Show More';
            } else {
                content.classList.add('expanded');
                btn.textContent = 'Show Less';
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>
</html>
'''

# Write the HTML file
with open('portfolio_maximum.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Maximum data portfolio generated successfully!")
print("📁 File created: portfolio_maximum.html")
print("🌐 Open 'portfolio_maximum.html' in your browser to view the comprehensive portfolio!")
print("\n📊 Portfolio Features:")
print("   - 18 apps with maximum data")
print("   - Full descriptions with expand/collapse")
print("   - Up to 10 screenshots per app")
print("   - Enhanced metadata grid")
print("   - Additional URLs and links")
print("   - Professional layout and animations")
print("   - NEW: My Role field for each app")
