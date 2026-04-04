import os
import shutil

# Rename src to src_ts_backup
if os.path.exists('src'):
    if os.path.exists('src_ts_backup'):
        shutil.rmtree('src_ts_backup')
    os.rename('src', 'src_ts_backup')

# Rename src_js to src
if os.path.exists('src_js'):
    os.rename('src_js', 'src')

# Walk through new src and rename files
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for JSX indicators
                if 'from "react"' in content or 'from \'react\'' in content or '</div>' in content or '/>' in content:
                     if not file.endswith('.jsx'):
                         new_path = os.path.join(root, file[:-3] + '.jsx')
                         os.rename(path, new_path)
            except Exception as e:
                print(f"Error processing {file}: {e}")

# Also rename configuration files
if os.path.exists('vite.config.ts'):
    shutil.copy('vite.config.ts', 'vite.config.js')
    # We will need to edit it to remove types, but let's just copy for now
    
if os.path.exists('tailwind.config.ts'):
     shutil.copy('tailwind.config.ts', 'tailwind.config.js')

print("Conversion script completed.")
