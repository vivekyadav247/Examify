"""
examify_backend/features/views.py

New AI-powered views for all Examify features.
Uses your existing OpenRouter setup.
"""

import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# ---- Reuse your existing AI client setup ----
# from your existing code, something like:
# from openai import OpenAI
# client = OpenAI(base_url=OPENROUTER_BASE_URL, api_key=OPENROUTER_API_KEY)
# We'll import from your existing setup:
try:
    from quiz.ai_engine import get_ai_client  # adjust to your actual import
except ImportError:
    from openai import OpenAI
    def get_ai_client():
        return OpenAI(
            base_url=os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        )

MODEL = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-3-haiku")


def ai_complete(prompt, system="You are an expert competitive exam tutor for India.", max_tokens=2000):
    """Helper to call AI and return text."""
    try:
        client = get_ai_client()
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI Error: {str(e)}"


# ============================================================
# SYLLABUS API
# GET /api/syllabus/?exam=upsc
# ============================================================

STATIC_SYLLABUS = {
    "upsc": {
        "exam_info": {"Full Name": "Civil Services Examination", "Conducting Body": "UPSC", "Mode": "Offline"},
        "subjects": [
            {
                "name": "Indian History",
                "icon": "🏰",
                "weightage": 15,
                "topics": [
                    {"name": "Ancient India", "subtopics": ["Indus Valley Civilization", "Vedic Age", "Maurya Empire", "Gupta Period"]},
                    {"name": "Medieval India", "subtopics": ["Delhi Sultanate", "Mughal Empire", "Bhakti & Sufi Movement"]},
                    {"name": "Modern India", "subtopics": ["British Expansion", "Revolt of 1857", "National Movement", "Gandhi Era"]},
                ],
            },
            {
                "name": "Indian Polity",
                "icon": "⚖️",
                "weightage": 20,
                "topics": [
                    {"name": "Constitution", "subtopics": ["Preamble", "Fundamental Rights", "DPSP", "Fundamental Duties"]},
                    {"name": "Parliament", "subtopics": ["Lok Sabha", "Rajya Sabha", "Legislative Process"]},
                    {"name": "Judiciary", "subtopics": ["Supreme Court", "High Court", "Tribunals"]},
                ],
            },
            {
                "name": "Indian Economy",
                "icon": "📈",
                "weightage": 15,
                "topics": [
                    {"name": "National Income", "subtopics": ["GDP", "GNP", "NNP", "Index Numbers"]},
                    {"name": "Banking & Finance", "subtopics": ["RBI", "Monetary Policy", "Banking Reforms"]},
                    {"name": "Agriculture", "subtopics": ["Land Reforms", "Green Revolution", "Schemes"]},
                ],
            },
            {
                "name": "Geography",
                "icon": "🌍",
                "weightage": 15,
                "topics": [
                    {"name": "Physical Geography", "subtopics": ["Geomorphology", "Climatology", "Oceanography"]},
                    {"name": "Indian Geography", "subtopics": ["Rivers", "Mountains", "Climate Zones", "Soils"]},
                ],
            },
            {
                "name": "Environment & Ecology",
                "icon": "🌿",
                "weightage": 12,
                "topics": [
                    {"name": "Ecology", "subtopics": ["Ecosystems", "Food Chains", "Biodiversity"]},
                    {"name": "Climate Change", "subtopics": ["Paris Agreement", "IPCC", "Carbon Credits"]},
                ],
            },
        ],
    },
    "jee": {
        "exam_info": {"Full Name": "Joint Entrance Examination", "Conducting Body": "NTA", "Duration": "3 Hours"},
        "subjects": [
            {
                "name": "Physics",
                "icon": "⚡",
                "weightage": 33,
                "topics": [
                    {"name": "Mechanics", "subtopics": ["Kinematics", "Newton's Laws", "Work-Energy", "Rotational Motion"]},
                    {"name": "Electromagnetism", "subtopics": ["Coulomb's Law", "Gauss Law", "Electromagnetic Induction"]},
                    {"name": "Modern Physics", "subtopics": ["Photoelectric Effect", "Nuclear Physics", "Semiconductors"]},
                ],
            },
            {
                "name": "Chemistry",
                "icon": "🧪",
                "weightage": 33,
                "topics": [
                    {"name": "Physical Chemistry", "subtopics": ["Mole Concept", "Thermodynamics", "Electrochemistry", "Kinetics"]},
                    {"name": "Organic Chemistry", "subtopics": ["Nomenclature", "Reaction Mechanisms", "Polymers", "Biomolecules"]},
                    {"name": "Inorganic Chemistry", "subtopics": ["Periodic Table", "Chemical Bonding", "Coordination Compounds"]},
                ],
            },
            {
                "name": "Mathematics",
                "icon": "📐",
                "weightage": 33,
                "topics": [
                    {"name": "Calculus", "subtopics": ["Limits", "Derivatives", "Integration", "Differential Equations"]},
                    {"name": "Algebra", "subtopics": ["Complex Numbers", "Matrices", "Permutations", "Binomial Theorem"]},
                    {"name": "Coordinate Geometry", "subtopics": ["Straight Lines", "Circles", "Parabola", "Ellipse", "Hyperbola"]},
                ],
            },
        ],
    },
    "neet": {
        "exam_info": {"Full Name": "National Eligibility cum Entrance Test", "Conducting Body": "NTA", "Questions": "180"},
        "subjects": [
            {
                "name": "Biology",
                "icon": "🦠",
                "weightage": 50,
                "topics": [
                    {"name": "Cell Biology", "subtopics": ["Cell Structure", "Cell Division", "Biomolecules"]},
                    {"name": "Genetics", "subtopics": ["Mendelian Genetics", "DNA Structure", "Genetic Engineering"]},
                    {"name": "Human Physiology", "subtopics": ["Digestion", "Respiration", "Circulation", "Nervous System"]},
                    {"name": "Plant Physiology", "subtopics": ["Photosynthesis", "Respiration", "Plant Growth"]},
                ],
            },
            {
                "name": "Physics",
                "icon": "⚡",
                "weightage": 25,
                "topics": [
                    {"name": "Mechanics", "subtopics": ["Motion", "Force", "Energy", "Waves"]},
                    {"name": "Optics", "subtopics": ["Ray Optics", "Wave Optics", "Optical Instruments"]},
                ],
            },
            {
                "name": "Chemistry",
                "icon": "🧪",
                "weightage": 25,
                "topics": [
                    {"name": "Physical Chemistry", "subtopics": ["Solutions", "Electrochemistry", "Surface Chemistry"]},
                    {"name": "Organic Chemistry", "subtopics": ["Hydrocarbons", "Haloalkanes", "Alcohols", "Biomolecules"]},
                ],
            },
        ],
    },
}


