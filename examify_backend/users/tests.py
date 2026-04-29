from unittest.mock import patch

from django.test import TestCase
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.test import APIRequestFactory

from users.authentication import (
    DEV_USER_CLERK_ID,
    DEV_USER_EMAIL,
    DEV_USER_NAME,
    ClerkAuthentication,
)
from users.models import EXAM_TARGET_CHOICES, ExamifyUser


class ClerkAuthenticationTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def _request(self, token="test_token"):
        return self.factory.get("/api/quiz/start/", HTTP_AUTHORIZATION=f"Bearer {token}")

    @patch("users.authentication._fetch_clerk_user_profile", return_value={})
    @patch.object(
        ClerkAuthentication,
        "_verify_token",
        return_value={"sub": "user_existing", "iss": "https://example.clerk.accounts.dev"},
    )
    def test_reuses_existing_email_when_token_has_no_email(self, _verify_token, _fetch_profile):
        existing_user = ExamifyUser.objects.create(
            clerk_id="user_existing",
            email="real.user@example.com",
            full_name="Real User",
            exam_target=EXAM_TARGET_CHOICES[0][0],
        )

        request = self._request("token_without_email_claim")
        user, auth = ClerkAuthentication().authenticate(request)

        self.assertEqual(user.id, existing_user.id)
        self.assertEqual(user.email, "real.user@example.com")
        self.assertEqual(auth, "token_without_email_claim")

    @patch("users.authentication._fetch_clerk_user_profile", return_value={})
    @patch.object(
        ClerkAuthentication,
        "_verify_token",
        return_value={"sub": "user_new", "iss": "https://example.clerk.accounts.dev"},
    )
    def test_creates_placeholder_email_when_clerk_email_unavailable(self, _verify_token, _fetch_profile):
        request = self._request("token_without_profile_email")
        user, auth = ClerkAuthentication().authenticate(request)

        self.assertEqual(user.clerk_id, "user_new")
        self.assertEqual(user.email, "user_new@users.clerk.invalid")
        self.assertEqual(auth, "token_without_profile_email")

    @patch("users.authentication.DEV_AUTH_BYPASS", True)
    @patch.object(ClerkAuthentication, "_verify_token", side_effect=AuthenticationFailed("bad_token"))
    def test_invalid_token_rejected_even_when_dev_bypass_enabled(self, _verify_token):
        request = self._request("bad_token")
        with self.assertRaises(AuthenticationFailed):
            ClerkAuthentication().authenticate(request)

    @patch("users.authentication.DEV_AUTH_BYPASS", True)
    def test_dev_bypass_only_applies_when_no_auth_header(self):
        request = self.factory.get("/api/quiz/start/")
        user, auth = ClerkAuthentication().authenticate(request)

        self.assertEqual(auth, "dev-bypass")
        self.assertEqual(user.clerk_id, DEV_USER_CLERK_ID)
        self.assertEqual(user.email, DEV_USER_EMAIL)
        self.assertEqual(user.full_name, DEV_USER_NAME)

    @patch("users.authentication.DEV_AUTH_BYPASS", False)
    @patch.object(ClerkAuthentication, "_verify_token", side_effect=AuthenticationFailed("bad_token"))
    def test_invalid_token_rejected_when_dev_bypass_disabled(self, _verify_token):
        request = self._request("bad_token")
        with self.assertRaises(AuthenticationFailed):
            ClerkAuthentication().authenticate(request)
