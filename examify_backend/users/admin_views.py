import calendar
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import ExamifyUser


# Admin emails — add your email here to get admin access
ADMIN_EMAILS = {
    "vivekkk@gmail.ai",
    "demo@examify.ai",
}


def _is_admin(user):
    """Check admin by email list (ExamifyUser has no is_staff/is_superuser)."""
    if not user or not hasattr(user, "email"):
        return False
    return str(user.email).strip().lower() in {e.lower() for e in ADMIN_EMAILS}


def _add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + (month_index // 12)
    month = (month_index % 12) + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not _is_admin(request.user):
            return Response({"detail": "admin_required"}, status=status.HTTP_403_FORBIDDEN)

        users = ExamifyUser.objects.filter(is_active=True).order_by("-created_at")[:100]
        rows = []
        for u in users:
            rows.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "exam_target": u.exam_target,
                "plan": u.plan,
                "plan_expiry": u.plan_expiry,
                "credits_remaining": u.credits_remaining,
                "xp": u.xp,
                "level": u.level,
                "streak": u.streak,
                "onboarding_completed": u.onboarding_completed,
                "created_at": u.created_at,
            })
        return Response({"users": rows}, status=status.HTTP_200_OK)


class AdminUpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not _is_admin(request.user):
            return Response({"detail": "admin_required"}, status=status.HTTP_403_FORBIDDEN)

        data = request.data or {}
        user_id = data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = ExamifyUser.objects.get(id=int(user_id))
        except (ExamifyUser.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "user_not_found"}, status=status.HTTP_404_NOT_FOUND)

        updates = []

        # Plan change
        new_plan = str(data.get("plan", "")).strip().lower()
        if new_plan in {"free", "pro", "premium"}:
            target.plan = new_plan
            updates.append("plan")

            # Set default credits based on plan
            if new_plan == "free":
                target.credits_remaining = 30
                updates.append("credits_remaining")
            elif new_plan == "pro":
                target.credits_remaining = 1500
                updates.append("credits_remaining")
            elif new_plan == "premium":
                target.credits_remaining = -1  # unlimited
                updates.append("credits_remaining")

        # Duration months
        duration = data.get("duration_months")
        if duration is not None:
            try:
                months = int(duration)
                if months in {1, 3, 6}:
                    target.plan_expiry = _add_months(timezone.now(), months)
                    updates.append("plan_expiry")
            except (ValueError, TypeError):
                pass

        # Credits absolute set
        credits = data.get("credits_remaining")
        if credits is not None:
            try:
                target.credits_remaining = int(credits)
                updates.append("credits_remaining")
            except (ValueError, TypeError):
                pass

        # Credits delta (add/subtract)
        credits_delta = data.get("credits_delta")
        if credits_delta is not None:
            try:
                delta = int(credits_delta)
                if delta != 0:
                    if target.credits_remaining == -1:
                        pass  # unlimited stays unlimited
                    else:
                        target.credits_remaining = max(0, target.credits_remaining + delta)
                    updates.append("credits_remaining")
            except (ValueError, TypeError):
                pass

        if updates:
            target.save(update_fields=list(set(updates)))

        return Response({
            "message": "updated",
            "user_id": target.id,
            "plan": target.plan,
            "plan_expiry": target.plan_expiry,
            "credits_remaining": target.credits_remaining,
        }, status=status.HTTP_200_OK)