@csrf_exempt
def syllabus_view(request):
    exam = request.GET.get("exam", "upsc").lower()
    if exam in STATIC_SYLLABUS:
        return JsonResponse(STATIC_SYLLABUS[exam])
    # AI-generate for unknown exams
    prompt = f"""Generate a detailed exam syllabus for {exam} exam in India.
Return as JSON with structure:
{{
  "exam_info": {{"Full Name": "...", "Conducting Body": "...", "Duration": "..."}},
  "subjects": [
    {{
      "name": "Subject Name",
      "icon": "emoji",
      "weightage": 30,
      "topics": [
        {{"name": "Topic", "subtopics": ["sub1", "sub2"]}}
      ]
    }}
  ]
}}
Return ONLY JSON, no markdown."""
    raw = ai_complete(prompt)
    try:
        data = json.loads(raw)
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"raw_text": raw, "subjects": []})


# ============================================================
# NOTES GENERATION API
# POST /api/notes/generate/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def generate_notes(request):
    body = json.loads(request.body)
    exam = body.get("exam", "upsc")
    topic = body.get("topic", "")
    note_type = body.get("note_type", "quick")

    type_prompts = {
        "quick": f"Generate ultra-concise quick revision notes for {topic} for {exam.upper()} exam. Use bullet points, bold key terms, max 300 words. Focus on exam-important points only.",
        "detailed": f"Generate comprehensive detailed notes for {topic} for {exam.upper()} exam. Cover all important subtopics with examples. Use headings, bullet points, and highlight key terms with **bold**.",
        "mindmap": f"Generate mind map style notes for {topic} for {exam.upper()} exam. Show main topic → branches → sub-branches. Use → arrows and indentation.",
        "formula": f"Generate a formula sheet / key facts sheet for {topic} for {exam.upper()} exam. List only formulas, important dates, important figures, and shortcuts. One per line.",
        "mcq_focused": f"Generate MCQ-focused notes for {topic} for {exam.upper()} exam. Include: common tricky facts, frequently tested points, important numbers/dates, typical MCQ traps to avoid. Format as numbered list.",
    }

    prompt = type_prompts.get(note_type, type_prompts["quick"])
    content = ai_complete(prompt, system=f"You are an expert {exam.upper()} exam tutor. Generate clear, accurate notes.")
    return JsonResponse({"content": content, "topic": topic, "exam": exam, "note_type": note_type})


