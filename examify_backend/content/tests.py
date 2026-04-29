import tempfile
from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test.utils import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from users.models import EXAM_TARGET_CHOICES, ExamifyUser

from .models import UploadedContent


def _build_pdf_bytes(text):
	escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
	content_stream = f"BT\n/F1 24 Tf\n72 120 Td\n({escaped}) Tj\nET"

	objects = [
		"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
		"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
		"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R "
		"/Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
		"4 0 obj\n"
		f"<< /Length {len(content_stream.encode('ascii'))} >>\n"
		"stream\n"
		f"{content_stream}\n"
		"endstream\n"
		"endobj\n",
		"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
	]

	header = "%PDF-1.4\n"
	offsets = []
	current = len(header.encode("ascii"))
	for obj in objects:
		offsets.append(current)
		current += len(obj.encode("ascii"))

	xref_start = current
	xref_lines = [
		"xref\n",
		f"0 {len(objects) + 1}\n",
		"0000000000 65535 f \n",
	]
	for offset in offsets:
		xref_lines.append(f"{offset:010d} 00000 n \n")

	trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
	startxref = f"startxref\n{xref_start}\n%%EOF\n"

	pdf = header + "".join(objects) + "".join(xref_lines) + trailer + startxref
	return pdf.encode("ascii")


class ContentUploadTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = ExamifyUser.objects.create(
			clerk_id="clerk_test",
			email="test@example.com",
			full_name="Test User",
			exam_target=EXAM_TARGET_CHOICES[0][0],
			plan="free",
			plan_expiry=timezone.now() + timedelta(days=7),
			credits_remaining=3,
		)
		self.client.force_authenticate(user=self.user)

	def test_upload_pdf_extracts_text(self):
		with tempfile.TemporaryDirectory() as temp_dir:
			with override_settings(MEDIA_ROOT=temp_dir):
				pdf_bytes = _build_pdf_bytes("Hello EXAMIFY")
				upload = SimpleUploadedFile(
					"sample.pdf",
					pdf_bytes,
					content_type="application/pdf",
				)

				response = self.client.post(
					"/api/content/upload/",
					{"content_type": "pdf", "file": upload},
					format="multipart",
				)

				self.assertEqual(response.status_code, status.HTTP_201_CREATED)
				content_id = int(response.data["content_id"])
				content = UploadedContent.objects.get(id=content_id)
				self.assertTrue(content.extracted_text)
				self.assertIn("Hello EXAMIFY", content.extracted_text)
