from django.db import models

from users.models import EXAM_TARGET_CHOICES, ExamifyUser


class PremiumPlanSnapshot(models.Model):
    STATUS_CHOICES = [
        ("fresh", "Fresh"),
        ("stale", "Stale"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="premium_plan_snapshots",
    )
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="stale")
    generated_at = models.DateTimeField(null=True, blank=True)
    source_completed_sessions = models.PositiveIntegerField(default=0)
    source_answers_count = models.PositiveIntegerField(default=0)
    plan_payload = models.JSONField(default=dict)
    last_error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "exam_target"],
                name="uniq_premium_plan_snapshot_user_exam",
            )
        ]
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.user.full_name} - {self.exam_target} ({self.status})"