# ============================================================
# STUDY PLAN GENERATION
# POST /api/plan/generate/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def generate_plan(request):
    body = json.loads(request.body)
    exam = body.get("exam", "upsc")
    exam_date = body.get("exam_date", "")
    daily_hours = body.get("daily_hours", 6)
    weak_subjects = body.get("weak_subjects", [])
    current_level = body.get("current_level", "beginner")

    prompt = f"""Create a detailed weekly study plan for a student preparing for {exam.upper()} exam.
Exam Date: {exam_date or 'Not specified'}
Daily Study Hours: {daily_hours} hours
Current Level: {current_level}
Weak Subjects (needs extra attention): {', '.join(weak_subjects) if weak_subjects else 'None specified'}

Return as JSON:
{{
  "total_weeks": 12,
  "revision_rounds": 2,
  "weeks": [
    {{
      "theme": "Foundation Phase - Week 1",
      "description": "Focus on basics and building concepts",
      "days": [
        {{
          "day": "Monday",
          "tasks": [
            {{"subject": "History", "duration": "2h", "activity": "Read Ch 1-3"}},
            {{"subject": "Polity", "duration": "1.5h", "activity": "Preamble & FR"}}
          ]
        }}
      ]
    }}
  ]
}}
Create at least 4 weeks. Return ONLY JSON."""

    raw = ai_complete(prompt, max_tokens=3000)
    try:
        data = json.loads(raw.strip().lstrip("```json").rstrip("```"))
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"raw_plan": raw, "total_weeks": "N/A", "revision_rounds": 2})


# ============================================================
# AI CHAT
# POST /api/chat/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def ai_chat(request):
    body = json.loads(request.body)
    exam = body.get("exam", "general")
    message = body.get("message", "")
    history = body.get("history", [])

    exam_systems = {
        "upsc": "You are an expert IAS mentor helping UPSC CSE aspirants. You know Indian history, polity, economy, geography, current affairs. Give precise, exam-relevant answers. Use examples. For MCQs, explain why each option is right/wrong.",
        "jee": "You are a JEE Advanced expert tutor. You excel in Physics, Chemistry, Mathematics. Solve problems step by step. Show all working. Highlight common mistakes. Give tips for JEE strategy.",
        "neet": "You are a NEET UG expert. You know Biology, Physics, Chemistry for NEET. Explain concepts clearly. Give NCERT-based answers. Point out frequently asked topics.",
        "ssc_cgl": "You are an SSC CGL expert. Help with Quantitative Aptitude, English, Reasoning, and GK. Give shortcuts and tricks. Focus on accuracy and speed.",
        "banking": "You are a Banking exam expert (IBPS, SBI). Help with Data Interpretation, Reasoning, English, Banking Awareness. Give tips for puzzles and seating arrangements.",
        "general": "You are an expert competitive exam tutor for India. Help students with any exam preparation.",
    }

    system = exam_systems.get(exam, exam_systems["general"])

    try:
        client = get_ai_client()
        messages = [{"role": "system", "content": system}]
        # Add history (last 10 messages for context)
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=1500,
            messages=messages,
        )
        reply = response.choices[0].message.content
        return JsonResponse({"reply": reply})
    except Exception as e:
        return JsonResponse({"reply": f"Error: {str(e)}"}, status=500)


