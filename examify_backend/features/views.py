"""
examify_backend/features/views.py

New AI-powered views for all Examify features.
Refactored to Class-Based Views (CBV) for scalability and better structure.
"""

import json
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError

from engines.question_gen import client as groq_client, _get_model
from engines.question_gen import get_or_generate, generate_diagnostic_set
from quiz.models import Question, QuizSession, SessionAnswer

EXAM_SLUG_MAP = {
    "upsc": "UPSC_CSE",
    "jee": "JEE_Mains",
    "neet": "NEET",
    "ssc_cgl": "SSC_CGL",
    "cat": "CAT",
    "gate": "GATE",
}

def get_real_exam_key(slug):
    return EXAM_SLUG_MAP.get(slug.lower(), slug)



def ai_complete(prompt, system="You are an expert competitive exam tutor for India.", max_tokens=2000):
    """Helper to call AI and return text."""
    try:
        response = groq_client.chat.completions.create(
            model=_get_model(),
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system + "\nIMPORTANT: Provide the output in a mix of simple English and Hindi (Hinglish) to make it easy for Indian students to understand, unless specifically asked to use only English."},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI Error: {str(e)}"


# ============================================================
# SYLLABUS API
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

class SyllabusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        exam = request.GET.get("exam", "upsc").lower()
        if exam in STATIC_SYLLABUS:
            return Response(STATIC_SYLLABUS[exam])
        
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
Return ONLY JSON, no markdown. Use simple Hinglish (Hindi+English) for topic names if applicable, but keep keys in English."""
        raw = ai_complete(prompt)
        try:
            data = json.loads(raw.strip().lstrip("```json").rstrip("```"))
            return Response(data)
        except Exception:
            return Response({"raw_text": raw, "subjects": []})


# ============================================================
# NOTES GENERATION API
# ============================================================

class GenerateNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam = request.data.get("exam", "upsc")
        topic = request.data.get("topic", "")
        note_type = request.data.get("note_type", "quick")

        type_prompts = {
            "quick": f"Generate ultra-concise quick revision notes for {topic} for {exam.upper()} exam. Use bullet points, bold key terms, max 300 words. Focus on exam-important points only.",
            "detailed": f"Generate comprehensive detailed notes for {topic} for {exam.upper()} exam. Cover all important subtopics with examples. Use headings, bullet points, and highlight key terms with **bold**.",
            "mindmap": f"Generate mind map style notes for {topic} for {exam.upper()} exam. Show main topic → branches → sub-branches. Use → arrows and indentation.",
            "formula": f"Generate a formula sheet / key facts sheet for {topic} for {exam.upper()} exam. List only formulas, important dates, important figures, and shortcuts. One per line.",
            "mcq_focused": f"Generate MCQ-focused notes for {topic} for {exam.upper()} exam. Include: common tricky facts, frequently tested points, important numbers/dates, typical MCQ traps to avoid. Format as numbered list.",
        }

        prompt = type_prompts.get(note_type, type_prompts["quick"])
        content = ai_complete(prompt, system=f"You are an expert {exam.upper()} exam tutor. Generate clear, accurate notes.")
        return Response({"content": content, "topic": topic, "exam": exam, "note_type": note_type})


# ============================================================
# STUDY PLAN GENERATION
# ============================================================

class GeneratePlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam = request.data.get("exam", "upsc")
        persona = request.data.get("persona", "scholar") # scholar or dropout
        
        # Automatic exam month estimation if not provided
        current_month = "May" 
        estimated_exam_month = "June" if exam == "jee" else "October" if exam == "upsc" else "August"

        prompt = f"""Create a premium vertical 'Candy Crush' style study roadmap for a {persona} student preparing for {exam.upper()}.
Current Month: {current_month}
Target Exam Month: {estimated_exam_month}
Student Type: {persona.upper()} (Adjust intensity and tone accordingly)

