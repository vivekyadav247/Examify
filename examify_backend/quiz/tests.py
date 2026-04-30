from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from uuid import uuid4

from analytics.models import PremiumPlanSnapshot
from users.models import ExamifyUser

from .models import Question, QuizSession, SessionAnswer


class QuizFeatureTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _create_user(self, plan="free"):
        marker = uuid4().hex[:8]
        return ExamifyUser.objects.create(
            clerk_id=f"clerk_{plan}_user_{marker}",
            email=f"{plan}_{marker}@example.com",
            password="hashed",
            full_name=f"{plan.title()} User",
            exam_target="JEE_Mains",
            plan=plan,
        )

    def _create_question(self, topic, correct_answer=1):
        return Question.objects.create(
            exam_target="JEE_Mains",
            subject="Physics",
            topic=topic,
            subtopic="Basics",
            difficulty=0.5,
            q_type="MCQ",
            question_text=f"Question on {topic}?",
            options=["A", "B", "C", "D"],
            correct_answer=correct_answer,
            explanation="Because of core concept.",
            source_type="ai_generated",
        )

    def test_overall_dna_profile_report_aggregates_completed_quizzes(self):
        user = self._create_user(plan="free")
        self.client.force_authenticate(user=user)

        mechanics_question = self._create_question("Mechanics", correct_answer=1)
        optics_question = self._create_question("Optics", correct_answer=2)

        session_one = QuizSession.objects.create(
            user=user,
            session_type="free_quiz",
            exam_target=user.exam_target,
            questions=[str(mechanics_question.id), str(optics_question.id)],
            completed_at=timezone.now(),
            score_pct=50.0,
            xp_earned=3,
        )
        session_two = QuizSession.objects.create(
            user=user,
            session_type="topic_practice",
            exam_target=user.exam_target,
            questions=[str(mechanics_question.id)],
            completed_at=timezone.now(),
            score_pct=0.0,
            xp_earned=-1,
        )

        SessionAnswer.objects.create(
            session=session_one,
            question=mechanics_question,
            selected_option=1,
            is_correct=True,
            response_time=22.0,
            failure_type="correct",
            xp_delta=4,
        )
        SessionAnswer.objects.create(
            session=session_one,
            question=optics_question,
            selected_option=0,
            is_correct=False,
            response_time=48.0,
            failure_type="conceptual",
            xp_delta=-1,
        )
        SessionAnswer.objects.create(
            session=session_two,
            question=mechanics_question,
            selected_option=0,
            is_correct=False,
            response_time=28.0,
            failure_type="silly",
            xp_delta=-1,
        )

        response = self.client.get("/api/quiz/dna/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        payload = response.json()
        self.assertEqual(payload["sessions_count"], 2)
        self.assertEqual(payload["overall_summary"]["total_questions"], 3)
        self.assertEqual(payload["overall_summary"]["correct"], 1)
        self.assertEqual(payload["overall_summary"]["wrong"], 2)
        self.assertEqual(payload["dna_breakdown"]["conceptual"], 1)
        self.assertEqual(payload["dna_breakdown"]["silly"], 1)
        self.assertEqual(payload["dna_breakdown"]["time"], 0)
        self.assertEqual(payload["dna_breakdown"]["recall"], 0)
        self.assertIn("simple_summary", payload)

    def test_completing_premium_session_marks_plan_snapshot_stale(self):
        user = self._create_user(plan="premium")
        self.client.force_authenticate(user=user)

        PremiumPlanSnapshot.objects.create(
            user=user,
            exam_target=user.exam_target,
            status="fresh",
            source_completed_sessions=0,
            source_answers_count=0,
            plan_payload={"plan_title": "Existing"},
            generated_at=timezone.now(),
        )

        question = self._create_question("Thermodynamics", correct_answer=2)
        session = QuizSession.objects.create(
            user=user,
            session_type="free_quiz",
            exam_target=user.exam_target,
            questions=[str(question.id)],
        )
        SessionAnswer.objects.create(
            session=session,
            question=question,
            selected_option=0,
            is_correct=False,
            response_time=41.0,
            failure_type="time",
            xp_delta=-1,
        )

        response = self.client.post(f"/api/quiz/session/{session.id}/complete/", data={})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        snapshot = PremiumPlanSnapshot.objects.get(user=user, exam_target=user.exam_target)
        self.assertEqual(snapshot.status, "stale")
        self.assertEqual(snapshot.source_completed_sessions, 1)
        self.assertEqual(snapshot.source_answers_count, 1)