# ============================================================
# RANK PREDICTOR
# POST /api/predict-rank/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def predict_rank(request):
    body = json.loads(request.body)
    exam = body.get("exam", "upsc")
    marks = body.get("marks", 0)
    percentage = body.get("percentage", 0)
    category = body.get("category", "general")
    estimated_rank = body.get("estimatedRank", 0)

    prompt = f"""A student appeared for {exam.upper()} exam.
Marks scored: {marks}
Percentage: {percentage:.1f}%
Category: {category.upper()}
Estimated rank: {estimated_rank}

Provide:
1. Detailed analysis of their performance
2. Specific advice to improve rank
3. Whether they are likely to make cutoff
4. 3-4 specific action items

Return as JSON:
{{
  "rank": {estimated_rank},
  "analysis": "2-3 sentence analysis",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "Pass/Borderline/Fail",
  "next_steps": "What to do now"
}}
Return ONLY JSON."""

    raw = ai_complete(prompt)
    try:
        data = json.loads(raw.strip().lstrip("```json").rstrip("```"))
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"rank": estimated_rank, "analysis": raw, "suggestions": []})


# ============================================================
# MOCK TEST GENERATION
# POST /api/mock-test/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def generate_mock_test(request):
    body = json.loads(request.body)
    exam = body.get("exam", "upsc")
    num_questions = min(int(body.get("num_questions", 25)), 50)
    subject = body.get("subject", "mixed")

    prompt = f"""Generate {num_questions} MCQ questions for {exam.upper()} exam.
Mix topics from the standard syllabus. Make them exam-level difficulty.

Return as JSON:
{{
  "questions": [
    {{
      "question": "Question text here",
      "options": {{"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}},
      "correct_option": "A",
      "explanation": "Brief explanation of why A is correct",
      "topic": "Topic name",
      "difficulty": "easy/medium/hard"
    }}
  ]
}}
Generate exactly {num_questions} questions. Return ONLY JSON."""

    raw = ai_complete(prompt, max_tokens=4000)
    try:
        clean = raw.strip().lstrip("```json").rstrip("```").strip()
        data = json.loads(clean)
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"questions": [], "error": "Failed to parse questions", "raw": raw[:500]}, status=500)


