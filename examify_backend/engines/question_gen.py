import json
import logging
import os
import re
import time

import httpx
import openai

from engines.topic_graph import EXAM_SUBJECTS

DEFAULT_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "gemma2-9b-it"
EXPLANATION_MODEL = DEFAULT_MODEL
DNA_REPORT_MODEL = DEFAULT_MODEL
STUDY_PLAN_MODEL = DEFAULT_MODEL

logger = logging.getLogger(__name__)


def _env_bool(name, default=False):
    """Return a boolean from an environment variable."""
    value = os.environ.get(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on", "y"}


def _build_groq_client():
    """Build an OpenAI-compatible client pointed at Groq."""
    use_system_proxy = _env_bool("GROQ_USE_SYSTEM_PROXY", False)
    # Increased timeout to 120s to allow live generation of large batches
    http_client = httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0), trust_env=use_system_proxy)
    return openai.OpenAI(
        base_url=os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
        api_key=os.environ.get("GROQ_API_KEY"),
        http_client=http_client,
    )


client = _build_groq_client()


def _get_model():
    """Return the configured Groq model name."""
    return os.environ.get("GROQ_MODEL", DEFAULT_MODEL)


def _truncate_words(text, limit):
    """Truncate text to a maximum number of words."""
    if not text:
        return ""
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit])


