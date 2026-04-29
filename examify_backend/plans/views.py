import calendar
import math
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .credit_engine import (
    FREE_PLAN,
    PREMIUM_PLAN_OPTIONS,
    PRO_PLAN_OPTIONS,
    get_daily_quiz_count,
    get_plan_daily_limit,
)
from .models import PlanTransaction


def _add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + (month_index // 12)
    month = (month_index % 12) + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def _build_pricing_response():
    return {
        "plans": [
            {
                "name": "free",
                "duration": f"{FREE_PLAN['duration_days']} days",
                "price": 0,
                "credits": FREE_PLAN["credits"],
                "daily_limit": FREE_PLAN["daily_limit"],
            },
            {
                "name": "pro",
                "options": [
                    {
                        "duration_months": duration,
                        "price_inr": PRO_PLAN_OPTIONS[duration]["price_inr"],
                        "credits": PRO_PLAN_OPTIONS[duration]["credits"],
                    }
                    for duration in (1, 3, 6)
                ],
            },
            {
                "name": "premium",
                "options": [
                    {
                        "duration_months": duration,
                        "price_inr": PREMIUM_PLAN_OPTIONS[duration]["price_inr"],
                        "credits": PREMIUM_PLAN_OPTIONS[duration]["credits"],
                    }
                    for duration in (1, 3, 6)
                ],
            },
        ]
    }


class PlanPricingView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(_build_pricing_response(), status=status.HTTP_200_OK)


class PlanActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data or {}
        plan = str(data.get("plan") or "").strip().lower()
        duration_months = data.get("duration_months")
        payment_id = data.get("payment_id")

        if plan not in {"pro", "premium"}:
            return Response(
                {"detail": "Plan must be 'pro' or 'premium'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            duration_months = int(duration_months)
        except (TypeError, ValueError):
            return Response(
                {"detail": "duration_months must be 1, 3, or 6."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(payment_id, str) or not payment_id.strip():
            return Response(
                {"detail": "payment_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        options = PRO_PLAN_OPTIONS if plan == "pro" else PREMIUM_PLAN_OPTIONS
        option = options.get(duration_months)
        if option is None:
            return Response(
                {"detail": "duration_months must be 1, 3, or 6."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        expires_at = _add_months(now, duration_months)

        credits = option["credits"]
        amount_paid = Decimal(str(option["price_inr"]))

        PlanTransaction.objects.create(
            user=request.user,
            plan=plan,
            duration_months=duration_months,
            credits_granted=credits,
            amount_paid=amount_paid,
            payment_id=payment_id.strip(),
            started_at=now,
            expires_at=expires_at,
        )

        request.user.plan = plan
        request.user.plan_expiry = expires_at
        request.user.credits_remaining = credits
        request.user.save(update_fields=["plan", "plan_expiry", "credits_remaining"])

        return Response(
            {
                "message": "Plan activated",
                "credits": credits,
                "expires_at": expires_at,
            },
            status=status.HTTP_200_OK,
        )


class PlanStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        expires_at = user.plan_expiry
        if expires_at:
            seconds_left = (expires_at - timezone.now()).total_seconds()
            days_left = max(0, math.ceil(seconds_left / 86400))
        else:
            days_left = 0

        daily_used_today = get_daily_quiz_count(user)
        daily_limit = get_plan_daily_limit(user.plan)

        return Response(
            {
                "plan": user.plan,
                "credits_remaining": user.credits_remaining,
                "expires_at": expires_at,
                "days_left": days_left,
                "daily_used_today": daily_used_today,
                "daily_limit": daily_limit,
            },
            status=status.HTTP_200_OK,
        )
