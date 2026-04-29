"""Full end-to-end quiz test — simulates what happens when user clicks Start Quiz."""
import os, sys, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

import time, json
from django.utils import timezone
from rest_framework.test import APIClient
from users.models import ExamifyUser
from quiz.models import Question, QuizSession

# Find the CUET user
user = ExamifyUser.objects.filter(exam_target="CUET").first()
if not user:
    print("ERROR: No CUET user found!")
    sys.exit(1)

# Reset credits and delete today's sessions to bypass daily limit
user.credits_remaining = 500
user.plan = "pro"
user.save(update_fields=["credits_remaining", "plan"])

today = timezone.localdate()
deleted_sessions = QuizSession.objects.filter(user=user, started_at__date=today).delete()
print(f"Deleted {deleted_sessions[0]} today's sessions to reset daily limit.")

print(f"User: {user.full_name} ({user.email}), exam={user.exam_target}, credits={user.credits_remaining}")

# Delete all existing CUET questions to force fresh generation
deleted, _ = Question.objects.filter(exam_target="CUET").delete()
print(f"Cleaned up {deleted} old CUET questions.\n")

# Simulate the API call
client = APIClient()
client.force_authenticate(user=user)

print("--- Calling /api/quiz/start/ (will trigger live AI generation of 5 questions) ---")
start = time.time()
response = client.get("/api/quiz/start/")
duration = time.time() - start

print(f"Status: {response.status_code} (took {duration:.1f}s)")

if response.status_code == 200:
    data = response.data
    print(f"Session ID: {data.get('session_id')}")
    print(f"Total questions (shown to user): {data.get('total_questions')}")
    questions = data.get("questions", [])
    print(f"Questions in first batch: {len(questions)}")
    for i, q in enumerate(questions):
        print(f"  Q{i+1}: [{q.get('topic')}] {str(q.get('question_text', ''))[:80]}")
    
    # Now test the next-batch endpoint
    session_id = data.get("session_id")
    if session_id:
        print(f"\n--- Calling next-batch ---")
        start2 = time.time()
        r2 = client.get(f"/api/quiz/session/{session_id}/next-batch/")
        duration2 = time.time() - start2
        print(f"Status: {r2.status_code} (took {duration2:.1f}s)")
        if r2.status_code == 200:
            batch2 = r2.data.get("questions", [])
            print(f"Questions in second batch: {len(batch2)}")
            for i, q in enumerate(batch2):
                print(f"  Q{i+1}: [{q.get('topic')}] {str(q.get('question_text', ''))[:80]}")
        else:
            print(f"Error: {r2.data}")
    
    print("\nSUCCESS! Quiz generation works end-to-end.")
else:
    print(f"Error: {json.dumps(response.data, indent=2)}")
