import re

# 1. Update tailwind.config.js to use CSS variables for key colors
config_path = "assets/js/tailwind.config.js"
with open(config_path, "r") as f:
    config_content = f.read()

# Replace hardcoded hex with var()
color_replacements = {
    "on-background": "var(--on-background)",
    "surface-container-highest": "var(--surface-container-highest)",
    "surface-container-high": "var(--surface-container-high)",
    "outline-variant": "var(--outline-variant)",
    "surface-container": "var(--surface-container)",
    "background": "var(--background)",
    "primary": "var(--primary)",
    "on-primary": "var(--on-primary)",
    "secondary": "var(--secondary)",
    "surface": "var(--surface)",
    "outline": "var(--outline)",
    "surface-container-low": "var(--surface-container-low)"
}

for color, var_name in color_replacements.items():
    config_content = re.sub(rf'"{color}":\s*"#[a-fA-F0-9]+"', f'"{color}": "{var_name}"', config_content)

with open(config_path, "w") as f:
    f.write(config_content)


# 2. Update styles.css with the CSS variables
css_path = "assets/css/styles.css"
with open(css_path, "r") as f:
    css_content = f.read()

css_vars = """
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --on-background: #1b1b1b;
    --surface-container-highest: #e2e2e2;
    --surface-container-high: #e8e8e8;
    --outline-variant: #cfc4c5;
    --surface-container: #eeeeee;
    --background: #f9f9f9;
    --primary: #000000;
    --on-primary: #ffffff;
    --secondary: #5d5e63;
    --surface: #ffffff;
    --outline: #7e7576;
    --surface-container-low: #f3f3f3;
  }

  .dark {
    --on-background: #f5f5f7;
    --surface-container-highest: #3a3a3c;
    --surface-container-high: #2c2c2e;
    --outline-variant: #38383a;
    --surface-container: #1c1c1e;
    --background: #000000;
    --primary: #ffffff;
    --on-primary: #000000;
    --secondary: #86868b;
    --surface: #000000;
    --outline: #555555;
    --surface-container-low: #1c1c1e;
  }
}
"""

with open(css_path, "w") as f:
    f.write(css_vars + "\n" + css_content)


# 3. Update index.html to use the script and replace raw Tailwind classes with theme classes
html_path = "index.html"
with open(html_path, "r") as f:
    html_content = f.read()

# Add ID to button
html_content = html_content.replace(
    '<button class="active:scale-95 transition-transform duration-200 cursor-pointer" aria-label="Toggle Dark Mode">',
    '<button id="theme-toggle" class="active:scale-95 transition-transform duration-200 cursor-pointer" aria-label="Toggle Dark Mode">'
)
html_content = html_content.replace(
    '<span class="material-symbols-outlined text-slate-900" data-icon="dark_mode">dark_mode</span>',
    '<span id="theme-toggle-icon" class="material-symbols-outlined text-on-background" data-icon="dark_mode">dark_mode</span>'
)

# Replace hardcoded colors with theme variables so dark mode automatically applies
html_content = html_content.replace('bg-white/70', 'bg-background/80')
html_content = html_content.replace('text-slate-900', 'text-on-background')
html_content = html_content.replace('text-slate-500', 'text-secondary')
html_content = html_content.replace('bg-white', 'bg-surface')
html_content = html_content.replace('bg-black', 'bg-primary')
html_content = html_content.replace('border-slate-200', 'border-outline-variant')
html_content = html_content.replace('border-slate-100', 'border-outline-variant')
html_content = html_content.replace('bg-slate-50', 'bg-surface-container')
html_content = html_content.replace('text-slate-400', 'text-secondary')

# Add dark mode toggle script at the end of body
script = """
    <script>
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleIcon = document.getElementById('theme-toggle-icon');

        // Check local storage or system preference on load
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            themeToggleIcon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleIcon.textContent = 'dark_mode';
        }

        themeToggleBtn.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                themeToggleIcon.textContent = 'light_mode';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggleIcon.textContent = 'dark_mode';
            }
        });
    </script>
</body>
"""
html_content = html_content.replace('</body>', script)

# Add <html class="dark" ...> handler correctly if user had light hardcoded
html_content = html_content.replace('<html class="light"', '<html')

# Add background to body so it changes when dark mode is toggled
html_content = html_content.replace('<body class="', '<body class="bg-background text-on-background transition-colors duration-300 ')

with open(html_path, "w") as f:
    f.write(html_content)

print("Dark mode implemented!")