Return exactly 12 nodes for a vertical progression.
Each node must have:
- id: unique string
- label: Topic name
- status: 'locked' (always for new plan)
- subject: Subject name
- type: 'video' | 'quiz' | 'revision'
- flag: 'dark' | 'gold' | 'silver' (use 'dark' for hard topics)

Return ONLY valid JSON:
{{
  "exam_target": "{exam}",
  "persona": "{persona}",
  "estimated_exam": "{estimated_exam_month}",
  "nodes": [
    {{
      "id": "node_1",
      "label": "Atomic Structure Basics",
      "subject": "Chemistry",
      "type": "video",
      "flag": "gold",
      "description": "Master the fundamentals of Bohr's model."
    }}
  ]
}}
Return ONLY JSON."""

        raw = ai_complete(prompt, max_tokens=3000)
        try:
            data = json.loads(raw.strip().lstrip("```json").rstrip("```"))
            return Response(data)
        except Exception:
            return Response({"error": "Failed to parse AI plan", "raw": raw}, status=500)



# ============================================================
# AI CHAT
# ============================================================

class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam = request.data.get("exam", "general")
        message = request.data.get("message", "")
        history = request.data.get("history", [])

        exam_systems = {
            "upsc": "You are an expert IAS mentor helping UPSC CSE aspirants. You know Indian history, polity, economy, geography, current affairs. Give precise, exam-relevant answers. Use examples. Explain in simple Hinglish (Hindi + English) so it's very easy to understand.",
            "jee": "You are a JEE Advanced expert tutor. You excel in Physics, Chemistry, Mathematics. Solve problems step by step. Show all working. Explain concepts in simple Hinglish (Hindi + English).",
            "neet": "You are a NEET UG expert. You know Biology, Physics, Chemistry for NEET. Explain concepts clearly. Give NCERT-based answers in simple Hinglish (Hindi + English).",
            "ssc_cgl": "You are an SSC CGL expert. Help with Quantitative Aptitude, English, Reasoning, and GK. Give shortcuts and tricks in simple Hinglish (Hindi + English).",
            "banking": "You are a Banking exam expert (IBPS, SBI). Help with Data Interpretation, Reasoning, English, Banking Awareness. Explain tips in simple Hinglish.",
            "general": "You are an expert competitive exam tutor for India. Help students with any exam preparation in simple Hinglish (Hindi + English).",
        }

        system = exam_systems.get(exam, exam_systems["general"])

        try:
            messages = [{"role": "system", "content": system}]
            for h in history[-10:]:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": message})

            response = groq_client.chat.completions.create(
                model=_get_model(),
                max_tokens=1500,
                messages=messages,
            )
            reply = response.choices[0].message.content
            return Response({"reply": reply})
        except Exception as e:
            return Response({"reply": f"Error: {str(e)}"}, status=500)


# ============================================================
# RANK PREDICTOR
# ============================================================

class PredictRankView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam_key = get_real_exam_key(request.data.get("exam", "upsc"))
        marks = request.data.get("marks", 0)
        percentage = request.data.get("percentage", 0)
        category = request.data.get("category", "general")
        estimated_rank = request.data.get("estimatedRank", 0)

        prompt = f"""You are a professional Indian competitive exam counselor. 
A student appeared for the {exam_key} exam.
Performance Data:
- Marks: {marks}
- Accuracy: {percentage:.1f}%
- Predicted Rank: {estimated_rank}
- Category: {category.upper()}

