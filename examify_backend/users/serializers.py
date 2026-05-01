from django.utils import timezone
from rest_framework import serializers

from .models import EXAM_TARGET_CHOICES, ExamifyUser


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamifyUser
        fields = [
            "id",
            "email",
            "full_name",
            "exam_target",
            "language",
            "plan",
            "credits_remaining",
            "xp",
            "level",
            "streak",
            "onboarding_completed",
            "onboarding_completed_at",
        ]


class UpdateUserSerializer(serializers.Serializer):
    exam_target = serializers.ChoiceField(choices=EXAM_TARGET_CHOICES, required=False)
    language = serializers.CharField(required=False)
    avatar_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    onboarding_completed = serializers.BooleanField(required=False)

    def update(self, instance: ExamifyUser, validated_data):
        if not validated_data:
            return instance

        update_fields = []
        for field in ("exam_target", "avatar_url", "language"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
                update_fields.append(field)

        onboarding_value = validated_data.get("onboarding_completed")
        if onboarding_value is not None:
            instance.onboarding_completed = bool(onboarding_value)
            update_fields.append("onboarding_completed")
            if onboarding_value and not instance.onboarding_completed_at:
                instance.onboarding_completed_at = timezone.now()
                update_fields.append("onboarding_completed_at")
            if not onboarding_value and instance.onboarding_completed_at:
                instance.onboarding_completed_at = None
                update_fields.append("onboarding_completed_at")

        if update_fields:
            instance.save(update_fields=list(dict.fromkeys(update_fields)))
        return instance

    def create(self, validated_data):
        raise NotImplementedError("Creation is not supported in this serializer.")
