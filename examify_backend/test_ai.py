"""Quick test script for AI question generation."""
import os, sys, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from engines.question_gen import _call_openrouter, _get_model, _build_generation_prompt, _extract_json_array

prompt = _build_generation_prompt(
    topic="Electrostatics",
    difficulty=0.5,
    exam="CUET",
    subject="Physics",
    context_text=None,
    count=5,
    topic_desc=None,
)
print("Calling OpenRouter for 5 CUET Physics questions...")
try:
    raw = _call_openrouter(prompt, _get_model(), max_tokens=4000, temperature=0.6)
    print(f"RAW RESPONSE length: {len(raw)} chars")
    print(raw[:300])
    print("...")
    data = _extract_json_array(raw)
    print(f"\nParsed {len(data)} questions successfully!")
    for i, q in enumerate(data):
        print(f"  Q{i+1}: {q.get('question', '')[:80]}")
except Exception as e:
    print(f"ERROR: {e}")