Provide a highly professional, human-readable report in a structured table-like wording format.
Analyze if they are a 'Scholar' or 'Borderline' or 'Needs Pivot'.
Give 3 specific actionable tips for {exam_key}.
Return ONLY JSON:
{{
  "rank": {estimated_rank},
  "verdict": "Scholar/Borderline/Needs Improvement",
  "analysis": "A detailed 2-3 sentence human-friendly wording.",
  "table_data": [
    {{"label": "Metric", "value": "Status"}},
    {{"label": "Cutoff Probability", "value": "High/Medium/Low"}},
    {{"label": "Percentile", "value": "Estimated 99.x"}}
  ],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "next_steps": "Immediate focus area"
}}
Return ONLY JSON."""


        raw = ai_complete(prompt)
        try:
            data = json.loads(raw.strip().lstrip("```json").rstrip("```"))
            return Response(data)
        except Exception:
            return Response({"rank": estimated_rank, "analysis": raw, "suggestions": []})


# ============================================================
# MOCK TEST GENERATION (Scalable Database-Backed)
# ============================================================

class GenerateMockTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam_slug = request.data.get("exam", "upsc")
        exam = get_real_exam_key(exam_slug)
        num_questions = min(int(request.data.get("num_questions", 100)), 200) 
        subject = request.data.get("subject", "mixed")


        # Get questions the user has already answered to avoid repeats
        answered_question_ids = SessionAnswer.objects.filter(
            session__user=request.user
        ).values_list("question_id", flat=True)

        questions_list = []
        
        if subject == "mixed":
            # Use diagnostic generator which spans multiple subjects
            generated_qs = generate_diagnostic_set(exam)
            # Filter out seen questions
            unseen = [q for q in generated_qs if q.id not in answered_question_ids]
            
            # If still not enough, we fallback to random or accept shortage
            questions_list = unseen[:num_questions]
            if len(questions_list) < num_questions:
                questions_list.extend([q for q in generated_qs if q not in unseen][:num_questions - len(questions_list)])
        else:
            # Query specific topic/subject, generate if short
            generated_qs = get_or_generate(
                topic="Comprehensive Mock",
                difficulty=0.5,
                exam=exam,
                subject=subject,
                min_count=num_questions,
                exclude_ids=list(answered_question_ids)
            )
            questions_list = generated_qs[:num_questions]

        if not questions_list:
            return Response({"questions": [], "error": "Could not generate questions. AI may be rate-limited."}, status=500)

        # Format for frontend
        formatted_questions = []
        for q in questions_list:
            formatted_questions.append({
                "id": str(q.id),
                "question": q.question_text,
                "options": {
                    "A": q.options[0] if len(q.options) > 0 else "",
                    "B": q.options[1] if len(q.options) > 1 else "",
                    "C": q.options[2] if len(q.options) > 2 else "",
                    "D": q.options[3] if len(q.options) > 3 else "",
                },
                "correct_option": ["A", "B", "C", "D"][q.correct_answer] if q.correct_answer < 4 else "A",
                "explanation": q.explanation,
                "topic": q.topic,
                "difficulty": "hard" if q.difficulty > 0.7 else ("medium" if q.difficulty > 0.4 else "easy")
            })

        return Response({"questions": formatted_questions})


class SubmitMockTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam = request.data.get("exam", "upsc")
        results = request.data.get("results", [])
        
        if not results:
            return Response({"error": "No results provided"}, status=400)
            
        from django.utils import timezone
        import uuid
        
        # Create a new session
        session = QuizSession.objects.create(
            user=request.user,
            session_type="Mock Test",
            exam_target=exam,
            started_at=timezone.now(),
            completed_at=timezone.now(),
            score_pct=request.data.get("percentage", 0),
            questions=[res.get("question_id") for res in results]
        )
        
        total_questions = len(results)
        correct_count = 0
        
        # Save answers
        for res in results:
            is_correct = res.get("status") == "correct"
            if is_correct:
                correct_count += 1
                
            q_id = res.get("question_id")
            
            try:
                question = Question.objects.get(id=q_id)
                SessionAnswer.objects.create(
                    session=session,
                    question=question,
                    selected_option=["A", "B", "C", "D"].index(res.get("userAns")) if res.get("userAns") in ["A", "B", "C", "D"] else -1,
                    is_correct=is_correct,
                    time_taken_seconds=res.get("time_taken", 60),
                    failure_type=res.get("failure_type", "conceptual") if not is_correct else None
                )
            except Exception:
                continue
                
        session.score_pct = (correct_count / total_questions * 100) if total_questions > 0 else 0
        session.save()
        
        return Response({"status": "success", "session_id": str(session.id)})


# ============================================================
# REVISION MATERIAL GENERATION
# ============================================================

class GenerateRevisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam = request.data.get("exam", "upsc")
        topic = request.data.get("topic", "")
        revision_type = request.data.get("revision_type", "flashcards")

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
            return Response(data)
        except Exception:
            return Response({"raw_content": raw})


# ============================================================
# DNA FULL REPORT
# ============================================================

class DNAFullReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            sessions = QuizSession.objects.filter(user=request.user, completed_at__isnull=False).order_by("-started_at")[:20]
            total_sessions = sessions.count()

            if total_sessions == 0:
                return Response(self.get_mock_dna_data())

            dna_totals = {"conceptual": 0, "silly": 0, "time": 0, "recall": 0}
            total_correct = 0
            total_questions = 0

            # For accurate DNA, we look at SessionAnswers!
            answers = SessionAnswer.objects.filter(session__in=sessions)
            total_questions = answers.count()
            total_correct = answers.filter(is_correct=True).count()
            
            for ans in answers.filter(is_correct=False):
                if ans.failure_type in dna_totals:
                    dna_totals[ans.failure_type] += 1

            total_failures = sum(dna_totals.values()) or 1
            overall_dna = {k: round((v / total_failures) * 100) for k, v in dna_totals.items()}
            accuracy = round((total_correct / total_questions * 100) if total_questions else 0)

            topic_stats = {}
            for ans in answers:
                topic = ans.question.topic
                if topic not in topic_stats:
                    topic_stats[topic] = {"total": 0, "correct": 0}
                topic_stats[topic]["total"] += 1
                if ans.is_correct:
                    topic_stats[topic]["correct"] += 1

            topic_wise = []
            for t, stats in topic_stats.items():
                topic_wise.append({
                    "topic": t,
                    "accuracy": round(stats["correct"] / stats["total"] * 100),
                    "total": stats["total"]
                })
            
            topic_wise.sort(key=lambda x: x["accuracy"], reverse=True)
            strongest_topic = topic_wise[0]["topic"] if topic_wise else "–"
            weakest_topic = topic_wise[-1]["topic"] if topic_wise else "–"

            report = {
                "total_sessions": total_sessions,
                "total_questions": total_questions,
                "accuracy": accuracy,
                "avg_score": round(total_correct / max(total_sessions, 1)),
                "overall_dna": overall_dna,
                "strongest_topic": strongest_topic,
                "weakest_topic": weakest_topic,
                "topic_wise": topic_wise,
                "simple_report": {
                    "main_issue": max(dna_totals, key=dna_totals.get) if total_failures > 0 else "N/A",
                    "actionable_tip": "Add a 10-second verification rule before submitting each answer." if dna_totals.get("silly", 0) > dna_totals.get("conceptual", 0) else "Deep dive into fundamentals of your weakest topics.",
                    "focus_topics": [t["topic"] for t in topic_wise[-3:]] if topic_wise else [],
                    "stable_topics": [t["topic"] for t in topic_wise[:2]] if topic_wise else [],
                },
                "sessions": [

                    {
                        "id": str(s.id),
                        "subject": s.session_type,
                        "exam": s.exam_target,
                        "date": s.started_at.strftime("%d %b %Y"),
                        "questions": len(s.questions) if s.questions else 0,
                        "score": round(s.score_pct) if s.score_pct else 0,
                        "dna": {"conceptual": 0, "silly": 0, "time": 0, "recall": 0},
                    }
                    for s in sessions[:10]
                ],
            }
            return Response(report)

        except Exception as e:
            return Response(self.get_mock_dna_data())

    def get_mock_dna_data(self):
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
