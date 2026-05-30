import json
import re
import html
from datetime import datetime

with open('data/app_data_maximum.json', 'r') as f:
    apps = json.load(f)

def get_app_date(app):
    date_str = app.get("release_date_human", "")
    if not date_str:
        return datetime.min
    try:
        return datetime.strptime(date_str, "%A %d %B %Y")
    except ValueError:
        return datetime.min

apps.sort(key=get_app_date, reverse=True)

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>All Projects | Swarajmeet - iOS Developer</title>
    <link rel="icon" href="../assets/images/favicon.png" type="image/png">
    
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.clarity.ms https://scripts.clarity.ms https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://*.supabase.co https://itunes.apple.com https://www.clarity.ms https://c.clarity.ms https://s.clarity.ms https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self';">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">

    <!-- Production CSS -->
    <link rel="stylesheet" href="../dist/output.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="../assets/css/styles.css">

    <!-- First-party tracking and UI scripts -->
    <script src="../assets/js/supabase-tracking.js" defer></script>
    <script src="../assets/js/analytics.js" defer></script>
</head>
<body class="bg-background text-on-background transition-colors duration-300 font-body-md text-body-md selection:bg-primary selection:text-on-primary">

    <header>
        <nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-20">
            <div class="max-w-[1140px] mx-auto px-8 flex items-center justify-between h-full font-['Inter'] antialiased tracking-tight text-sm font-medium">
                <a href="../" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="../assets/images/profile.jpeg" alt="Swarajmeet" class="w-8 h-8 rounded-full object-cover border border-outline-variant">
                    <span class="text-xl font-bold tracking-tighter text-on-background">Swarajmeet</span>
                </a>
                <div class="segmented-control hidden md:flex">
                    <input type="radio" name="options" id="nav-home">
                    <label for="nav-home" data-href="../index.html">Home</label>

                    <input type="radio" name="options" id="nav-projects" checked>
                    <label for="nav-projects" data-href="../index.html#work">Projects</label>

                    <input type="radio" name="options" id="nav-experience">
                    <label for="nav-experience" data-href="../index.html#experience">Experience</label>

                    <input type="radio" name="options" id="nav-contact">
                    <label for="nav-contact" data-href="../index.html#contact">Contact</label>

                    <div class="selection-pill"></div>
                </div>
                <div class="flex items-center gap-6">
                    <button id="theme-toggle" class="active:scale-95 transition-transform duration-200 cursor-pointer" aria-label="Toggle Dark Mode">
                        <span id="theme-toggle-icon" class="material-symbols-outlined text-on-background transition-all duration-300" data-icon="dark_mode">dark_mode</span>
                    </button>
                    <!-- Mobile Menu Trigger -->
                    <div class="md:hidden flex items-center">
                        <button id="mobile-menu-trigger" class="material-symbols-outlined text-on-background active:scale-95 transition-transform" data-icon="menu">menu</button>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu Dropdown -->
            <div id="mobile-menu" class="hidden absolute top-20 left-0 w-full bg-background/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-lg flex-col items-center py-6 space-y-6 md:hidden transition-all">
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="../index.html">Home</a>
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="../index.html#work">Projects</a>
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="../index.html#experience">Experience</a>
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="../index.html#contact">Contact</a>
            </div>
        </nav>
    </header>

    <main id="content-area" class="pt-[140px] pb-[120px] px-8">
        <div class="max-w-[1140px] mx-auto">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-4">
                <h1 class="font-display text-display text-on-background m-0">Detailed Case Studies</h1>
                
                <!-- App Store Badge -->
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mt-4 md:mt-0">
                    <span class="relative flex h-2.5 w-2.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span class="text-xs font-bold text-green-600 dark:text-green-400 tracking-wider uppercase">App Store portfolio</span>
                </div>
            </div>
            
            <p class="font-body-lg text-body-lg text-secondary mb-16 max-w-2xl">
                A comprehensive showcase of my professional iOS development work. Each application represents a unique technical challenge, from real-time logistics to luxury e-commerce.
            </p>

            <div class="space-y-24">
{projects_html}
            </div>
        </div>
    </main>

    <footer class="w-full py-20 border-t border-outline-variant bg-surface mt-20">
        <div class="max-w-[1140px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 font-['Inter'] text-xs uppercase tracking-widest">
            <p class="text-secondary">&copy; 2026 Swarajmeet. Built with Swift precision.</p>
            <div class="flex gap-4 flex-wrap justify-center">
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://www.linkedin.com/in/swarajmeet/" target="_blank" rel="noopener noreferrer" data-track="LinkedIn">LinkedIn</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://github.com/meetiosdev" target="_blank" rel="noopener noreferrer" data-track="GitHub">GitHub</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://stackoverflow.com/users/10851721/meet-ios-developer" target="_blank" rel="noopener noreferrer" data-track="StackOverflow">StackOverflow</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://twitter.com/Swarajmeet" target="_blank" rel="noopener noreferrer" data-track="Twitter">Twitter (X)</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://instagram.com/swarajmeet" target="_blank" rel="noopener noreferrer" data-track="Instagram">Instagram</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://t.me/meetheiosdev" target="_blank" rel="noopener noreferrer" data-track="Telegram">Telegram</a>
                <a class="text-secondary hover:text-on-background transition-colors cursor-pointer" href="https://www.buymeacoffee.com/meetiosdev" target="_blank" rel="noopener noreferrer" data-track="Coffee">Coffee</a>
            </div>
        </div>
    </footer>
    <script src="../assets/js/site.js" defer></script>
