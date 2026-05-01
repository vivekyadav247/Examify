import os
import re

files = [
    'NotesPage.jsx', 'SyllabusPage.jsx', 'StudyPlanPage.jsx', 
    'AIChatPage.jsx', 'RankPredictorPage.jsx', 'MockTestPage.jsx', 
    'RevisionPage.jsx', 'DNAReportPage.jsx'
]
dir_path = r'c:\Users\Vivek Yadav\Desktop\projectt\examify_frontend\src\pages'

for file in files:
    path = os.path.join(dir_path, file)
    if not os.path.exists(path): 
        print(f"Skipping {file}, not found.")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Imports
    if 'useApiClient' not in content:
        content = re.sub(r'import\s+.*?from\s+[\'\"]react[\'\"];?', 
            'import React, { useState, useEffect } from \"react\";\nimport { useApiClient } from \"../lib/useApiClient\";\nimport AppShell from \"../components/AppShell\";', 
            content, count=1)
            
    # 2. API_BASE
    content = re.sub(r'const\s+API_BASE\s*=\s*[\'\"].*?[\'\"];?', '', content)
    
    # 3. Component setup
    comp_match = re.search(r'export default function (\w+)\s*\([^)]*\)\s*\{', content)
    if comp_match:
        func_start = comp_match.end()
        if 'apiFetch' not in content[func_start:func_start+100]:
            content = content[:func_start] + '\n  const { apiFetch } = useApiClient();' + content[func_start:]
            
    # 4. Fetch replacement
    content = re.sub(r'fetch\(\s*`\$\{API_BASE\}', 'apiFetch(`', content)
    
    # 5. AppShell wrapper
    if '<AppShell' not in content:
        content = re.sub(r'return\s*\(\s*<div', 'return (\n    <AppShell activePath={window.location.pathname}>\n      <div', content, count=1)
        content = re.sub(r'</div>\s*\);\s*\}\s*$', '</div>\n    </AppShell>\n  );\n}', content)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Processed {file}')
