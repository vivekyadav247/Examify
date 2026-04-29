from django.db import models


EXAM_TARGET_CHOICES = [
    ("JEE_Mains", "JEE_Mains"),
    ("JEE_Advanced", "JEE_Advanced"),
    ("NEET", "NEET"),
    ("UPSC_CSE", "UPSC_CSE"),
    ("UPSC_IFS", "UPSC_IFS"),
    ("GATE", "GATE"),
    ("CAT", "CAT"),
    ("XAT", "XAT"),
    ("MAT", "MAT"),
    ("GMAT", "GMAT"),
    ("GRE", "GRE"),
    ("SAT", "SAT"),
    ("ACT", "ACT"),
    ("LSAT", "LSAT"),
    ("MCAT", "MCAT"),
    ("IELTS", "IELTS"),
    ("TOEFL", "TOEFL"),
    ("CFA_L1", "CFA_L1"),
    ("CFA_L2", "CFA_L2"),
    ("CFA_L3", "CFA_L3"),
    ("CA_Foundation", "CA_Foundation"),
    ("CA_Intermediate", "CA_Intermediate"),
    ("CA_Final", "CA_Final"),
    ("SSC_CGL", "SSC_CGL"),
    ("SSC_CHSL", "SSC_CHSL"),
    ("NDA", "NDA"),
    ("CDS", "CDS"),
    ("CLAT", "CLAT"),
    ("AILET", "AILET"),
    ("CUET", "CUET"),
    ("SNAP", "SNAP"),
    ("IIFT", "IIFT"),
    ("CMAT", "CMAT"),
    ("NMAT", "NMAT"),
    ("BAR_EXAM_US", "BAR_EXAM_US"),
    ("BAR_EXAM_UK", "BAR_EXAM_UK"),
    ("ACCA", "ACCA"),
    ("CPA_US", "CPA_US"),
]

PLAN_CHOICES = [
    ("free", "Free"),
    ("pro", "Pro"),
    ("premium", "Premium"),
]


class ExamifyUser(models.Model):
    clerk_id = models.CharField(max_length=128, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default="free")
    plan_expiry = models.DateTimeField(null=True, blank=True)
    credits_remaining = models.IntegerField(
        default=30,
        help_text="free=30 (3 quizzes × 10), pro=1500, premium=unlimited (-1)",
    )
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak = models.IntegerField(default=0)
    last_active = models.DateField(null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.email})"

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False


class TopicProfile(models.Model):
    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="topic_profiles",
    )
    topic_name = models.CharField(max_length=150)
    subject = models.CharField(max_length=100)
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    ability_score = models.FloatField(default=0.5)
    stars = models.IntegerField(default=0)
    is_unlocked = models.BooleanField(default=False)
    is_flagged_complete = models.BooleanField(default=False)
    failure_dna = models.JSONField(default=dict)
    total_attempts = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    accuracy_pct = models.FloatField(default=0.0)
    next_review = models.DateTimeField(null=True, blank=True)
    correct_streak = models.IntegerField(default=0)
    graph_position_x = models.IntegerField(default=0)
    graph_position_y = models.IntegerField(default=0)
    prerequisite_topics = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "topic_name", "exam_target"],
                name="uniq_user_topic_exam_target",
            )
        ]
        ordering = ["subject", "topic_name"]

    def __str__(self) -> str:
        return f"{self.user.full_name} - {self.topic_name}"


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(
        ExamifyUser,
        on_delete=models.CASCADE,
        related_name="leaderboard_entries",
    )
    exam_target = models.CharField(max_length=32, choices=EXAM_TARGET_CHOICES)
    rank = models.IntegerField(default=0)
    xp_this_week = models.IntegerField(default=0)
    xp_all_time = models.IntegerField(default=0)
    week_start = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "exam_target", "week_start"],
                name="uniq_user_exam_week_start",
            )
        ]
        ordering = ["rank", "-xp_this_week"]

    def __str__(self) -> str:
        return f"{self.exam_target} - {self.user.full_name} (Rank {self.rank})"