</body>
</html>"""

def fix_path(path):
    if not path: return ""
    if path.startswith("http"): return path
    if "assets/images/" in path:
        idx = path.find("assets/images/")
        return "../" + path[idx:]
    path = path.replace("./", "")
    path = path.replace("_local", "")
    return f"../assets/images/{path}"

projects_html = ""
app_ids = []

for i, app in enumerate(apps):
    # Sanitize inputs (OWASP A03:2021)
    name = html.escape(str(app.get("name", "")), quote=True)
    desc = html.escape(str(app.get("description", "")), quote=True).replace("\n", "<br>")
    icon = html.escape(fix_path(app.get("icon", "")), quote=True)
    
    screenshots = app.get("screenshots", [])
    screenshots_html = ""
    for s in screenshots[:4]:  
        s_src = html.escape(fix_path(s), quote=True)
        screenshots_html += f'<img src="{s_src}" class="h-80 w-auto object-cover rounded-xl shadow-md border border-outline-variant" alt="{name} Screenshot"/>\n'
    
    role = html.escape(str(app.get("my_role", "iOS Developer")), quote=True)
    url = html.escape(str(app.get("url", "#")), quote=True)
    category = html.escape(str(app.get("category", "")), quote=True)
    release = html.escape(str(app.get("release_date_human", "")), quote=True)
    version = html.escape(str(app.get("version", "1.0")), quote=True)
    
    # Strict validation for app_id (alphanumeric only)
    raw_app_id = str(app.get("app_store_id", ""))
    app_id = "".join(c for c in raw_app_id if c.isalnum())
    
    if app_id:
        app_ids.append(app_id)
    
    tags_html = ""
    if category:
        tags_html += f'<span class="px-3 py-1 bg-surface text-[10px] font-bold uppercase tracking-wider rounded-full border border-outline-variant text-secondary">{category}</span>\n'
    if release:
        tags_html += f'<span class="px-3 py-1 bg-surface text-[10px] font-bold uppercase tracking-wider rounded-full border border-outline-variant text-secondary">{release}</span>\n'
    
    # Version Tag
    if app_id:
        tags_html += f'<span id="version-{app_id}" class="px-3 py-1 bg-surface text-[10px] font-bold uppercase tracking-wider rounded-full border border-outline-variant text-secondary transition-colors duration-500">v{version}</span>\n'
        # Rating Tag
        tags_html += f'<span id="rating-{app_id}" class="px-3 py-1 bg-surface text-[10px] font-bold uppercase tracking-wider rounded-full border border-outline-variant text-secondary transition-colors duration-500">Unrated</span>\n'
    
    project_html = f"""
                <article class="bg-surface-container-low dark:bg-surface-container rounded-[32px] p-8 md:p-12 border border-outline-variant ios-shadow">
                    <div class="flex flex-col lg:flex-row gap-12">
                        <div class="flex-1">
                            <div class="flex items-center gap-6 mb-6">
                                <img src="{icon}" alt="{name} Icon" class="w-20 h-20 rounded-[22px] border border-outline-variant shadow-sm object-cover bg-surface"/>
                                <div>
                                    <h2 class="font-h1 text-h1 text-on-background m-0 leading-tight">{name}</h2>
                                    <p class="font-label-caps text-label-caps uppercase text-primary tracking-wider mt-2">{role}</p>
                                </div>
                            </div>
                            
                            <div class="flex flex-wrap gap-2 mb-8">
                                {tags_html}
                            </div>
                            
                            <p class="font-body-md text-body-md text-secondary leading-relaxed mb-8 max-w-2xl">
                                {desc}
                            </p>
                            
                            <a href="{url}" target="_blank" rel="noopener noreferrer" data-track="App Store: {name}" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
                                <span class="material-symbols-outlined text-[18px]">download</span>
                                View on App Store
                            </a>
                        </div>
                        
                        <div class="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                            <div class="flex gap-4 min-w-max">
                                {screenshots_html}
                            </div>
                        </div>
                    </div>
                </article>
"""
    projects_html += project_html

final_html = html_template.replace("{projects_html}", projects_html)
with open('projects/index.html', 'w') as f:
    f.write(final_html)

print("Regenerated projects/index.html")
