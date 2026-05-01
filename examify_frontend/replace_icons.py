import os
import re

files_to_fix = [
    "SyllabusPage.jsx",
    "NotesPage.jsx",
    "StudyPlanPage.jsx",
    "MockTestPage.jsx",
    "AIChatPage.jsx",
    "RevisionPage.jsx",
    "DNAReportPage.jsx",
]

for file in files_to_fix:
    path = os.path.join(os.getcwd(), "src", "pages", file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    lucide_icons = set()
    
    # Simple replacements
    if file == "SyllabusPage.jsx":
        content = content.replace('"🏛️"', '<Landmark size={24} />')
        content = content.replace('"⚙️"', '<Settings size={24} />')
        content = content.replace('"🏥"', '<Cross size={24} />') # Plus or Cross
        content = content.replace('"📋"', '<ClipboardList size={24} />')
        content = content.replace('"📊"', '<BarChart2 size={24} />')
        content = content.replace('"🔬"', '<Microscope size={24} />')
        content = content.replace('"🏦"', '<Landmark size={24} />')
        content = content.replace('"⭐"', '<Star size={24} />')
        content = content.replace('"⚖️"', '<Scale size={24} />')
        content = content.replace('"🚂"', '<Train size={24} />')
        content = content.replace('"🎓"', '<GraduationCap size={24} />')
        content = content.replace('"📚"', '<BookOpen size={24} />')
        content = content.replace('<span className="text-4xl">📚</span>', '<BookOpen className="text-[var(--accent)]" size={32} />')
        content = content.replace('<div className="text-5xl mb-3">📋</div>', '<ClipboardList className="mx-auto mb-3 text-[var(--text-muted)]" size={48} />')
        content = content.replace('icon: "📖"', 'icon: <BookOpen size={20} />')
        content = content.replace('subject.icon || "📖"', 'subject.icon || <BookOpen size={20} />')
        lucide_icons.update(["Landmark", "Settings", "Cross", "ClipboardList", "BarChart2", "Microscope", "Star", "Scale", "Train", "GraduationCap", "BookOpen"])

    if file == "NotesPage.jsx":
        content = content.replace('icon: "⚡"', 'icon: <Zap size={20} />')
        content = content.replace('icon: "📖"', 'icon: <BookOpen size={20} />')
        content = content.replace('icon: "🧠"', 'icon: <Brain size={20} />')
        content = content.replace('icon: "🔢"', 'icon: <Hash size={20} />')
        content = content.replace('icon: "🎯"', 'icon: <Target size={20} />')
        content = content.replace('<span className="text-4xl">📝</span>', '<FileText className="text-[var(--accent)]" size={32} />')
        content = content.replace('<span>{nt.icon}</span>', '<span className="flex items-center justify-center">{nt.icon}</span>')
        lucide_icons.update(["Zap", "BookOpen", "Brain", "Hash", "Target", "FileText"])

    if file == "StudyPlanPage.jsx":
        content = content.replace('<span className="text-4xl">🗓️</span>', '<Calendar className="text-[var(--accent)]" size={32} />')
        content = content.replace('"🤖 Creating your plan..."', '<span>Creating your plan...</span>')
        content = content.replace('"🗓️ Generate My Study Plan"', '<span>Generate My Study Plan</span>')
        content = content.replace('icon: "📅"', 'icon: <Calendar size={24} />')
        content = content.replace('icon: "⏰"', 'icon: <Clock size={24} />')
        content = content.replace('icon: "📚"', 'icon: <BookOpen size={24} />')
        content = content.replace('icon: "🔄"', 'icon: <RefreshCw size={24} />')
        content = content.replace('? "⚠️ " : ""', '? "!" : ""')
        lucide_icons.update(["Calendar", "Clock", "BookOpen", "RefreshCw"])

    if file == "MockTestPage.jsx":
        content = content.replace('<span className="text-5xl">📋</span>', '<ClipboardList className="mx-auto text-[var(--accent)] mb-4" size={48} />')
        content = content.replace('"⏳ Generating Test..."', '<span>Generating Test...</span>')
        content = content.replace('"🚀 Start Test"', '<span>Start Test</span>')
        content = content.replace('⏱ ', '')
        content = content.replace('🚩 ', '')
        content = content.replace('✓ ', '')
        content = content.replace('✗ ', '')
        content = content.replace('— ', '')
        content = content.replace('📊 ', '')
        content = content.replace('🔄 New Test', 'New Test')
        lucide_icons.update(["ClipboardList"])

    if file == "AIChatPage.jsx":
        content = content.replace('"🏛️"', '<Landmark size={24} />')
        content = content.replace('"⚙️"', '<Settings size={24} />')
        content = content.replace('"🏥"', '<Cross size={24} />')
        content = content.replace('"📋"', '<ClipboardList size={24} />')
        content = content.replace('"🏦"', '<Landmark size={24} />')
        content = content.replace('"🤖"', '<Bot size={24} />')
        content = content.replace('"⚠️ Connection error. Check if backend is running."', '"Connection error. Check if backend is running."')
        content = content.replace('<span className="text-3xl">{persona.icon}</span>', '<span className="flex items-center justify-center p-2 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">{persona.icon}</span>')
        content = content.replace('<span className="text-6xl">{persona.icon}</span>', '<span className="flex items-center justify-center mx-auto w-20 h-20 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] text-[var(--accent)]">{persona.icon}</span>')
        lucide_icons.update(["Landmark", "Settings", "Cross", "ClipboardList", "Bot"])

    if file == "RevisionPage.jsx":
        content = content.replace('icon: "🃏"', 'icon: <CreditCard size={20} />')
        content = content.replace('icon: "🧠"', 'icon: <Brain size={20} />')
        content = content.replace('icon: "📅"', 'icon: <Calendar size={20} />')
        content = content.replace('icon: "⚡"', 'icon: <Zap size={20} />')
        content = content.replace('icon: "📊"', 'icon: <BarChart2 size={20} />')
        content = content.replace('icon: "📈"', 'icon: <TrendingUp size={20} />')
        content = content.replace('<span className="text-4xl">🔄</span>', '<RefreshCw className="text-[var(--accent)]" size={32} />')
        content = content.replace('"⏳ Generating..."', '"Generating..."')
        content = content.replace('"✨ Generate"', '"Generate"')
        content = content.replace('<span className="text-5xl">🔄</span>', '<RefreshCw className="mx-auto text-[var(--text-muted)] mb-4" size={48} />')
        lucide_icons.update(["CreditCard", "Brain", "Calendar", "Zap", "BarChart2", "TrendingUp", "RefreshCw"])

    if file == "DNAReportPage.jsx":
        content = content.replace('icon: "🧩"', 'icon: <Puzzle size={24} />')
        content = content.replace('icon: "🤦"', 'icon: <Frown size={24} />')
        content = content.replace('icon: "⏱️"', 'icon: <Clock size={24} />')
        content = content.replace('icon: "🧠"', 'icon: <Brain size={24} />')
        content = content.replace('icon: "❓"', 'icon: <HelpCircle size={24} />')
        content = content.replace('<span className="text-4xl">🧬</span>', '<Dna className="text-[var(--accent)]" size={32} />')
        content = content.replace('icon: "📅"', 'icon: <Calendar size={16} />')
        content = content.replace('icon: "✏️"', 'icon: <Edit2 size={16} />')
        content = content.replace('icon: "🎯"', 'icon: <Target size={16} />')
        content = content.replace('icon: "📊"', 'icon: <BarChart2 size={16} />')
        content = content.replace('icon: "💪"', 'icon: <Activity size={16} />')
        content = content.replace('icon: "⚠️"', 'icon: <AlertTriangle size={16} />')
        content = content.replace('<span className="text-xl">🤖</span>', '<Bot size={24} className="text-indigo-400" />')
        content = content.replace('<span className="text-2xl">{meta.icon}</span>', '<span className="flex items-center justify-center p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]" style={{color: meta.color}}>{meta.icon}</span>')
        lucide_icons.update(["Puzzle", "Frown", "Clock", "Brain", "HelpCircle", "Dna", "Calendar", "Edit2", "Target", "BarChart2", "Activity", "AlertTriangle", "Bot"])

    if lucide_icons:
        imports = f'import {{ {", ".join(list(lucide_icons))} }} from "lucide-react";\n'
        content = re.sub(r'import React.*?;\n', lambda m: m.group(0) + imports, content, count=1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Icons replaced successfully!")
