from django.db import models

from users.models import ExamifyUser


class UploadedContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ("pdf", "PDF"),
        ("docx", "DOCX"),
        ("ppt", "PPT"),
        ("video", "Video"),
        ("topic_manual", "Topic Manual"),
    ]
    PROCESSING_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("done", "Done"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="uploaded_contents",
    )
    content_type = models.CharField(max_length=16, choices=CONTENT_TYPE_CHOICES)
    file_url = models.URLField(null=True, blank=True)
    topic_name = models.CharField(max_length=150, null=True, blank=True)
    subtopics = models.JSONField(default=list)
    extracted_text = models.TextField(null=True, blank=True)
    processing_status = models.CharField(
        max_length=16,
        choices=PROCESSING_STATUS_CHOICES,
        default="pending",
    )
    questions_generated = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:
        return f"{self.content_type} - {self.user.full_name}"
