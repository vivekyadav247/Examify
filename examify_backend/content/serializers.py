import json

from rest_framework import serializers

from .models import UploadedContent


class ContentUploadSerializer(serializers.Serializer):
	content_type = serializers.ChoiceField(
		choices=[choice[0] for choice in UploadedContent.CONTENT_TYPE_CHOICES]
	)
	file = serializers.FileField(required=False, allow_null=True)
	topic_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	subtopics = serializers.JSONField(required=False)
	video_url = serializers.URLField(required=False, allow_blank=True)

	def validate_subtopics(self, value):
		if value is None:
			return []
		if isinstance(value, str):
			try:
				value = json.loads(value)
			except json.JSONDecodeError as exc:
				raise serializers.ValidationError("subtopics must be a JSON list.") from exc
		if not isinstance(value, list):
			raise serializers.ValidationError("subtopics must be a list.")
		return [str(item).strip() for item in value if str(item).strip()]

	def validate(self, attrs):
		content_type = attrs.get("content_type")
		file_obj = attrs.get("file")
		video_url = (attrs.get("video_url") or "").strip()
		topic_name = (attrs.get("topic_name") or "").strip()

		if content_type in {"pdf", "docx", "ppt"} and not file_obj:
			raise serializers.ValidationError({"file": "File is required."})

		if content_type == "video" and not video_url:
			raise serializers.ValidationError({"video_url": "video_url is required."})

		if content_type == "topic_manual" and not topic_name:
			raise serializers.ValidationError({"topic_name": "topic_name is required."})

		attrs["video_url"] = video_url
		attrs["topic_name"] = topic_name or None
		attrs.setdefault("subtopics", [])
		return attrs


class ContentListSerializer(serializers.ModelSerializer):
	class Meta:
		model = UploadedContent
		fields = (
			"id",
			"content_type",
			"topic_name",
			"processing_status",
			"questions_generated",
			"uploaded_at",
		)
