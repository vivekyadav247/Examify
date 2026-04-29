from rest_framework import serializers

from .models import Question, QuizSession, SessionAnswer


class QuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            "id",
            "exam_target",
            "subject",
            "topic",
            "difficulty",
            "q_type",
            "question_text",
            "options",
            "source_type",
        )


class QuizStartResponseSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    session_type = serializers.CharField()
    total_questions = serializers.IntegerField()
    questions = QuestionPublicSerializer(many=True)


class QuizAnswerSubmitSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    question_id = serializers.UUIDField()
    selected_option = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=0,
        max_value=3,
    )
    response_time = serializers.FloatField(min_value=0.0, required=False, default=60.0)


class SessionAnswerDetailSerializer(serializers.ModelSerializer):
    question_id = serializers.UUIDField(source="question.id")
    question_text = serializers.CharField(source="question.question_text")
    topic = serializers.CharField(source="question.topic")
    subject = serializers.CharField(source="question.subject")
    difficulty = serializers.FloatField(source="question.difficulty")

    class Meta:
        model = SessionAnswer
        fields = (
            "question_id",
            "question_text",
            "topic",
            "subject",
            "difficulty",
            "selected_option",
            "is_correct",
            "response_time",
            "failure_type",
            "xp_delta",
            "answered_at",
        )


class QuizSessionDetailSerializer(serializers.ModelSerializer):
    answers = SessionAnswerDetailSerializer(many=True, read_only=True)

    class Meta:
        model = QuizSession
        fields = (
            "id",
            "session_type",
            "exam_target",
            "questions",
            "started_at",
            "completed_at",
            "score_pct",
            "xp_earned",
            "answers",
        )
