from collections import Counter
from datetime import timedelta

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from engines.failure_dna import (
    classify_failure,
    get_avg_time,
    get_dna_color,
    get_dna_insight,
    get_dominant_weakness,
    update_dna_profile,
)
from engines.irt import classify_ability, compute_level, compute_stars, get_target_difficulty, update_ability
from engines.question_gen import (
    generate_ai_failure_report,
    generate_diagnostic_set,
    generate_question_batch,
)
from engines.scheduler import get_next_review
from engines.topic_graph import EXAM_SUBJECTS
from plans.credit_engine import QUIZ_CREDIT_COST, check_can_take_quiz, deduct_credits
from users.models import LeaderboardEntry, TopicProfile

from .models import Question, QuizSession, SessionAnswer
from .serializers import (
    QuestionPublicSerializer,
    QuizAnswerSubmitSerializer,
    QuizSessionDetailSerializer,
    QuizStartResponseSerializer,
)

DEFAULT_QUIZ_COUNT = 10
DIAGNOSTIC_QUIZ_COUNT = 30
XP_CORRECT = 4
XP_WRONG = -1


def _is_low_quality_question(question):
    text = str(getattr(question, "question_text", "") or "").strip().lower()
    if not text:
        return True
    if text.startswith("starter:") or "concept check" in text:
        return True
    options = getattr(question, "options", []) or []
    normalized = [str(opt).strip().lower() for opt in options]
    return normalized == ["option a", "option b", "option c", "option d"]


def _topic_subject_lookup(exam_target):
    subjects = EXAM_SUBJECTS.get(exam_target, {})
    mapping = {}
    for subject, topics in subjects.items():
        for topic in topics:
            mapping[topic] = subject
    return mapping


def _base_dna():
    return {"conceptual": 0, "silly": 0, "time": 0, "recall": 0}


def _ensure_topic_profiles(user):
    existing_profiles = TopicProfile.objects.filter(user=user, exam_target=user.exam_target)
    if existing_profiles.exists():
        return list(existing_profiles)

    subjects = EXAM_SUBJECTS.get(user.exam_target)
    if not subjects:
        # Fallback for unmapped exams (e.g. CUET) to ensure profiles are created
        subjects = {"General Section": ["Core Concepts", "Advanced Principles", "Applied Theory"]}

    created_profiles = []
    seen_topics = set()
    for subject, topics in subjects.items():
        for index, topic_name in enumerate(topics):
            if topic_name in seen_topics:
                continue
            seen_topics.add(topic_name)
            created_profiles.append(
                TopicProfile(
                    user=user,
                    topic_name=topic_name,
                    subject=subject,
                    exam_target=user.exam_target,
                    ability_score=0.5,
                    stars=0,
                    is_unlocked=index == 0,
                    is_flagged_complete=False,
                    failure_dna=_base_dna(),
                    total_attempts=0,
                    correct_count=0,
                    accuracy_pct=0.0,
                    correct_streak=0,
                )
            )

    if created_profiles:
        TopicProfile.objects.bulk_create(created_profiles)
    return list(TopicProfile.objects.filter(user=user, exam_target=user.exam_target))


def _get_primary_profiles(user, requested_topic=None):
    profiles = _ensure_topic_profiles(user)
    if requested_topic:
        filtered = [profile for profile in profiles if profile.topic_name == requested_topic]
        if filtered:
            return filtered
    if not profiles:
        return []
    return sorted(profiles, key=lambda profile: profile.ability_score)[:3]


def _fetch_existing_questions_with_subject(exam_target, subject, topic, target_difficulty, exclude_ids=None):
    """Fetch questions with subject filter to prevent cross-subject contamination."""
    lower = max(0.1, target_difficulty - 0.2)
    upper = min(1.0, target_difficulty + 0.2)
    qs = Question.objects.filter(
        exam_target=exam_target,
        subject=subject,
        topic=topic,
        difficulty__gte=lower,
        difficulty__lte=upper,
    )
    if exclude_ids:
        qs = qs.exclude(id__in=exclude_ids)
    return list(qs.order_by("?"))


