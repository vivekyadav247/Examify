import os
from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .extractors import (
	extract_from_docx,
	extract_from_pdf,
	extract_from_pptx,
	extract_from_topic,
	extract_from_video_url,
)
from .models import UploadedContent
from .serializers import ContentListSerializer, ContentUploadSerializer


def _plan_allows_upload(user):
	if user.plan_expiry and timezone.now() > user.plan_expiry:
		if user.plan == "free":
			return False, "free_expired"
		return False, "plan_expired"
	return True, "ok"


def _extract_text(content_type, file_path, topic_name, subtopics, video_url):
	if content_type == "pdf":
		return extract_from_pdf(file_path)
	if content_type == "docx":
		return extract_from_docx(file_path)
	if content_type == "ppt":
		return extract_from_pptx(file_path)
	if content_type == "video":
		return extract_from_video_url(video_url)
	if content_type == "topic_manual":
		return extract_from_topic(topic_name, subtopics)
	return ""


def _is_supported_public_video_url(url):
	if not url:
		return False
	try:
		parsed = urlparse(url)
		if parsed.scheme not in {"http", "https"}:
			return False
		host = (parsed.netloc or "").lower()
		return any(
			domain in host
			for domain in ("youtube.com", "youtu.be", "vimeo.com")
		)
	except Exception:
		return False


def _resolve_file_path(file_url):
	if not file_url:
		return None

	media_url = settings.MEDIA_URL or "/media/"
	parsed = urlparse(file_url)
	path = parsed.path if parsed.scheme else file_url

	if path.startswith(media_url):
		relative_path = path[len(media_url) :]
	else:
		relative_path = path.lstrip("/")

	if not relative_path:
		return None
	return os.path.join(settings.MEDIA_ROOT, relative_path)


class ContentUploadView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = ContentUploadSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		allowed, reason = _plan_allows_upload(request.user)
		if not allowed:
			return Response(
				{"detail": reason},
				status=status.HTTP_403_FORBIDDEN,
			)

		data = serializer.validated_data
		content_type = data["content_type"]
		file_obj = data.get("file")
		topic_name = data.get("topic_name")
		subtopics = data.get("subtopics") or []
		video_url = data.get("video_url")

		storage = FileSystemStorage(location=settings.MEDIA_ROOT)
		file_url = None
		file_path = None

		if content_type in {"pdf", "docx", "ppt"} and file_obj:
			relative_path = os.path.join("uploads", str(request.user.id), file_obj.name)
			saved_path = storage.save(relative_path, file_obj)
			file_url = storage.url(saved_path)
			file_path = storage.path(saved_path)

		if content_type == "video" and video_url:
			if not _is_supported_public_video_url(video_url):
				return Response(
					{"detail": "unsupported_video_url", "message": "Use a public YouTube/Vimeo URL."},
					status=status.HTTP_400_BAD_REQUEST,
				)
			file_url = video_url

		uploaded_content = UploadedContent.objects.create(
			user=request.user,
			content_type=content_type,
			file_url=file_url,
			topic_name=topic_name,
			subtopics=subtopics,
			processing_status="pending",
		)

		try:
			uploaded_content.processing_status = "processing"
			uploaded_content.save(update_fields=["processing_status"])

			extracted_text = _extract_text(
				content_type,
				file_path,
				topic_name,
				subtopics,
				video_url,
			)
			uploaded_content.extracted_text = extracted_text
			uploaded_content.processing_status = "done"
			uploaded_content.save(update_fields=["extracted_text", "processing_status"])
			extracted_chars = len(extracted_text or "")
		except Exception:
			uploaded_content.processing_status = "failed"
			uploaded_content.save(update_fields=["processing_status"])
			return Response(
				{"detail": "Content extraction failed."},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

		return Response(
			{
				"content_id": str(uploaded_content.id),
				"status": "done",
				"extracted_chars": extracted_chars,
			},
			status=status.HTTP_201_CREATED,
		)


class ContentListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		contents = UploadedContent.objects.filter(user=request.user)
		serializer = ContentListSerializer(contents, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class ContentDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, content_id, *args, **kwargs):
		content = UploadedContent.objects.filter(id=content_id, user=request.user).first()
		if not content:
			return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

		file_path = _resolve_file_path(content.file_url)
		if file_path and os.path.exists(file_path):
			try:
				os.remove(file_path)
			except OSError:
				pass

		content.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)