def _strip_markdown_fences(text):
    """Remove markdown code fences from AI output."""
    match = re.search(r"```(?:json)?\s*(.*?)```", text, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def _extract_json_array(text):
    """Parse a JSON array from potentially messy AI output."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        cleaned = _strip_markdown_fences(text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            start = cleaned.find("[")
            end = cleaned.rfind("]")
            if start != -1 and end != -1 and end > start:
                return json.loads(cleaned[start : end + 1])
            raise


def _extract_json_object(text):
    """Parse a JSON object from potentially messy AI output."""
    try:
        value = json.loads(text)
        if isinstance(value, dict):
            return value
    except json.JSONDecodeError:
        pass

    cleaned = _strip_markdown_fences(text)
    try:
        value = json.loads(cleaned)
        if isinstance(value, dict):
            return value
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        value = json.loads(cleaned[start : end + 1])
        if isinstance(value, dict):
            return value
    raise ValueError("Could not parse JSON object")


def _is_rate_limited(exc):
    status = getattr(exc, "status_code", None)
    if status == 429:
        return True
    message = str(exc).lower()
    return "rate limit" in message or "rate_limit" in message or "429" in message


def _should_fallback(exc, model):
    if model != DEFAULT_MODEL:
        return False
    status = getattr(exc, "status_code", None)
    message = str(exc).lower()
    return status == 429 or "quota" in message


def _collect_stream(stream):
    parts = []
    for chunk in stream:
        if not getattr(chunk, "choices", None):
            continue
        delta = getattr(chunk.choices[0], "delta", None)
        text = getattr(delta, "content", None) if delta else None
        if text:
            parts.append(text)
    return "".join(parts).strip()


def _call_groq(prompt, model, max_tokens=4000, temperature=0.7, stream=False):
    """Send a prompt to Groq and return the text response."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    def _request(target_model):
        if stream:
            stream_resp = client.chat.completions.create(
                model=target_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
            )
            return _collect_stream(stream_resp)
        response = client.chat.completions.create(
            model=target_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return (response.choices[0].message.content or "").strip()

    try:
        return _request(model)
    except Exception as exc:
        if _is_rate_limited(exc):
            time.sleep(2)
            try:
                return _request(model)
            except Exception as retry_exc:
                if _should_fallback(retry_exc, model):
                    return _request(FALLBACK_MODEL)
                raise
        if _should_fallback(exc, model):
            return _request(FALLBACK_MODEL)
        raise


def _get_question_model(db):
    """Return the Question model class, supporting test injection."""
    if db is not None and hasattr(db, "Question"):
        return db.Question
    from quiz.models import Question
    return Question


def _get_topic_description(exam, subject, topic):
    """Fetch topic description from TOPIC_DESCRIPTIONS if available."""
    try:
        from engines.topic_descriptions import TOPIC_DESCRIPTIONS
        return TOPIC_DESCRIPTIONS.get(f"{exam}|{subject}|{topic}")
    except ImportError:
        return None


def _normalize_item(item):
    """Validate and normalize a single AI-generated question item."""
    if not isinstance(item, dict):
        return None

    question_text = str(item.get("question", "")).strip()
    options = item.get("options")
    answer = item.get("answer")
    explanation = str(item.get("explanation", "")).strip()
    subtopic = str(item.get("subtopic", "")).strip() or None

    if not question_text or not explanation:
        return None
    if not isinstance(options, list) or len(options) != 4:
        return None
    if not isinstance(answer, int) or answer not in {0, 1, 2, 3}:
        return None

    cleaned_options = [str(option).strip() for option in options]
    if any(not option for option in cleaned_options):
        return None

    return {
        "question": question_text,
        "options": cleaned_options,
        "answer": answer,
        "explanation": _truncate_words(explanation, 80),
        "subtopic": subtopic,
    }


def _question_signature(question_text, options):
    q = " ".join(str(question_text or "").lower().split())
    opts = [" ".join(str(o or "").lower().split()) for o in (options or [])]
    return f"{q}||{'|'.join(opts)}"


def _build_prompt(topic, difficulty, exam, subject, count, topic_desc=None, language="english"):
    """Build the AI prompt for question generation with exam-specific context."""
    difficulty_label = (
        "basic (direct recall)" if difficulty < 0.40 else
        "easy (single-step application)" if difficulty < 0.40 else
        "medium (two-step reasoning)" if difficulty < 0.60 else
        "hard (multi-step, traps involved)" if difficulty < 0.80 else
        "very hard (olympiad-level reasoning)"
    )

    subtopic_hint = ""
    pattern_hint = ""
    if topic_desc:
        subtopics_str = ", ".join(topic_desc.get("subtopics", []))
        subtopic_hint = f"\nSubtopics to draw questions from: {subtopics_str}"
        pattern_hint = f"\nExam-specific pattern & traps: {topic_desc.get('exam_pattern', '')}"
        pattern_hint += f"\nDifficulty calibration: {topic_desc.get('difficulty_notes', '')}"

    lang_instruction = {
        "english": "Respond strictly in English.",
        "hindi": "Respond strictly in Hindi.",
        "hinglish": "Respond in simple Hinglish (Hindi + English mix)."
    }.get(language, "Respond in English.")

    return (
        f"You are a Senior Question Paper Setter for {exam.upper()} competitive exams.\n"
        f"Generate {count} unique, high-quality Multiple Choice Questions (MCQs) for the topic '{topic}' in the subject '{subject}'.\n"
        f"LANGUAGE: {lang_instruction}\n"
        f"Difficulty level: {difficulty_label}.\n"
        f"Topic Focus: {topic_desc.get('description', topic) if topic_desc else topic}\n"
        f"{subtopic_hint}\n"
        f"{pattern_hint}\n"
        f"\nCRITICAL INSTRUCTIONS:\n"
        f"1. QUALITY: Questions must be conceptually deep, avoiding direct theory. Use numericals, case-based logic, or statement-wise analysis (I, II, III).\n"
        f"2. TRAPS: Include one 'distractor' option that is a common student mistake.\n"
        f"3. TONE: Strictly professional academic tone. Use Hinglish only where essential for clarity, otherwise English.\n"
        f"4. NO REPETITION: Every question must test a different angle of '{topic}'.\n"
        f"5. OUTPUT: Return ONLY a JSON array. No markdown, no preamble.\n"
        f"\nJSON Format:\n"
        f"[{{ \"question\": \"...\", \"options\": [\"opt1\", \"opt2\", \"opt3\", \"opt4\"], \"answer\": index_0_to_3, \"explanation\": \"Detailed step-by-step logic\", \"subtopic\": \"specific part\" }}]\n"
    )


def _build_local_fallback_batch(topic, subject, exam, count):
    """Generate simple template-based fallback questions when AI is unavailable."""
    return []


def generate_question_batch(
    topic,
    difficulty,
    exam,
    subject,
    context_text=None,
    count=50,
    db=None,
    language="english",
):
    """Generate a batch of MCQ questions via AI and save them to the database."""
    source_type = "content_extracted" if context_text else "ai_generated"
    topic_desc = _get_topic_description(exam, subject, topic)
    prompt = _build_prompt(topic, difficulty, exam, subject, count, topic_desc, language)

    data = []
    attempts = 0
    while len(data) < count and attempts < 2:
        attempts += 1
        try:
            content = _call_groq(prompt, _get_model(), max_tokens=6000, temperature=0.6, stream=True)
            batch = _extract_json_array(content)
            if isinstance(batch, list):
                data.extend(batch)
        except Exception as exc:
            logger.warning("Question generation failed for exam=%s topic=%s: %s", exam, topic, exc)
            break
    
    if not data:
        data = None

    if data is None:
        logger.warning(
            "Using local fallback questions for exam=%s topic=%s due to unavailable/invalid AI output.",
            exam,
            topic,
        )
        data = _build_local_fallback_batch(topic=topic, subject=subject, exam=exam, count=count)

    model = _get_question_model(db)
    saved = 0
    seen_signatures = set()

    for item in data:
        normalized = _normalize_item(item)
        if not normalized:
            continue
        signature = _question_signature(normalized["question"], normalized["options"])
        if signature in seen_signatures:
            continue
        seen_signatures.add(signature)
        if model.objects.filter(
            exam_target=exam,
            subject=subject,
            topic=topic,
            language=language,
            question_text=normalized["question"],
        ).exists():
            continue

        model.objects.create(
            exam_target=exam,
            subject=subject,
            topic=topic,
            subtopic=normalized.get("subtopic"),
            difficulty=float(difficulty),
            q_type="MCQ",
            question_text=normalized["question"],
            options=normalized["options"],
            correct_answer=normalized["answer"],
            explanation=normalized["explanation"],
            language=language,
            source_type=source_type,
        )
        saved += 1

    return saved


def get_or_generate(
    topic,
    difficulty,
    exam,
    subject,
    context_text=None,
    db=None,
    min_count=20,
    exclude_ids=None,
    language="english",
    force_refresh=False,
):
    """Return existing questions matching criteria, generating new ones if needed."""
    model = _get_question_model(db)
    lower = float(difficulty) - 0.15
    upper = float(difficulty) + 0.15

    queryset = model.objects.filter(
        exam_target=exam,
        subject=subject,
        topic=topic,
        language=language,
        difficulty__gte=lower,
        difficulty__lte=upper,
    )
    
    check_qs = queryset
    if exclude_ids:
        check_qs = check_qs.exclude(id__in=exclude_ids)

    if check_qs.count() < min_count or force_refresh:
        generate_question_batch(
            topic=topic,
            difficulty=difficulty,
            exam=exam,
            subject=subject,
            context_text=context_text,
            count=min_count,
            language=language,
            db=db,
        )
        queryset = model.objects.filter(
            exam_target=exam,
            subject=subject,
            topic=topic,
            language=language,
            difficulty__gte=lower,
            difficulty__lte=upper,
        )

    return list(queryset)


def generate_diagnostic_set(exam, target_count=30, db=None, subject_override=None, language="english"):
    """Generate a diagnostic question set sampling representative topics per subject."""
    all_subjects = EXAM_SUBJECTS.get(exam, {})
    model = _get_question_model(db)
    
    if subject_override:
        subjects = {subject_override: all_subjects.get(subject_override, [])}
    else:
        subjects = all_subjects

    if not subjects:
        return []

    per_subject = target_count // len(subjects)
    results = []

    for subject_name, topics in subjects.items():
        subject_qs = []
        # Target for this subject
        s_target = per_subject if not subject_override else target_count
        if not subject_override and subject_name == list(subjects.keys())[-1]:
            s_target = target_count - len(results)

        # Shuffle topics to get variety
        import random
        shuffled_topics = list(topics)
        random.shuffle(shuffled_topics)

        for topic_name in shuffled_topics:
            if len(subject_qs) >= s_target:
                break
            
            # Use get_or_generate to ensure we have questions
            needed = s_target - len(subject_qs)
            batch = get_or_generate(
                topic=topic_name,
                difficulty=0.5,
                exam=exam,
                subject=subject_name,
                min_count=min(needed, 10),
                language=language,
                db=db
            )
            subject_qs.extend(batch[:needed])
        
        results.extend(subject_qs)

    # Final top-up from any topic if still short
    if len(results) < target_count:
        needed = target_count - len(results)
        extra = model.objects.filter(exam_target=exam).order_by("?")[:needed]
        results.extend(list(extra))

    return results[:target_count]


def generate_explanation(
    question_text,
    correct_answer_text,
    student_answer_text,
    failure_type,
    exam,
):
    """Generate a targeted explanation addressing a specific failure type."""
    prompt = (
        f"A {exam} student made a {failure_type} mistake.\n"
        f"Question: {question_text}\n"
        f"Correct: {correct_answer_text}\n"
        f"Student chose: {student_answer_text}\n"
        "Write a 2-sentence explanation that addresses this exact "
        f"{failure_type} mistake. Be direct. No fluff. Start with what went wrong, "
        "end with the correct concept."
    )

    return _call_groq(prompt, EXPLANATION_MODEL, max_tokens=300, temperature=0.2)


def generate_daily_plan(exam, user_profiles, days_left):
    """Generate a daily study plan based on user's weak topics."""
    profiles = user_profiles or []
    weak_profiles = sorted(
        profiles,
        key=lambda profile: getattr(profile, "ability_score", 0.0),
    )
    weak_topics = [getattr(profile, "topic_name", "") for profile in weak_profiles]
    weak_topics = [topic for topic in weak_topics if topic]

    subject_scores = {}
    subject_counts = {}
    for profile in profiles:
        subject = getattr(profile, "subject", None)
        ability = float(getattr(profile, "ability_score", 0.0))
        if not subject:
            continue
        subject_scores[subject] = subject_scores.get(subject, 0.0) + ability
        subject_counts[subject] = subject_counts.get(subject, 0) + 1

    subject_averages = []
    for subject, total in subject_scores.items():
        count = subject_counts.get(subject, 1)
        subject_averages.append((subject, total / count))

    subject_averages.sort(key=lambda item: item[1])
    priority_subjects = [subject for subject, _ in subject_averages[:2]]

    today_topics = weak_topics[:2] if weak_topics else []
    total_days = max(1, min(7, int(days_left) if days_left is not None else 7))
    week_plan = []

    topic_index = 0
    for day in range(1, total_days + 1):
        topics = []
        for _ in range(2):
            if topic_index < len(weak_topics):
                topics.append(weak_topics[topic_index])
                topic_index += 1
        week_plan.append({"day": day, "topics": topics, "type": "practice"})

    return {
        "today": {"topics": today_topics, "quiz_count": 3, "focus": "weak"},
        "this_week": week_plan,
        "priority_subjects": priority_subjects,
    }


def generate_ai_failure_report(
    exam,
    session_summary,
    dna_breakdown,
    topic_breakdown,
):
    """Generate a personalized AI Failure DNA report from session analytics.

    Returns a structured dictionary with summary, strengths, weaknesses and
    actionable next steps. Raises on AI/provider failures so callers can fallback.
    """
    prompt = (
        "You are a strict but supportive exam mentor.\n"
        f"Exam target: {exam}\n\n"
        "You are given session analytics JSON:\n"
        f"session_summary={json.dumps(session_summary, ensure_ascii=True)}\n"
        f"dna_breakdown={json.dumps(dna_breakdown, ensure_ascii=True)}\n"
        f"topic_breakdown={json.dumps(topic_breakdown, ensure_ascii=True)}\n\n"
        "Create a personalized student report. It must vary by topics/subjects and not be generic.\n"
        "Return ONLY valid JSON object with this exact schema:\n"
        "{"
        '"one_line_diagnosis": string,'
        '"strengths": [string, string, string],'
        '"priority_fixes": [string, string, string],'
        '"next_3_sessions": [string, string, string],'
        '"study_protocol_7d": [string, string, string, string],'
        '"motivation": string'
        "}\n"
        "Rules:\n"
        "1) Mention concrete topic names from topic_breakdown in strengths/fixes.\n"
        "2) Keep each bullet short and actionable for a student.\n"
        "3) next_3_sessions must specify subject/topic focus + objective.\n"
        "4) Avoid markdown, code fences, or extra text."
    )

    raw = _call_groq(prompt, DNA_REPORT_MODEL, max_tokens=900, temperature=0.3)
    obj = _extract_json_object(raw)
    if not isinstance(obj, dict):
        raise ValueError("Invalid AI report payload")
    return {
        "one_line_diagnosis": str(obj.get("one_line_diagnosis", "")).strip(),
        "strengths": [str(x).strip() for x in (obj.get("strengths") or []) if str(x).strip()][:3],
        "priority_fixes": [str(x).strip() for x in (obj.get("priority_fixes") or []) if str(x).strip()][:3],
        "next_3_sessions": [str(x).strip() for x in (obj.get("next_3_sessions") or []) if str(x).strip()][:3],
        "study_protocol_7d": [str(x).strip() for x in (obj.get("study_protocol_7d") or []) if str(x).strip()][:4],
        "motivation": str(obj.get("motivation", "")).strip(),
    }


def generate_ai_study_plan(exam, user_snapshot, performance_snapshot):
    """Generate a structured premium study plan using AI."""
    prompt = (
        "You are an expert exam strategist building a practical study plan.\n"
        f"Exam target: {exam}\n\n"
        "You are given user context JSON:\n"
        f"user_snapshot={json.dumps(user_snapshot, ensure_ascii=True)}\n"
        f"performance_snapshot={json.dumps(performance_snapshot, ensure_ascii=True)}\n\n"
        "Return ONLY valid JSON with this exact schema:\n"
        "{"
        '"plan_title": string,'
        '"one_line_focus": string,'
        '"today_plan": [{"task": string, "topic": string, "duration_min": int, "reason": string}],'
        '"weekly_plan": [{"day": int, "focus": string, "topics": [string], "quiz_goal": string, "revision_goal": string}],'
        '"priority_rules": [string, string, string],'
        '"review_checkpoints": [string, string, string],'
        '"motivation": string'
        "}\n"
        "Rules:\n"
        "1) Use topic names from the provided data.\n"
        "2) Keep tasks short, concrete, and student-friendly.\n"
        "3) weekly_plan must have exactly 7 day entries.\n"
        "4) Do not include markdown or extra text."
    )

    raw = _call_groq(prompt, STUDY_PLAN_MODEL, max_tokens=1200, temperature=0.25)
    obj = _extract_json_object(raw)
    if not isinstance(obj, dict):
        raise ValueError("Invalid AI study plan payload")

    today_plan = []
    for row in (obj.get("today_plan") or [])[:4]:
        if not isinstance(row, dict):
            continue
        try:
            duration = int(row.get("duration_min", 20))
        except (TypeError, ValueError):
            duration = 20
        today_plan.append(
            {
                "task": str(row.get("task", "")).strip(),
                "topic": str(row.get("topic", "")).strip(),
                "duration_min": max(10, min(duration, 120)),
                "reason": str(row.get("reason", "")).strip(),
            }
        )

    weekly_plan = []
    for row in (obj.get("weekly_plan") or [])[:7]:
        if not isinstance(row, dict):
            continue
        try:
            day = int(row.get("day", len(weekly_plan) + 1))
        except (TypeError, ValueError):
            day = len(weekly_plan) + 1
        topics = [str(topic).strip() for topic in (row.get("topics") or []) if str(topic).strip()][:3]
        weekly_plan.append(
            {
                "day": max(1, min(day, 7)),
                "focus": str(row.get("focus", "")).strip(),
                "topics": topics,
                "quiz_goal": str(row.get("quiz_goal", "")).strip(),
                "revision_goal": str(row.get("revision_goal", "")).strip(),
            }
        )

    return {
        "plan_title": str(obj.get("plan_title", "")).strip(),
        "one_line_focus": str(obj.get("one_line_focus", "")).strip(),
        "today_plan": today_plan,
        "weekly_plan": weekly_plan,
        "priority_rules": [str(x).strip() for x in (obj.get("priority_rules") or []) if str(x).strip()][:3],
        "review_checkpoints": [str(x).strip() for x in (obj.get("review_checkpoints") or []) if str(x).strip()][:3],
        "motivation": str(obj.get("motivation", "")).strip(),
    }
