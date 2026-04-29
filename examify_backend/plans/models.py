from django.db import models

from users.models import ExamifyUser


class PlanTransaction(models.Model):
    PLAN_CHOICES = [
        ("pro", "Pro"),
        ("premium", "Premium"),
    ]
    DURATION_CHOICES = [
        (1, "1"),
        (3, "3"),
        (6, "6"),
    ]

    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="plan_transactions",
    )
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES)
    duration_months = models.PositiveSmallIntegerField(choices=DURATION_CHOICES)
    credits_granted = models.IntegerField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=128)
    started_at = models.DateTimeField()
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.user.full_name} - {self.plan} ({self.duration_months}m)"
