import uuid

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from users.models import EXAM_TARGET_CHOICES, ExamifyUser


def validate_four_options(value):
    if not isinstance(value, list) or len(value) != 4:
        raise ValidationError("options must be a JSON array containing exactly 4 strings.")
    if not all(isinstance(item, str) for item in value):
        raise ValidationError("each option must be a string.")


class Question(models.Model):
    Q_TYPE_CHOICES = [
        ("MCQ", "MCQ"),
        ("Numerical", "Numerical"),
        ("Assertion", "Assertion"),
        ("Match", "Match"),
    ]
    SOURCE_TYPE_CHOICES = [
        ("ai_generated", "AI Generated"),
        ("content_extracted", "Content Extracted"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=150)
    subtopic = models.CharField(max_length=150, null=True, blank=True)
    difficulty = models.FloatField(
        validators=[MinValueValidator(0.1), MaxValueValidator(1.0)]
    )
    q_type = models.CharField(max_length=16, choices=Q_TYPE_CHOICES)
    question_text = models.TextField()
    options = models.JSONField(validators=[validate_four_options])
    correct_answer = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(3)]
    )
    explanation = models.TextField()
    source_type = models.CharField(max_length=24, choices=SOURCE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.subject} / {self.topic} ({self.id})"


class QuizSession(models.Model):
    SESSION_TYPE_CHOICES = [
        ("free_quiz", "Free Quiz"),
        ("daily_plan", "Daily Plan"),
        ("diagnostic", "Diagnostic"),
        ("topic_practice", "Topic Practice"),
        ("content_quiz", "Content Quiz"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="quiz_sessions",
    )
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    questions = models.JSONField(default=list)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score_pct = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
    )
    xp_earned = models.IntegerField(default=0)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.user.full_name} - {self.session_type} ({self.id})"


class SessionAnswer(models.Model):
    FAILURE_TYPE_CHOICES = [
        ("conceptual", "Conceptual"),
        ("silly", "Silly"),
        ("time", "Time"),
        ("recall", "Recall"),
        ("correct", "Correct"),
    ]

    session = models.ForeignKey(
        QuizSession,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="session_answers",
    )
    selected_option = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(3)],
    )
    is_correct = models.BooleanField()
    response_time = models.FloatField(validators=[MinValueValidator(0.0)])
    failure_type = models.CharField(max_length=16, choices=FAILURE_TYPE_CHOICES)
    xp_delta = models.IntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session", "question"],
                name="uniq_session_question_answer",
            )
        ]
        ordering = ["answered_at"]

    def __str__(self) -> str:
        return f"{self.session_id} - {self.question_id}"