def _select_questions(user, count, requested_topic=None, requested_subject=None, exclude_ids=None):
    """Select profile-aware questions with instant AI generation.

    For each batch request we generate fresh questions using current IRT target
    difficulty and weak-topic profile signals, then fetch only newly created rows.
    This keeps the quiz flow instant/adaptive instead of reusing stale pools.
    """
    selected = []
    # Normalize all IDs to strings for consistent comparison
    seen_ids = {str(eid) for eid in (exclude_ids or [])}
    profiles = _ensure_topic_profiles(user)

    if requested_topic:
        topic_profiles = [p for p in profiles if p.topic_name == requested_topic]
        if not topic_profiles:
            subject = _topic_subject_lookup(user.exam_target).get(requested_topic, "General")
            targets = [(requested_topic, subject, 0.5)]
        else:
            p = topic_profiles[0]
            targets = [(p.topic_name, p.subject, get_target_difficulty(p.ability_score))]
    else:
        scoped_profiles = profiles
        if requested_subject:
            scoped_profiles = [p for p in profiles if p.subject == requested_subject]
        sorted_profiles = sorted(scoped_profiles or profiles, key=lambda p: p.ability_score)[:3]
        targets = [
            (p.topic_name, p.subject, get_target_difficulty(p.ability_score))
            for p in sorted_profiles
        ]

    # Spread generation budget across weakest targets to keep subject/topic balance.
    if targets:
        per_target = max(1, count // len(targets))
        for topic_name, subject, target_difficulty in targets:
            remaining = count - len(selected)
            if remaining <= 0:
                break
            wanted = min(remaining, per_target if len(targets) > 1 else remaining)
            try:
                before_ids = set(
                    Question.objects.filter(
                        exam_target=user.exam_target,
                        subject=subject,
                        topic=topic_name,
                    ).values_list("id", flat=True)
                )
                generate_question_batch(
                    topic=topic_name,
                    difficulty=target_difficulty,
                    exam=user.exam_target,
                    subject=subject,
                    context_text=None,
                    count=wanted,
                )
                fresh = (
                    Question.objects.filter(
                        exam_target=user.exam_target,
                        subject=subject,
                        topic=topic_name,
                    )
                    .exclude(id__in=before_ids)
                    .order_by("-created_at")
                )
                for q in fresh:
                    if str(q.id) in seen_ids:
                        continue
                    if _is_low_quality_question(q):
                        continue
                    selected.append(q)
                    seen_ids.add(str(q.id))
                    if len(selected) >= count:
                        return selected
            except Exception:
                continue

    if len(selected) < count:
        qs = Question.objects.filter(
            exam_target=user.exam_target,
            difficulty__gte=0.2,
            difficulty__lte=0.8,
        )
        if seen_ids:
            qs = qs.exclude(id__in=seen_ids)
        fallback = qs.order_by("?")[:count * 2]
        for q in fallback:
            if str(q.id) in seen_ids:
                continue
            if _is_low_quality_question(q):
                continue
            selected.append(q)
            seen_ids.add(str(q.id))
            if len(selected) >= count:
                break

    return selected[:count]


def _week_start_for_date(value):
    return value - timedelta(days=value.weekday())


def _recompute_ranks(exam_target, week_start):
    entries = LeaderboardEntry.objects.filter(
        exam_target=exam_target,
        week_start=week_start,
    ).order_by("-xp_this_week", "-xp_all_time", "id")

    rank = 1
    for entry in entries:
        if entry.rank != rank:
            entry.rank = rank
            entry.save(update_fields=["rank"])
        rank += 1


def _update_leaderboard(user, xp_delta):
    today = timezone.localdate()
    week_start = _week_start_for_date(today)
    entry, _ = LeaderboardEntry.objects.get_or_create(
        user=user,
        exam_target=user.exam_target,
        week_start=week_start,
        defaults={"rank": 0, "xp_this_week": 0, "xp_all_time": user.xp},
    )

    entry.xp_this_week = max(0, int(entry.xp_this_week) + int(xp_delta))
    entry.xp_all_time = max(0, int(user.xp))
    entry.save(update_fields=["xp_this_week", "xp_all_time"])
    _recompute_ranks(user.exam_target, week_start)


def _mark_premium_plan_stale(user):
    if user.plan != "premium":
        return

    from analytics.models import PremiumPlanSnapshot

    completed_sessions = QuizSession.objects.filter(
        user=user,
        completed_at__isnull=False,
        exam_target=user.exam_target,
    ).count()
    answers_count = SessionAnswer.objects.filter(
        session__user=user,
        session__exam_target=user.exam_target,
        session__completed_at__isnull=False,
    ).count()

    snapshot, _ = PremiumPlanSnapshot.objects.get_or_create(
        user=user,
        exam_target=user.exam_target,
        defaults={
            "status": "stale",
            "source_completed_sessions": completed_sessions,
            "source_answers_count": answers_count,
            "plan_payload": {},
            "last_error": "",
        },
    )
    snapshot.status = "stale"
    snapshot.source_completed_sessions = completed_sessions
    snapshot.source_answers_count = answers_count
    snapshot.save(update_fields=["status", "source_completed_sessions", "source_answers_count", "updated_at"])


def _complete_session(session, force=False):
    total_questions = len(session.questions or [])
    answered_queryset = session.answers.all()
    answered_count = answered_queryset.count()

    if not force and answered_count < total_questions:
        return None

    correct_count = answered_queryset.filter(is_correct=True).count()
    aggregate = answered_queryset.aggregate(total_xp=Sum("xp_delta"))
    xp_earned = int(aggregate.get("total_xp") or 0)
    score_pct = (correct_count / total_questions * 100.0) if total_questions else 0.0

    just_completed = False
    if session.completed_at is None:
        just_completed = True
        session.completed_at = timezone.now()
        session.score_pct = round(score_pct, 2)
        session.xp_earned = xp_earned
        session.save(update_fields=["completed_at", "score_pct", "xp_earned"])

    if just_completed:
        _mark_premium_plan_stale(session.user)

    failure_counts = Counter(answered_queryset.values_list("failure_type", flat=True))
    dominant = get_dominant_weakness(
        {
            "conceptual": failure_counts.get("conceptual", 0),
            "silly": failure_counts.get("silly", 0),
            "time": failure_counts.get("time", 0),
            "recall": failure_counts.get("recall", 0),
        }
    )
    return {
        "total_questions": total_questions,
        "answered": answered_count,
        "correct": correct_count,
        "score_pct": round(score_pct, 2),
        "xp_earned": xp_earned,
        "dominant_failure_type": dominant,
    }


def _build_simple_dna_summary(dominant_failure, topic_breakdown, score_pct):
    weak_topics = [topic["topic"] for topic in topic_breakdown if float(topic.get("accuracy_pct") or 0) < 60]
    strong_topics = [topic["topic"] for topic in topic_breakdown if float(topic.get("accuracy_pct") or 0) >= 75]

    if dominant_failure == "conceptual":
        next_step = "Revise basics first, then solve easy mixed questions."
    elif dominant_failure == "silly":
        next_step = "Add a 10-second verification rule before submitting each answer."
    elif dominant_failure == "time":
        next_step = "Practice timed sets daily and skip hard questions faster."
    elif dominant_failure == "recall":
        next_step = "Use spaced revision and formula flashcards this week."
    else:
        next_step = "Keep consistency and gradually increase quiz difficulty."

    return {
        "score_band": (
            "excellent"
            if score_pct >= 80
            else "good"
            if score_pct >= 60
            else "needs_improvement"
        ),
        "headline": (
            f"Main issue: {dominant_failure.replace('_', ' ') if dominant_failure != 'none' else 'no major weakness detected'}."
        ),
        "next_step": next_step,
        "focus_topics": weak_topics[:3],
        "stable_topics": strong_topics[:3],
    }


class QuizStartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        gate = check_can_take_quiz(user)
        if not gate["allowed"]:
            return Response({"detail": gate["reason"]}, status=status.HTTP_403_FORBIDDEN)

        requested_topic = request.query_params.get("topic")
        requested_subject = request.query_params.get("subject")
        allowed_session_types = {"free_quiz", "daily_plan", "diagnostic", "topic_practice"}
        session_type = request.query_params.get("session_type", "free_quiz")
        if requested_topic and session_type == "free_quiz":
            session_type = "topic_practice"
        if session_type not in allowed_session_types:
            session_type = "free_quiz"
        if user.plan in {"free", "pro"} and session_type == "free_quiz" and not requested_topic and not requested_subject:
            return Response(
                {
                    "detail": "subject_or_topic_required",
                    "message": "Please select a subject or topic first.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.plan == "premium":
            has_any_session = QuizSession.objects.filter(user=user).exists()
            if not has_any_session and session_type != "diagnostic":
                return Response(
                    {
                        "detail": "premium_initial_quiz_required",
                        "message": "Premium users must complete the initial diagnostic quiz first.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        questions = _select_questions(
            user=user,
            count=5, # Generates and returns 5 at a time
            requested_topic=requested_topic,
            requested_subject=requested_subject,
        )
        if len(questions) == 0:
            available_for_exam = Question.objects.filter(exam_target=user.exam_target).count()
            detail = "not_enough_questions"
            message = "Not enough questions available for this quiz request."
            status_code = status.HTTP_400_BAD_REQUEST
            if available_for_exam == 0:
                detail = "question_generation_unavailable"
                message = (
                    "No questions are available yet and AI generation is currently unavailable. "
                    "Check Groq connectivity/API key and retry."
                )
                status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            return Response(
                {
                    "detail": detail,
                    "message": message,
                    "exam_target": user.exam_target,
                    "required": 5,
                    "available_for_exam": available_for_exam,
                },
                status=status_code,
            )

        with transaction.atomic():
            session = QuizSession.objects.create(
                user=user,
                session_type=session_type,
                exam_target=user.exam_target,
                questions=[str(question.id) for question in questions],
            )
            deduct_credits(user, amount=QUIZ_CREDIT_COST)

        payload = {
            "session_id": session.id,
            "session_type": session.session_type,
            "total_questions": 20, # Show 20 to the frontend
            "questions": QuestionPublicSerializer(questions, many=True).data,
        }
        response = QuizStartResponseSerializer(payload).data
        return Response(response, status=status.HTTP_200_OK)


class QuizNextBatchView(APIView):
    """Dynamically loads the next batch of 5 questions while the user takes the quiz."""
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id, *args, **kwargs):
        try:
            session = QuizSession.objects.get(id=session_id, user=request.user)
        except QuizSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        if session.completed_at:
            return Response({"detail": "Session already completed."}, status=status.HTTP_400_BAD_REQUEST)

        # Get existing question IDs
        existing_ids = session.questions or []

        # Preserve topic-practice focus across batches.
        requested_topic = None
        requested_subject = None
        if session.session_type == "topic_practice" and existing_ids:
            first_q = Question.objects.filter(id=existing_ids[0]).first()
            if first_q:
                requested_topic = first_q.topic
                requested_subject = first_q.subject

        # Select 5 more questions
        new_questions = _select_questions(
            user=request.user,
            count=5,
            requested_topic=requested_topic,
            requested_subject=requested_subject,
            exclude_ids=existing_ids
        )

        # Append to session
        if new_questions:
            for q in new_questions:
                session.questions.append(str(q.id))
            session.save(update_fields=["questions"])

        return Response({"questions": QuestionPublicSerializer(new_questions, many=True).data})


class DiagnosticStartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.plan != "premium":
            return Response({"detail": "premium_required"}, status=status.HTTP_403_FORBIDDEN)

        gate = check_can_take_quiz(user)
        if not gate["allowed"]:
            return Response({"detail": gate["reason"]}, status=status.HTTP_403_FORBIDDEN)

        try:
            generated_questions = generate_diagnostic_set(user.exam_target)
        except Exception:
            generated_questions = []

        if not generated_questions:
            generated_questions = list(
                Question.objects.filter(exam_target=user.exam_target).order_by("-created_at")[
                    :DIAGNOSTIC_QUIZ_COUNT
                ]
            )

        if len(generated_questions) < DIAGNOSTIC_QUIZ_COUNT:
            available_for_exam = Question.objects.filter(exam_target=user.exam_target).count()
            detail = "not_enough_questions_for_diagnostic"
            message = "Not enough questions available for diagnostic quiz."
            status_code = status.HTTP_400_BAD_REQUEST
            if available_for_exam == 0:
                detail = "diagnostic_generation_unavailable"
                message = (
                    "No diagnostic questions are available yet and AI generation is currently unavailable. "
                    "Check Groq connectivity/API key and retry."
                )
                status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            return Response(
                {
                    "detail": detail,
                    "message": message,
                    "exam_target": user.exam_target,
                    "required": DIAGNOSTIC_QUIZ_COUNT,
                    "available_for_exam": available_for_exam,
                },
                status=status_code,
            )

        questions = generated_questions[:DIAGNOSTIC_QUIZ_COUNT]
        with transaction.atomic():
            session = QuizSession.objects.create(
                user=user,
                session_type="diagnostic",
                exam_target=user.exam_target,
                questions=[str(question.id) for question in questions],
            )
            deduct_credits(user, amount=QUIZ_CREDIT_COST)

        payload = {
            "session_id": session.id,
            "session_type": session.session_type,
            "total_questions": len(questions),
            "questions": QuestionPublicSerializer(questions, many=True).data,
        }
        response = QuizStartResponseSerializer(payload).data
        return Response(response, status=status.HTTP_200_OK)


class ContentQuizStartView(APIView):
    """Generate quiz from uploaded content or manual topic entry."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from content.models import UploadedContent
        from engines.question_gen import generate_question_batch

        user = request.user
        gate = check_can_take_quiz(user)
        if not gate["allowed"]:
            return Response({"detail": gate["reason"]}, status=status.HTTP_403_FORBIDDEN)

        data = request.data or {}
        content_id = data.get("content_id")
        topic = str(data.get("topic", "")).strip()
        subject = str(data.get("subject", "General")).strip()
        description = str(data.get("description", "")).strip()
        count = min(int(data.get("count", DEFAULT_QUIZ_COUNT)), 20)

        context_text = None
        source_topic = topic or "General"
        content_type = None

        # From uploaded content
        if content_id:
            content = UploadedContent.objects.filter(id=content_id, user=user).first()
            if not content:
                return Response({"detail": "content_not_found"}, status=status.HTTP_404_NOT_FOUND)
            context_text = content.extracted_text or ""
            content_type = content.content_type
            if content.topic_name:
                source_topic = content.topic_name

        # From manual description
        elif description:
            context_text = f"Topic: {topic}\n\n{description}"

        if not topic and not context_text:
            return Response({"detail": "Provide topic or content_id."}, status=status.HTTP_400_BAD_REQUEST)
        if user.plan in {"free", "pro"} and not subject and not content_id:
            return Response(
                {"detail": "subject_required", "message": "Select subject before quiz generation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if content_type == "video" and len((context_text or "").strip()) < 120:
            if topic:
                context_text = (
                    f"Topic: {topic}\n\nVideo summary unavailable. Focus on the topic."
                )
            else:
                return Response(
                    {
                        "detail": "video_analysis_failed",
                        "message": "Video analysis returned insufficient text. Add a topic or try another URL.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Generate questions using AI
        try:
            saved = generate_question_batch(
                topic=source_topic,
                difficulty=0.5,
                exam=user.exam_target,
                subject=subject,
                context_text=context_text,
                count=count,
            )
        except Exception:
            saved = 0

        # Fetch generated questions
        questions = list(
            Question.objects.filter(
                exam_target=user.exam_target,
                topic=source_topic,
            ).order_by("-created_at")[:count]
        )

        if len(questions) < 1:
            return Response(
                {"detail": "question_generation_unavailable", "message": "Could not generate questions. Check AI connectivity."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        with transaction.atomic():
            session = QuizSession.objects.create(
                user=user,
                session_type="content_quiz",
                exam_target=user.exam_target,
                questions=[str(q.id) for q in questions],
            )
            deduct_credits(user, amount=QUIZ_CREDIT_COST)

        payload = {
            "session_id": session.id,
            "session_type": session.session_type,
            "total_questions": len(questions),
            "questions": QuestionPublicSerializer(questions, many=True).data,
            "source_topic": source_topic,
            "subject": subject,
            "content_type": content_type,
        }
        return Response(QuizStartResponseSerializer(payload).data, status=status.HTTP_200_OK)


class QuizAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = QuizAnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session = QuizSession.objects.filter(id=data["session_id"], user=request.user).first()
        if not session:
            return Response({"detail": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)
        if session.completed_at:
            return Response({"detail": "session_completed"}, status=status.HTTP_400_BAD_REQUEST)

        question = Question.objects.filter(id=data["question_id"]).first()
        if not question or str(question.id) not in (session.questions or []):
            return Response({"detail": "question_not_in_session"}, status=status.HTTP_400_BAD_REQUEST)

        existing = SessionAnswer.objects.filter(session=session, question=question).first()
        if existing:
            return Response({"detail": "answer_already_submitted"}, status=status.HTTP_400_BAD_REQUEST)

        selected_option = data.get("selected_option", None)
        response_time = float(data.get("response_time", 60.0))
        is_correct = selected_option is not None and int(selected_option) == int(question.correct_answer)
        xp_delta = XP_CORRECT if is_correct else XP_WRONG

        profile = TopicProfile.objects.filter(
            user=request.user,
            exam_target=request.user.exam_target,
            topic_name=question.topic,
        ).first()
        if profile is None:
            profile = TopicProfile.objects.create(
                user=request.user,
                topic_name=question.topic,
                subject=question.subject,
                exam_target=request.user.exam_target,
                ability_score=0.5,
                stars=0,
                is_unlocked=True,
                is_flagged_complete=False,
                failure_dna=_base_dna(),
                total_attempts=0,
                correct_count=0,
                accuracy_pct=0.0,
                correct_streak=0,
            )

        old_ability = float(profile.ability_score)
        failure_type = classify_failure(
            is_correct=is_correct,
            response_time=response_time,
            difficulty=float(question.difficulty),
            ability_score=old_ability,
        )
        avg_time = get_avg_time(float(question.difficulty))
        new_ability = update_ability(
            theta=old_ability,
            correct=is_correct,
            difficulty=float(question.difficulty),
            response_time=response_time,
            avg_time=avg_time,
        )

        SessionAnswer.objects.create(
            session=session,
            question=question,
            selected_option=selected_option,
            is_correct=is_correct,
            response_time=response_time,
            failure_type=failure_type,
            xp_delta=xp_delta,
        )

        profile.total_attempts = int(profile.total_attempts) + 1
        if is_correct:
            profile.correct_count = int(profile.correct_count) + 1
            profile.correct_streak = int(profile.correct_streak) + 1
        else:
            profile.correct_streak = 0

        profile.accuracy_pct = (
            profile.correct_count / profile.total_attempts * 100.0 if profile.total_attempts else 0.0
        )
        profile.ability_score = new_ability
        profile.stars = compute_stars(profile.accuracy_pct)
        next_review = get_next_review(new_ability, profile.correct_streak, failure_type)
        if timezone.is_naive(next_review):
            next_review = timezone.make_aware(next_review, timezone.get_current_timezone())
        profile.next_review = next_review

        current_dna = dict(profile.failure_dna or _base_dna())
        current_dna = {**_base_dna(), **current_dna}
        profile.failure_dna = update_dna_profile(current_dna, failure_type)
        if profile.stars == 3 and profile.total_attempts >= 5:
            profile.is_flagged_complete = True

        profile.save(
            update_fields=[
                "total_attempts",
                "correct_count",
                "correct_streak",
                "accuracy_pct",
                "ability_score",
                "stars",
                "next_review",
                "failure_dna",
                "is_flagged_complete",
            ]
        )

        request.user.xp = max(0, int(request.user.xp) + xp_delta)
        request.user.level = compute_level(request.user.xp)

        # Streak tracking
        today = timezone.localdate()
        last_active = request.user.last_active
        if last_active is None or (today - last_active).days > 1:
            request.user.streak = 1
        elif (today - last_active).days == 1:
            request.user.streak = int(request.user.streak) + 1
        # same day: streak unchanged
        request.user.last_active = today

        request.user.save(update_fields=["xp", "level", "streak", "last_active"])
        _update_leaderboard(request.user, xp_delta)

        completion = _complete_session(session, force=False)
        total_questions = len(session.questions or [])
        answered_count = session.answers.count()

        correct_answer_text = ""
        options = question.options or []
        if isinstance(options, list) and 0 <= int(question.correct_answer) < len(options):
            correct_answer_text = str(options[int(question.correct_answer)])

        dominant_weakness = get_dominant_weakness(dict(profile.failure_dna or {}))

        return Response(
            {
                "session_id": str(session.id),
                "question_id": str(question.id),
                "selected_option": selected_option,
                "is_correct": is_correct,
                "correct_answer": int(question.correct_answer),
                "correct_answer_text": correct_answer_text,
                "failure_type": failure_type,
                "failure_color": get_dna_color(failure_type),
                "xp_delta": xp_delta,
                "user_xp": request.user.xp,
                "user_level": request.user.level,
                "old_ability": old_ability,
                "new_ability": round(new_ability, 4),
                "ability_label": classify_ability(new_ability),
                "new_stars": int(profile.stars),
                "dna_insight": get_dna_insight(dominant_weakness),
                "explanation": question.explanation,
                "answered_count": answered_count,
                "total_questions": total_questions,
                "session_complete": bool(completion),
                "session_summary": completion,
            },
            status=status.HTTP_200_OK,
        )


class QuizSessionCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id, *args, **kwargs):
        session = QuizSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            return Response({"detail": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)

        summary = _complete_session(session, force=True)
        return Response(
            {"session_id": str(session.id), "summary": summary},
            status=status.HTTP_200_OK,
        )


class QuizSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id, *args, **kwargs):
        session = (
            QuizSession.objects.filter(id=session_id, user=request.user)
            .prefetch_related("answers__question")
            .first()
        )
        if not session:
            return Response({"detail": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)

        answers = session.answers.all()
        failure_breakdown = Counter(answers.values_list("failure_type", flat=True))
        topic_names = {answer.question.topic for answer in answers}
        profiles = TopicProfile.objects.filter(
            user=request.user,
            exam_target=request.user.exam_target,
            topic_name__in=topic_names,
        )
        topic_abilities = [
            {
                "topic": profile.topic_name,
                "ability_score": profile.ability_score,
                "stars": profile.stars,
                "status": profile.is_flagged_complete,
            }
            for profile in profiles
        ]

        payload = QuizSessionDetailSerializer(session).data
        payload["answers_count"] = answers.count()
        payload["correct_count"] = answers.filter(is_correct=True).count()
        payload["failure_breakdown"] = {
            "conceptual": failure_breakdown.get("conceptual", 0),
            "silly": failure_breakdown.get("silly", 0),
            "time": failure_breakdown.get("time", 0),
            "recall": failure_breakdown.get("recall", 0),
            "correct": failure_breakdown.get("correct", 0),
        }
        payload["topic_abilities"] = topic_abilities
        payload["dominant_failure_type"] = get_dominant_weakness(payload["failure_breakdown"])

        return Response(payload, status=status.HTTP_200_OK)


class QuizHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        sessions = (
            QuizSession.objects.filter(user=request.user)
            .order_by("-started_at")[:20]
        )
        rows = [
            {
                "session_id": str(session.id),
                "session_type": session.session_type,
                "exam_target": session.exam_target,
                "started_at": session.started_at,
                "completed_at": session.completed_at,
                "score_pct": session.score_pct,
                "xp_earned": session.xp_earned,
                "questions_count": len(session.questions or []),
            }
            for session in sessions
        ]
        return Response({"sessions": rows, "count": len(rows)}, status=status.HTTP_200_OK)


class QuizDNAReportView(APIView):
    """GET /quiz/sessions/<session_id>/dna-report/

    Generates a full Failure DNA Report for a completed quiz session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id, *args, **kwargs):
        session = (
            QuizSession.objects.filter(id=session_id, user=request.user)
            .prefetch_related("answers__question")
            .first()
        )
        if not session:
            return Response({"detail": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)

        if not session.completed_at:
            return Response({"detail": "session_not_completed"}, status=status.HTTP_400_BAD_REQUEST)

        answers = list(session.answers.select_related("question").all())
        total = len(answers)
        correct_count = sum(1 for a in answers if a.is_correct)
        score_pct = round((correct_count / total * 100) if total else 0.0, 1)

        topic_data = {}
        for answer in answers:
            t = answer.question.topic
            subj = answer.question.subject
            if t not in topic_data:
                topic_data[t] = {
                    "topic": t, "subject": subj, "total": 0, "correct": 0,
                    "failure_counts": {"conceptual": 0, "silly": 0, "time": 0, "recall": 0},
                    "wrong_questions": [],
                }
            topic_data[t]["total"] += 1
            if answer.is_correct:
                topic_data[t]["correct"] += 1
            else:
                ft = answer.failure_type
                if ft in topic_data[t]["failure_counts"]:
                    topic_data[t]["failure_counts"][ft] += 1
                opts = answer.question.options or []
                correct_txt = opts[answer.question.correct_answer] if opts else ""
                your_txt = opts[answer.selected_option] if (answer.selected_option is not None and opts) else "Not answered"
                topic_data[t]["wrong_questions"].append({
                    "question_id": str(answer.question.id),
                    "question_text": answer.question.question_text[:120],
                    "subtopic": answer.question.subtopic or "",
                    "correct_answer": correct_txt,
                    "your_answer": your_txt,
                    "failure_type": ft,
                    "failure_color": get_dna_color(ft),
                    "explanation": answer.question.explanation,
                    "response_time_sec": round(answer.response_time, 1),
                })

        topic_names = list(topic_data.keys())
        profiles = {
            p.topic_name: p
            for p in TopicProfile.objects.filter(
                user=request.user, exam_target=request.user.exam_target,
                topic_name__in=topic_names,
            )
        }
        topic_breakdown = []
        for t, data in topic_data.items():
            profile = profiles.get(t)
            acc = round(data["correct"] / data["total"] * 100, 1) if data["total"] else 0
            dominant = get_dominant_weakness(data["failure_counts"])
            topic_breakdown.append({
                **data,
                "accuracy_pct": acc,
                "dominant_failure": dominant,
                "dominant_failure_color": get_dna_color(dominant) if dominant != "none" else "#10B981",
                "ability_score": round(profile.ability_score, 3) if profile else None,
                "ability_label": classify_ability(profile.ability_score) if profile else "unknown",
                "stars": profile.stars if profile else 0,
            })
        topic_breakdown.sort(key=lambda x: x["accuracy_pct"])

        all_failure_counts = {
            k: sum(td["failure_counts"][k] for td in topic_data.values())
            for k in ["conceptual", "silly", "time", "recall"]
        }
        wrong_count = max(0, total - correct_count)
        failure_percentages = {
            key: round((value / wrong_count * 100.0), 1) if wrong_count else 0.0
            for key, value in all_failure_counts.items()
        }
        dominant = get_dominant_weakness(all_failure_counts)
        dna_insight = get_dna_insight(dominant)
        improvement_plan = _build_improvement_plan(dominant, topic_breakdown, score_pct)
        simple_summary = _build_simple_dna_summary(dominant, topic_breakdown, score_pct)
        ai_report = None
        try:
            ai_report = generate_ai_failure_report(
                exam=session.exam_target,
                session_summary={
                    "total_questions": total,
                    "correct": correct_count,
                    "wrong": total - correct_count,
                    "score_pct": score_pct,
                    "xp_earned": session.xp_earned,
                },
                dna_breakdown=all_failure_counts,
                topic_breakdown=[
                    {
                        "topic": item["topic"],
                        "subject": item["subject"],
                        "accuracy_pct": item["accuracy_pct"],
                        "dominant_failure": item["dominant_failure"],
                        "ability_score": item["ability_score"],
                    }
                    for item in topic_breakdown
                ],
            )
        except Exception:
            ai_report = None

        return Response({
            "session_id": str(session.id),
            "session_type": session.session_type,
            "exam_target": session.exam_target,
            "completed_at": session.completed_at,
            "session_summary": {
                "total_questions": total, "correct": correct_count,
                "wrong": total - correct_count, "score_pct": score_pct,
                "xp_earned": session.xp_earned,
            },
            "dna_breakdown": all_failure_counts,
            "failure_percentages": failure_percentages,
            "dominant_failure": dominant,
            "dominant_failure_color": get_dna_color(dominant),
            "dna_insight": dna_insight,
            "simple_summary": simple_summary,
            "topic_breakdown": topic_breakdown,
            "improvement_plan": improvement_plan,
            "ai_report": ai_report,
        }, status=status.HTTP_200_OK)


class OverallDNAReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        sessions = list(
            QuizSession.objects.filter(
                user=request.user,
                exam_target=request.user.exam_target,
                completed_at__isnull=False,
            )
            .order_by("-completed_at")
            .prefetch_related("answers__question")
        )

        if not sessions:
            return Response(
                {
                    "exam_target": request.user.exam_target,
                    "updated_at": timezone.now(),
                    "sessions_count": 0,
                    "overall_summary": {
                        "total_questions": 0,
                        "correct": 0,
                        "wrong": 0,
                        "score_pct": 0.0,
                        "avg_score_pct": 0.0,
                    },
                    "dna_breakdown": _base_dna(),
                    "failure_percentages": {key: 0.0 for key in _base_dna()},
                    "dominant_failure": "none",
                    "dominant_failure_color": get_dna_color("correct"),
                    "dna_insight": get_dna_insight("none"),
                    "simple_summary": _build_simple_dna_summary("none", [], 0.0),
                    "topic_breakdown": [],
                    "recent_sessions": [],
                    "improvement_plan": _build_improvement_plan("none", [], 0.0),
                },
                status=status.HTTP_200_OK,
            )

        topic_data = {}
        all_answers = []
        for session in sessions:
            session_answers = list(session.answers.all())
            all_answers.extend(session_answers)
            for answer in session_answers:
                topic_name = answer.question.topic
                subject_name = answer.question.subject
                if topic_name not in topic_data:
                    topic_data[topic_name] = {
                        "topic": topic_name,
                        "subject": subject_name,
                        "total": 0,
                        "correct": 0,
                        "failure_counts": _base_dna(),
                        "avg_response_sec_samples": [],
                    }
                topic_data[topic_name]["total"] += 1
                if answer.is_correct:
                    topic_data[topic_name]["correct"] += 1
                elif answer.failure_type in topic_data[topic_name]["failure_counts"]:
                    topic_data[topic_name]["failure_counts"][answer.failure_type] += 1
                topic_data[topic_name]["avg_response_sec_samples"].append(float(answer.response_time))

        total_questions = len(all_answers)
        correct_count = sum(1 for answer in all_answers if answer.is_correct)
        wrong_count = max(0, total_questions - correct_count)
        score_pct = round((correct_count / total_questions * 100.0) if total_questions else 0.0, 1)
        avg_score_pct = round(
            sum(float(session.score_pct or 0.0) for session in sessions) / len(sessions),
            1,
        )

        topic_names = list(topic_data.keys())
        profiles = {
            profile.topic_name: profile
            for profile in TopicProfile.objects.filter(
                user=request.user,
                exam_target=request.user.exam_target,
                topic_name__in=topic_names,
            )
        }

        topic_breakdown = []
        for topic_name, item in topic_data.items():
            profile = profiles.get(topic_name)
            accuracy_pct = round((item["correct"] / item["total"] * 100.0), 1) if item["total"] else 0.0
            dominant = get_dominant_weakness(item["failure_counts"])
            avg_response_sec = (
                round(sum(item["avg_response_sec_samples"]) / len(item["avg_response_sec_samples"]), 1)
                if item["avg_response_sec_samples"]
                else 0.0
            )
            topic_breakdown.append(
                {
                    "topic": item["topic"],
                    "subject": item["subject"],
                    "total": item["total"],
                    "correct": item["correct"],
                    "accuracy_pct": accuracy_pct,
                    "avg_response_sec": avg_response_sec,
                    "failure_counts": item["failure_counts"],
                    "dominant_failure": dominant,
                    "dominant_failure_color": get_dna_color(dominant) if dominant != "none" else "#10B981",
                    "ability_score": round(float(profile.ability_score), 3) if profile else None,
                    "ability_label": classify_ability(profile.ability_score) if profile else "unknown",
                    "stars": int(profile.stars) if profile else 0,
                }
            )

        topic_breakdown.sort(key=lambda row: row["accuracy_pct"])

        dna_breakdown = {
            key: sum(topic["failure_counts"][key] for topic in topic_breakdown)
            for key in _base_dna()
        }
        failure_percentages = {
            key: round((value / wrong_count * 100.0), 1) if wrong_count else 0.0
            for key, value in dna_breakdown.items()
        }
        dominant = get_dominant_weakness(dna_breakdown)

        recent_sessions = []
        for session in sessions[:5]:
            session_answers = list(session.answers.all())
            failure_counts = Counter(answer.failure_type for answer in session_answers)
            recent_sessions.append(
                {
                    "session_id": str(session.id),
                    "completed_at": session.completed_at,
                    "score_pct": round(float(session.score_pct or 0.0), 2),
                    "xp_earned": int(session.xp_earned or 0),
                    "dominant_failure": get_dominant_weakness(
                        {
                            "conceptual": failure_counts.get("conceptual", 0),
                            "silly": failure_counts.get("silly", 0),
                            "time": failure_counts.get("time", 0),
                            "recall": failure_counts.get("recall", 0),
                        }
                    ),
                }
            )

        return Response(
            {
                "exam_target": request.user.exam_target,
                "updated_at": timezone.now(),
                "sessions_count": len(sessions),
                "overall_summary": {
                    "total_questions": total_questions,
                    "correct": correct_count,
                    "wrong": wrong_count,
                    "score_pct": score_pct,
                    "avg_score_pct": avg_score_pct,
                },
                "dna_breakdown": dna_breakdown,
                "failure_percentages": failure_percentages,
                "dominant_failure": dominant,
                "dominant_failure_color": get_dna_color(dominant) if dominant != "none" else "#10B981",
                "dna_insight": get_dna_insight(dominant),
                "simple_summary": _build_simple_dna_summary(dominant, topic_breakdown, score_pct),
                "topic_breakdown": topic_breakdown[:12],
                "recent_sessions": recent_sessions,
                "improvement_plan": _build_improvement_plan(dominant, topic_breakdown, score_pct),
            },
            status=status.HTTP_200_OK,
        )


def _build_improvement_plan(dominant_failure, topic_breakdown, score_pct):
    """Build specific, actionable improvement plan based on DNA and topic performance."""
    weak_topics = [t["topic"] for t in topic_breakdown if t["accuracy_pct"] < 50]
    medium_topics = [t["topic"] for t in topic_breakdown if 50 <= t["accuracy_pct"] < 75]

    plans = {
        "conceptual": (
            "Study from scratch — re-read theory and solve 10 basic examples per weak topic.",
            "Do NOT solve more practice MCQs yet. Focus on understanding fundamentals first.",
            "Review weak topics every 2 days.",
        ),
        "silly": (
            "You understand the concepts. Slow down — take 10 extra seconds per question to verify.",
            "Practice with strict self-checking: write your answer, then re-read the question.",
            "Review silly mistakes immediately after each quiz.",
        ),
        "time": (
            "Solve 15 timed questions daily. Aim to reduce average solve time by 20% over 1 week.",
            "Start with easy questions to build momentum, tackle hard ones last.",
            "Do a timed sprint every day on topics listed below.",
        ),
        "recall": (
            "Use spaced repetition — review in 1 day, then 3 days, then 7 days.",
            "Make flashcards or formula sheets for high-recall topics.",
            "Re-attempt these topics in your next quiz.",
        ),
    }
    default_plan = (
        "Excellent session! Maintain consistency and attempt harder questions next time.",
        "Keep pushing difficulty upward — target 0.1 higher difficulty than today.",
        "Review in 7 days for retention check.",
    )
    action, method, freq = plans.get(dominant_failure, default_plan)

    return {
        "primary_action": action,
        "method": method,
        "review_frequency": freq,
        "topics_to_focus": weak_topics[:3],
        "topics_to_maintain": medium_topics[:3],
        "next_quiz_type": "topic_practice" if weak_topics else "free_quiz",
        "next_quiz_topic": weak_topics[0] if weak_topics else None,
    }
