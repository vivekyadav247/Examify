from collections import Counter
from datetime import timedelta

from django.db.models import Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from engines.failure_dna import get_dna_insight, get_dominant_weakness
from engines.scheduler import compute_readiness
from engines.topic_graph import EXAM_SUBJECTS, build_topic_graph, build_vertical_plan_graph, get_topic_unlock_status
from quiz.models import QuizSession, SessionAnswer
from users.models import EXAM_TARGET_CHOICES, LeaderboardEntry, TopicProfile


def _week_start_for_date(value):
    return value - timedelta(days=value.weekday())


def _build_failure_counts(profiles):
    merged = Counter({"conceptual": 0, "silly": 0, "time": 0, "recall": 0})
    for profile in profiles:
        dna = profile.failure_dna or {}
        for key in ("conceptual", "silly", "time", "recall"):
            merged[key] += int(dna.get(key, 0))
    return merged


def _ensure_topic_profiles_for_exam(user, exam_target, weak_subjects=None):
    weak_subjects = set(weak_subjects or [])
    existing_topics = set(
        TopicProfile.objects.filter(user=user, exam_target=exam_target).values_list("topic_name", flat=True)
    )
    seen_topics = set(existing_topics)

    to_create = []
    for subject, topics in EXAM_SUBJECTS.get(exam_target, {}).items():
        for index, topic_name in enumerate(topics):
            if topic_name in seen_topics:
                continue
            seen_topics.add(topic_name)
            initial_ability = 0.3 if subject in weak_subjects else 0.5
            to_create.append(
                TopicProfile(
                    user=user,
                    topic_name=topic_name,
                    subject=subject,
                    exam_target=exam_target,
                    ability_score=initial_ability,
                    stars=0,
                    is_unlocked=index == 0,
                    is_flagged_complete=False,
                    failure_dna={"conceptual": 0, "silly": 0, "time": 0, "recall": 0},
                    total_attempts=0,
                    correct_count=0,
                    accuracy_pct=0.0,
                    correct_streak=0,
                )
            )

    if to_create:
        TopicProfile.objects.bulk_create(to_create)


class SetExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        exam_target = str((request.data or {}).get("exam_target", "")).strip()
        weak_subjects = request.data.get("weak_subjects") if isinstance(request.data, dict) else None
        choices = {choice[0] for choice in EXAM_TARGET_CHOICES}
        if exam_target not in choices:
            return Response({"detail": "invalid_exam_target"}, status=status.HTTP_400_BAD_REQUEST)

        request.user.exam_target = exam_target
        request.user.save(update_fields=["exam_target"])
        _ensure_topic_profiles_for_exam(request.user, exam_target, weak_subjects=weak_subjects)

        profile_count = TopicProfile.objects.filter(
            user=request.user,
            exam_target=exam_target,
        ).count()
        return Response(
            {
                "message": "exam_target_set",
                "exam_target": exam_target,
                "topic_profiles": profile_count,
            },
            status=status.HTTP_200_OK,
        )


class TopicGraphView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        exam_target = request.user.exam_target
        _ensure_topic_profiles_for_exam(request.user, exam_target)

        profiles = TopicProfile.objects.filter(user=request.user, exam_target=exam_target)
        profile_by_topic = {profile.topic_name: profile for profile in profiles}

        graph = build_topic_graph(exam_target)
        unlocked = get_topic_unlock_status(graph, profile_by_topic)
        vertical_graph = build_vertical_plan_graph(exam_target, profile_by_topic)

        enriched = []
        for node in unlocked:
            profile = profile_by_topic.get(node["name"])
            enriched.append(
                {
                    **node,
                    "attempts": int(profile.total_attempts) if profile else 0,
                    "accuracy_pct": float(profile.accuracy_pct) if profile else 0.0,
                }
            )

        return Response(
            {
                "exam_target": exam_target,
                "nodes": enriched,
                "vertical_graph": vertical_graph,
            },
            status=status.HTTP_200_OK,
        )


class DnaSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profiles = TopicProfile.objects.filter(user=request.user, exam_target=request.user.exam_target)
        counts = _build_failure_counts(profiles)
        dominant = get_dominant_weakness(dict(counts))
        return Response(
            {
                "counts": dict(counts),
                "dominant_failure_type": dominant,
                "insight": get_dna_insight(dominant),
            },
            status=status.HTTP_200_OK,
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        _ensure_topic_profiles_for_exam(user, user.exam_target)
        profiles = list(TopicProfile.objects.filter(user=user, exam_target=user.exam_target))
        today = timezone.localdate()
        week_start = _week_start_for_date(today)

        readiness = compute_readiness(
            [
                {"ability_score": profile.ability_score, "total_attempts": profile.total_attempts}
                for profile in profiles
            ]
        )
        days_left = 0
        if user.plan_expiry:
            days_left = max(0, (user.plan_expiry.date() - today).days)

        weak_topics = sorted(profiles, key=lambda profile: profile.ability_score)[:8]
        weak_topic_rows = [
            {
                "topic": profile.topic_name,
                "subject": profile.subject,
                "ability_score": round(float(profile.ability_score), 4),
                "stars": int(profile.stars),
                "attempts": int(profile.total_attempts),
                "accuracy_pct": round(float(profile.accuracy_pct), 2),
            }
            for profile in weak_topics
        ]

        sessions = QuizSession.objects.filter(user=user).order_by("-started_at")[:5]
        has_completed_quiz = QuizSession.objects.filter(user=user, completed_at__isnull=False).exists()
        session_rows = [
            {
                "id": str(session.id),
                "session_type": session.session_type,
                "started_at": session.started_at,
                "completed_at": session.completed_at,
                "score_pct": session.score_pct,
                "xp_earned": session.xp_earned,
                "questions_count": len(session.questions or []),
            }
            for session in sessions
        ]

        daily_accuracy = []
        date_cursor = today - timedelta(days=6)
        while date_cursor <= today:
            avg_score = (
                QuizSession.objects.filter(
                    user=user,
                    completed_at__date=date_cursor,
                ).aggregate(value=Avg("score_pct"))["value"]
                or 0.0
            )
            daily_accuracy.append(
                {
                    "date": date_cursor.isoformat(),
                    "accuracy_pct": round(float(avg_score), 2),
                }
            )
            date_cursor += timedelta(days=1)

        week_answers = SessionAnswer.objects.filter(
            session__user=user,
            answered_at__date__gte=week_start,
            answered_at__date__lte=today,
        )
        week_counts = Counter(week_answers.values_list("failure_type", flat=True))
        failure_dna_week = {
            "conceptual": week_counts.get("conceptual", 0),
            "silly": week_counts.get("silly", 0),
            "time": week_counts.get("time", 0),
            "recall": week_counts.get("recall", 0),
            "correct": week_counts.get("correct", 0),
        }

        leaderboard_entries = (
            LeaderboardEntry.objects.filter(exam_target=user.exam_target, week_start=week_start)
            .select_related("user")
            .order_by("rank", "-xp_this_week")[:5]
        )
        leaderboard_rows = [
            {
                "rank": int(entry.rank),
                "name": entry.user.full_name,
                "xp_this_week": int(entry.xp_this_week),
                "is_you": entry.user_id == user.id,
            }
            for entry in leaderboard_entries
        ]

        return Response(
            {
                "exam_target": user.exam_target,
                "plan": user.plan,
                "credits_remaining": int(user.credits_remaining),
                "onboarding_completed": bool(user.onboarding_completed),
                "readiness_pct": readiness,
                "days_left": days_left,
                "streak": int(user.streak),
                "level": int(user.level),
                "xp": int(user.xp),
                "weak_topics": weak_topic_rows,
                "accuracy_7d": daily_accuracy,
                "failure_dna_week": failure_dna_week,
                "leaderboard_top5": leaderboard_rows,
                "recent_sessions": session_rows,
                "has_completed_quiz": has_completed_quiz,
                "requires_premium_initial_quiz": bool(user.plan == "premium" and not has_completed_quiz),
            },
            status=status.HTTP_200_OK,
        )


class DailyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.plan != "premium":
            return Response({"detail": "premium_required"}, status=status.HTTP_403_FORBIDDEN)

        profiles = list(TopicProfile.objects.filter(user=user, exam_target=user.exam_target))
        now = timezone.now()

        # Due topics: next_review <= now, sorted weakest first
        due = sorted(
            [p for p in profiles if p.next_review and p.next_review <= now],
            key=lambda p: p.ability_score,
        )
        not_due = sorted(
            [p for p in profiles if not p.next_review or p.next_review > now],
            key=lambda p: p.ability_score,
        )

        today_topics = [p.topic_name for p in due[:3]] + [p.topic_name for p in not_due[:2]]
        today_topics = today_topics[:4]  # cap at 4 topics for today

        weak_subjects = {}
        for p in sorted(profiles, key=lambda x: x.ability_score):
            if p.subject not in weak_subjects:
                weak_subjects[p.subject] = p.ability_score
        priority_subjects = sorted(weak_subjects, key=lambda s: weak_subjects[s])[:3]

        weekly = []
        pool = (due + not_due)[:21]
        for day in range(1, 8):
            day_slice = pool[(day - 1) * 3 : day * 3]
            weekly.append({
                "day": day,
                "topics": [p.topic_name for p in day_slice],
                "type": "review" if any(p.next_review and p.next_review <= now for p in day_slice) else "practice",
                "estimated_minutes": len(day_slice) * 20,
            })

        return Response(
            {
                "today": {
                    "topics": today_topics,
                    "quiz_count": min(len(today_topics), 4),
                    "estimated_minutes": len(today_topics) * 20,
                },
                "weekly_overview": weekly,
                "focus_area": priority_subjects[0] if priority_subjects else "",
                "priority_subjects": priority_subjects,
            },
            status=status.HTTP_200_OK,
        )