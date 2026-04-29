"""
EXAMIFY 2.0 — Backend validation script
Run with: .venv\Scripts\python.exe validate.py
"""
import os, sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django
django.setup()

print("\n======= EXAMIFY 2.0 Backend Validation =======\n")
errors = []

# 1. Check all URL patterns
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    all_urls = []
    def collect_urls(patterns, prefix=""):
        for p in patterns:
            full = prefix + str(p.pattern)
            all_urls.append(full)
            if hasattr(p, 'url_patterns'):
                collect_urls(p.url_patterns, full)
    collect_urls(resolver.url_patterns)
    
    required_urls = [
        "api/quiz/start/",
        "api/quiz/start/content/",
        "api/quiz/answer/",
        "api/quiz/history/",
        "api/users/me/",
        "api/analytics/dashboard/",
        "api/analytics/topic-graph/",
        "api/content/upload/",
        "api/plans/activate/",
        "api/admin/users/",
        "api/admin/users/update/",
    ]
    print("[URLs] Checking required endpoints:")
    for u in required_urls:
        found = any(u in x for x in all_urls)
        status = "[OK]" if found else "[FAIL]"
        print(f"  {status}  {u}")
        if not found:
            errors.append(f"Missing URL: {u}")
except Exception as e:
    errors.append(f"URL check failed: {e}")

# 2. Check models
try:
    from users.models import ExamifyUser
    count = ExamifyUser.objects.count()
    print(f"\n[Models] ExamifyUser: {count} rows")
    
    # Check default credits
    assert ExamifyUser._meta.get_field("credits_remaining").default == 30, "credits_remaining default != 30"
    print("  [OK] Default credits = 30")
    
    # Check last_active field
    ExamifyUser._meta.get_field("last_active")
    print("  [OK] last_active field exists")
    
    from quiz.models import QuizSession
    choices = dict(QuizSession.SESSION_TYPE_CHOICES)
    assert "content_quiz" in choices, "content_quiz missing from SESSION_TYPE_CHOICES"
    print("  [OK] content_quiz session type registered")
    
    from quiz.models import Question
    q_count = Question.objects.count()
    print(f"  [OK] Questions in DB: {q_count}")
except Exception as e:
    errors.append(f"Model check failed: {e}")

# 3. Check NEET subjects
try:
    from engines.topic_graph import EXAM_SUBJECTS
    neet = EXAM_SUBJECTS.get("NEET", {})
    expected = {"Physics", "Chemistry", "Botany", "Zoology"}
    actual = set(neet.keys())
    missing = expected - actual
    extra = actual - expected
    if missing:
        errors.append(f"NEET missing subjects: {missing}")
        print(f"\n[Topic Graph] NEET [FAIL] Missing: {missing}")
    else:
        print(f"\n[Topic Graph] NEET [OK] 4 subjects: {sorted(actual)}")
    
    total_topics = sum(len(v) for v in neet.values())
    print(f"  Total NEET topics: {total_topics}")
except Exception as e:
    errors.append(f"Topic graph check failed: {e}")

# 4. Check credit engine
try:
    from plans.credit_engine import FREE_PLAN, PLAN_DAILY_LIMITS, QUIZ_CREDIT_COST
    assert FREE_PLAN["credits"] == 30, f"free credits={FREE_PLAN['credits']} expected 30"
    assert PLAN_DAILY_LIMITS["premium"] == 6, f"premium limit={PLAN_DAILY_LIMITS['premium']} expected 6"
    print(f"\n[Credits] [OK] Free=30, Pro={PLAN_DAILY_LIMITS['pro']}/day, Premium={PLAN_DAILY_LIMITS['premium']}/day")
    print(f"  Quiz cost: {QUIZ_CREDIT_COST} credits")
except Exception as e:
    errors.append(f"Credit engine check failed: {e}")

# 5. Check AI connectivity
try:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if api_key and api_key.startswith("sk-or-"):
        print(f"\n[AI] [OK] OpenRouter key present: {api_key[:20]}...")
    else:
        print(f"\n[AI] [WARN] OpenRouter key missing or invalid")
        errors.append("OpenRouter API key not set properly")
except Exception as e:
    errors.append(f"AI check failed: {e}")

# 6. Check admin views
try:
    from users.admin_views import AdminUserListView, AdminUpdateUserView
    print("\n[Admin] [OK] Admin views imported OK")
except Exception as e:
    errors.append(f"Admin views import failed: {e}")

# 7. Check question uniqueness logic
try:
    from engines.question_gen import generate_question_batch
    print("[Question Gen] [OK] generate_question_batch importable")
except Exception as e:
    errors.append(f"Question gen import failed: {e}")

# Summary
print("\n" + "="*48)
if errors:
    print(f"[FAIL] {len(errors)} issue(s) found:")
    for e in errors:
        print(f"   • {e}")
    sys.exit(1)
else:
    print("[OK] All checks passed! Backend is ready.")
    print("\nTo start the backend:  .venv\\Scripts\\python.exe manage.py runserver 8000")
    print("To start the frontend: cd examify_frontend && npm run dev")