# ============================================================
# REVISION MATERIAL GENERATION
# POST /api/revision/generate/
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def generate_revision(request):
    body = json.loads(request.body)
    exam = body.get("exam", "upsc")
    topic = body.get("topic", "")
    revision_type = body.get("revision_type", "flashcards")

    prompts = {
        "flashcards": f"""Generate 12 flashcards for {topic} for {exam.upper()} exam.
Return JSON: {{"flashcards": [{{"question": "...", "answer": "..."}}]}}""",

        "one_liners": f"""Generate 20 important one-liner facts for {topic} for {exam.upper()} exam.
Return JSON: {{"items": ["fact1", "fact2", ...]}}""",

        "mnemonics": f"""Generate 6 mnemonics to remember important lists/facts for {topic} for {exam.upper()} exam.
Return JSON: {{"mnemonics": [{{"topic": "what to remember", "mnemonic": "MNEMONIC", "explanation": "what each letter means"}}]}}""",

        "previous_year": f"""List important previous year question patterns and frequently asked topics for {topic} in {exam.upper()} exam.
Return JSON: {{"patterns": [{{"year_range": "2018-2023", "pattern": "...", "example": "..."}}], "hot_topics": ["topic1", "topic2"]}}""",

        "comparison_tables": f"""Create comparison tables for {topic} for {exam.upper()} exam.
Return JSON: {{"tables": [{{"title": "...", "headers": ["Col1","Col2"], "rows": [["A","B"]]}}]}}""",

        "timeline": f"""Create a chronological timeline for {topic} for {exam.upper()} exam.
Return JSON: {{"timeline": [{{"year": "1857", "event": "...", "significance": "..."}}]}}""",
    }

    prompt = prompts.get(revision_type, prompts["flashcards"])
    raw = ai_complete(prompt + "\nReturn ONLY JSON, no markdown backticks.")
    try:
        clean = raw.strip().lstrip("```json").rstrip("```").strip()
        data = json.loads(clean)
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"raw_content": raw})


# ============================================================
# DNA FULL REPORT
# GET /api/analytics/dna-full/
# ============================================================

def dna_full_report(request):
    """
    Aggregates quiz session data and returns full DNA report.
    This uses your existing quiz session models.
    """
    try:
        # Try to get real data from your existing models
        from quiz.models import QuizSession, Answer  # adjust to your model paths

        sessions = QuizSession.objects.filter(completed=True).order_by("-created_at")[:20]
        total_sessions = sessions.count()

        if total_sessions == 0:
            return JsonResponse(get_mock_dna_data())

        # Aggregate DNA across sessions
        dna_totals = {"conceptual": 0, "silly": 0, "time": 0, "recall": 0}
        total_correct = 0
        total_questions = 0
        topic_data = {}

        for session in sessions:
            if hasattr(session, 'dna_analysis') and session.dna_analysis:
                for key in dna_totals:
                    dna_totals[key] += session.dna_analysis.get(key, 0)
            total_correct += getattr(session, 'correct_count', 0)
            total_questions += getattr(session, 'total_questions', 0)

        # Normalize DNA percentages
        total_dna = sum(dna_totals.values()) or 1
        overall_dna = {k: round((v / total_dna) * 100) for k, v in dna_totals.items()}

        accuracy = round((total_correct / total_questions * 100) if total_questions else 0)

        report = {
            "total_sessions": total_sessions,
            "total_questions": total_questions,
            "accuracy": accuracy,
            "avg_score": round(total_correct / total_sessions) if total_sessions else 0,
            "overall_dna": overall_dna,
            "sessions": [
                {
                    "id": str(s.id),
                    "subject": getattr(s, 'subject', 'Mixed'),
                    "exam": getattr(s, 'exam_type', 'General'),
                    "date": s.created_at.strftime("%d %b %Y") if hasattr(s, 'created_at') else "N/A",
                    "questions": getattr(s, 'total_questions', 0),
                    "score": round((getattr(s, 'correct_count', 0) / max(getattr(s, 'total_questions', 1), 1)) * 100),
                    "dna": getattr(s, 'dna_analysis', {}),
                }
                for s in sessions[:10]
            ],
        }
        return JsonResponse(report)

    except Exception:
        # Return mock data if models aren't available yet
        return JsonResponse(get_mock_dna_data())


def get_mock_dna_data():
    """Returns sample data when no sessions exist."""
    return {
        "total_sessions": 0,
        "total_questions": 0,
        "accuracy": 0,
        "avg_score": 0,
        "overall_dna": {"conceptual": 35, "silly": 25, "time": 20, "recall": 20},
        "topic_wise": [],
        "sessions": [],
        "recommendations": [
            "Complete at least 5 quiz sessions to see your personalized DNA analysis.",
            "Focus on weak subjects first before attempting mock tests.",
            "Review your incorrect answers immediately after each quiz.",
        ],
    }
