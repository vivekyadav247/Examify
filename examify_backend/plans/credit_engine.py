from django.utils import timezone

from quiz.models import QuizSession

QUIZ_CREDIT_COST = 10

FREE_PLAN = {
    "duration_days": 7,
    "credits": 30,
    "daily_limit": 3,
}

PRO_PLAN_OPTIONS = {
    1: {"price_inr": 299, "credits": 1500},
    3: {"price_inr": 799, "credits": 4500},
    6: {"price_inr": 1499, "credits": 9000},
}

PREMIUM_PLAN_OPTIONS = {
    1: {"price_inr": 599, "credits": -1},
    3: {"price_inr": 1599, "credits": -1},
    6: {"price_inr": 2999, "credits": -1},
}

PLAN_DAILY_LIMITS = {
    "free": FREE_PLAN["daily_limit"],
    "pro": 5,
    "premium": 6,
}


def get_plan_daily_limit(plan):
    return PLAN_DAILY_LIMITS.get(plan, FREE_PLAN["daily_limit"])


def get_daily_quiz_count(user):
    today = timezone.localdate()
    return QuizSession.objects.filter(user=user, started_at__date=today).count()


def check_can_take_quiz(user):
    now = timezone.now()
    if user.plan_expiry and now > user.plan_expiry:
        if user.plan == "free":
            return {
                "allowed": False,
                "reason": "free_expired",
                "credits_remaining": user.credits_remaining,
            }
        return {
            "allowed": False,
            "reason": "plan_expired",
            "credits_remaining": user.credits_remaining,
        }

    if user.plan != "premium" and user.credits_remaining != -1 and user.credits_remaining < QUIZ_CREDIT_COST:
        return {
            "allowed": False,
            "reason": "no_credits",
            "credits_remaining": user.credits_remaining,
        }

    daily_limit = get_plan_daily_limit(user.plan)
    if daily_limit and get_daily_quiz_count(user) >= daily_limit:
        return {
            "allowed": False,
            "reason": "daily_limit",
            "credits_remaining": user.credits_remaining,
        }

    return {
        "allowed": True,
        "reason": "ok",
        "credits_remaining": user.credits_remaining,
    }


def deduct_credits(user, amount=QUIZ_CREDIT_COST):
    if user.credits_remaining == -1:
        return

    user.credits_remaining -= amount
    user.save(update_fields=["credits_remaining"])
