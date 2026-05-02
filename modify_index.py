import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. Insert Introduction Section after Hero Section
intro_section = """
        <!-- Introduction Section -->
        <section class="py-[80px] px-8 bg-surface dark:bg-black" id="about">
            <div class="max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                <div class="md:col-span-7">
                    <h2 class="font-h1 text-h1 text-on-background mb-6">7+ Years of Engineering Excellence</h2>
                    <p class="font-body-lg text-body-lg text-secondary mb-6 leading-relaxed">
                        I am a Senior Software Development Engineer specialized in the iOS ecosystem. My expertise lies in crafting high-performance mobile applications using <strong class="text-on-background">Swift Concurrency</strong>, <strong class="text-on-background">SwiftUI</strong>, and <strong class="text-on-background">Clean Architecture</strong> (MVVM/VIPER).
                    </p>
                    <p class="font-body-md text-body-md text-secondary leading-relaxed">
                        I have a proven track record of solving complex engineering challenges—from reducing app launch times by 30% to slashing CI/CD build times by 50%. I am passionate about system design, building modular architectures, and delivering scalable, crash-free user experiences that feel natively Apple.
                    </p>
                </div>
                <div class="md:col-span-5 grid grid-cols-2 gap-4">
                    <div class="p-6 rounded-2xl bg-surface-container-low dark:bg-surface-container border border-outline-variant text-center">
                        <span class="block text-4xl font-bold text-primary mb-2">7+</span>
                        <span class="text-xs uppercase tracking-widest font-bold text-secondary">Years Exp.</span>
                    </div>
                    <div class="p-6 rounded-2xl bg-surface-container-low dark:bg-surface-container border border-outline-variant text-center">
                        <span class="block text-4xl font-bold text-primary mb-2">20+</span>
                        <span class="text-xs uppercase tracking-widest font-bold text-secondary">Apps Shipped</span>
                    </div>
                    <div class="p-6 rounded-2xl bg-surface-container-low dark:bg-surface-container border border-outline-variant text-center">
                        <span class="block text-4xl font-bold text-primary mb-2">50%</span>
                        <span class="text-xs uppercase tracking-widest font-bold text-secondary">CI/CD Boost</span>
                    </div>
                    <div class="p-6 rounded-2xl bg-surface-container-low dark:bg-surface-container border border-outline-variant text-center">
                        <span class="block text-4xl font-bold text-primary mb-2">1M+</span>
                        <span class="text-xs uppercase tracking-widest font-bold text-secondary">Users</span>
                    </div>
                </div>
            </div>
        </section>
"""

content = content.replace('        <!-- Work Showcase (Bento-style Grid) -->', intro_section + '\n        <!-- Work Showcase (Bento-style Grid) -->')

# 2. Modify Work Showcase to only include Melpot and Franck Muller, and add "View All Projects" button
# We need to find the start of MO mobyyou and cut the rest of the grid
mo_mobyyou_start = content.find('<!-- MO - mobyyou -->')
if mo_mobyyou_start != -1:
    grid_end = content.find('</div>\n            </div>\n        </section>', mo_mobyyou_start)
    if grid_end != -1:
        # Keep everything up to mo_mobyyou_start
        content_before = content[:mo_mobyyou_start]
        # Add the View All Projects button
        button_html = """
                    <!-- View All Projects Button -->
                    <div class="md:col-span-12 mt-8 text-center">
                        <a href="./project" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
                            Explore All Projects
                            <span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                        </a>
                    </div>
"""
        content_after = content[grid_end:]
        content = content_before + button_html + content_after

# Update the header link from Home to Projects? Maybe add Projects to nav
content = content.replace(
    '<a class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" href="#work">Work</a>',
    '<a class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" href="./project">Projects</a>'
)

with open('index.html', 'w') as f:
    f.write(content)

print("index.html updated successfully.")
