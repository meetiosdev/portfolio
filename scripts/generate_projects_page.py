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
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://itunes.apple.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://googletagmanager.com; frame-src 'self'">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-LXSRQY10PK"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-LXSRQY10PK');

      function trackClick(name) {
        if (typeof gtag === 'function') {
          gtag('event', 'click', {
            event_category: 'portfolio',
            event_label: name
          });
        }
      }
    </script>
    
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    
    <script src="../assets/js/tailwind.config.js"></script>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body class="bg-background text-on-background transition-colors duration-300 font-body-md text-body-md selection:bg-primary selection:text-on-primary">

    <header>
        <nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-20">
            <div class="max-w-[1140px] mx-auto px-8 flex items-center justify-between h-full font-['Inter'] antialiased tracking-tight text-sm font-medium">
                <a href="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="../assets/images/profile.jpeg" alt="Swarajmeet" class="w-8 h-8 rounded-full object-cover border border-outline-variant">
                    <span class="text-xl font-bold tracking-tighter text-on-background">Swarajmeet</span>
                </a>
                <div class="hidden md:flex items-center space-x-8">
                    <a class="text-secondary hover:text-on-background transition-colors" href="/">Home</a>
                    <a class="text-on-background border-b-2 border-on-background pb-1" href="/projects/">Projects</a>
                    <a class="text-secondary hover:text-on-background transition-colors" href="/#experience">Experience</a>
                    <a class="text-secondary hover:text-on-background transition-colors" href="/#contact">Contact</a>
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
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="/">Home</a>
                <a class="text-on-background font-medium" href="/projects/">Projects</a>
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="/#experience">Experience</a>
                <a class="text-secondary hover:text-on-background transition-colors font-medium" href="/#contact">Contact</a>
            </div>
        </nav>
    </header>

    <main class="pt-[140px] pb-[120px] px-8">
        <div class="max-w-[1140px] mx-auto">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-4">
                <h1 class="font-display text-display text-on-background m-0">Detailed Case Studies</h1>
                
                <!-- Live Sync Badge -->
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mt-4 md:mt-0">
                    <span class="relative flex h-2.5 w-2.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span class="text-xs font-bold text-green-600 dark:text-green-400 tracking-wider uppercase">Live synced with App Store</span>
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

    <script>
        // Mobile Menu Logic
        const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuTrigger && mobileMenu) {
            mobileMenuTrigger.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                mobileMenu.classList.toggle('flex');
                mobileMenuTrigger.textContent = mobileMenu.classList.contains('flex') ? 'close' : 'menu';
            });
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                    mobileMenuTrigger.textContent = 'menu';
                });
            });
        }

        // Dark Mode Logic
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleIcon = document.getElementById('theme-toggle-icon');

        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            themeToggleIcon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleIcon.textContent = 'dark_mode';
        }

        themeToggleBtn.addEventListener('click', function() {
            themeToggleIcon.style.transform = 'rotate(90deg) scale(0.5)';
            themeToggleIcon.style.opacity = '0';
            
            setTimeout(() => {
                document.documentElement.classList.toggle('dark');
                if (document.documentElement.classList.contains('dark')) {
                    localStorage.setItem('theme', 'dark');
                    themeToggleIcon.textContent = 'light_mode';
                } else {
                    localStorage.setItem('theme', 'light');
                    themeToggleIcon.textContent = 'dark_mode';
                }
                
                themeToggleIcon.style.transform = 'rotate(-90deg) scale(0.5)';
                void themeToggleIcon.offsetWidth; // Force reflow
                
                themeToggleIcon.style.transform = 'rotate(0deg) scale(1)';
                themeToggleIcon.style.opacity = '1';
            }, 150);
        });

        // App Store Live Sync Logic
        window.updateAppInfo = function(data) {
            if (data && data.results && data.results.length > 0) {
                const app = data.results[0];
                const appId = app.trackId;
                
                // Update Version
                const versionEl = document.getElementById('version-' + appId);
                if (versionEl) {
                    versionEl.textContent = 'v' + app.version;
                    versionEl.classList.add('bg-green-500/10', 'text-green-600', 'dark:text-green-400', 'border-green-500/20');
                    versionEl.classList.remove('text-secondary', 'border-outline-variant');
                }
                
                // Update Rating
                const ratingEl = document.getElementById('rating-' + appId);
                if (ratingEl && app.averageUserRating) {
                    ratingEl.textContent = '★ ' + parseFloat(app.averageUserRating).toFixed(1) + ' (' + app.userRatingCount + ')';
                    ratingEl.classList.add('bg-yellow-500/10', 'text-yellow-600', 'dark:text-yellow-400', 'border-yellow-500/20');
                    ratingEl.classList.remove('text-secondary', 'border-outline-variant');
                }
            }
        };

        const appIds = {app_ids_json};
        
        appIds.forEach(id => {
            if (!id) return;
            const script = document.createElement('script');
            script.src = `https://itunes.apple.com/lookup?id=${id}&callback=updateAppInfo`;
            document.body.appendChild(script);
        });
    </script>
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
                            
                            <a href="{url}" target="_blank" rel="noopener noreferrer" onclick="trackClick('App Store: {name}')" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
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
final_html = final_html.replace("{app_ids_json}", json.dumps(app_ids))

with open('projects/index.html', 'w') as f:
    f.write(final_html)

print("Regenerated projects/index.html with LIVE Sync!")
