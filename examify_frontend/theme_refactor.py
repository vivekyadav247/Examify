import os
import re

files = [
    'NotesPage.jsx', 'SyllabusPage.jsx', 'StudyPlanPage.jsx', 
    'AIChatPage.jsx', 'RankPredictorPage.jsx', 'MockTestPage.jsx', 
    'RevisionPage.jsx'
]
dir_path = r'c:\Users\Vivek Yadav\Desktop\projectt\examify_frontend\src\pages'

for file in files:
    path = os.path.join(dir_path, file)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple tailwind class replacements
    replacements = [
        (r'bg-gray-950', r'bg-[var(--bg)]'),
        (r'bg-gray-900', r'bg-[var(--surface)]'),
        (r'bg-gray-800', r'bg-[var(--surface-2)]'),
        (r'border-gray-700', r'border-[var(--border)]'),
        (r'border-gray-800', r'border-[var(--border)]'),
        (r'text-gray-400', r'text-[var(--text-muted)]'),
        (r'text-gray-500', r'text-[var(--text-muted)]'),
        (r'text-white', r'text-[var(--text)]'),
        (r'bg-indigo-600', r'bg-[var(--accent)] text-[var(--bg)]'),
        (r'bg-indigo-500', r'bg-[var(--accent-2)] text-[var(--bg)]'),
        (r'text-indigo-400', r'text-[var(--accent)]'),
        (r'border-indigo-500', r'border-[var(--accent)]'),
    ]
    
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Themed {file}')
