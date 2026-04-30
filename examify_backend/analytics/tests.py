from uuid import uuid4

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from quiz.models import Question, QuizSession, SessionAnswer
from users.models import ExamifyUser, TopicProfile

from .models import PremiumPlanSnapshot


class PremiumPlanEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _create_user(self, plan="free"):
        marker = uuid4().hex[:8]
        return ExamifyUser.objects.create(
            clerk_id=f"clerk_{plan}_{marker}",
            email=f"{plan}_{marker}@example.com",
            password="hashed",
            full_name=f"{plan.title()} Learner",
            exam_target="JEE_Mains",
            plan=plan,
        )

    def _create_question(self, topic):
        return Question.objects.create(
            exam_target="JEE_Mains",
            subject="Physics",
            topic=topic,
            subtopic="Concepts",
            difficulty=0.55,
            q_type="MCQ",
            question_text=f"How does {topic} work?",
            options=["A", "B", "C", "D"],
            correct_answer=1,
            explanation="Step through the concept.",
            source_type="ai_generated",
        )

    def test_premium_plan_endpoint_requires_premium(self):
        user = self._create_user(plan="free")
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/analytics/premium-plan/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json().get("detail"), "premium_required")

    def test_premium_plan_endpoint_generates_and_persists_plan(self):
        user = self._create_user(plan="premium")
        self.client.force_authenticate(user=user)

        topic_profile = TopicProfile.objects.create(
            user=user,
            topic_name="Mechanics",
            subject="Physics",
            exam_target=user.exam_target,
            ability_score=0.32,
            stars=0,
            is_unlocked=True,
            failure_dna={"conceptual": 2, "silly": 1, "time": 0, "recall": 0},
            total_attempts=5,
            correct_count=2,
            accuracy_pct=40.0,
            correct_streak=0,
        )
        question = self._create_question(topic_profile.topic_name)

        session = QuizSession.objects.create(
            user=user,
            session_type="free_quiz",
            exam_target=user.exam_target,
            questions=[str(question.id)],
            completed_at=timezone.now(),
            score_pct=0.0,
            xp_earned=-1,
        )
        SessionAnswer.objects.create(
            session=session,
            question=question,
            selected_option=0,
            is_correct=False,
            response_time=50.0,
            failure_type="conceptual",
            xp_delta=-1,
        )

        response = self.client.get("/api/analytics/premium-plan/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertEqual(payload.get("status"), "fresh")
        self.assertEqual(payload.get("source_completed_sessions"), 1)
        self.assertEqual(payload.get("source_answers_count"), 1)
        self.assertTrue((payload.get("plan") or {}).get("today_plan"))

        snapshot = PremiumPlanSnapshot.objects.get(user=user, exam_target=user.exam_target)
        self.assertEqual(snapshot.status, "fresh")
        self.assertEqual(snapshot.source_completed_sessions, 1)
