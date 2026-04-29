from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import jwt
import uuid

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ExamifyUser, LeaderboardEntry
from .serializers import CurrentUserSerializer, UpdateUserSerializer


def _week_start_for_date(value):
    return value - timedelta(days=value.weekday())


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        serializer = UpdateUserSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)

        response_serializer = CurrentUserSerializer(request.user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class SignupView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        exam_target = request.data.get("exam_target", "JEE_Mains")

        if not email or not password or not name:
            return Response({"detail": "Email, name, and password are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if ExamifyUser.objects.filter(email=email).exists():
            return Response({"detail": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = ExamifyUser.objects.create(
            clerk_id=str(uuid.uuid4()), # Placeholder since we removed Clerk
            email=email,
            full_name=name,
            password=make_password(password),
            exam_target=exam_target,
            plan="free",
            credits_remaining=30,
            onboarding_completed=False,
            is_active=True,
            plan_expiry=timezone.now() + timedelta(days=7)
        )
        
        token = jwt.encode({
            "user_id": user.id,
            "exp": timezone.now() + timedelta(days=30)
        }, settings.SECRET_KEY, algorithm='HS256')
        
        return Response({
            "token": token, 
            "user": CurrentUserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        user = ExamifyUser.objects.filter(email=email).first()
        if not user or not user.password or not check_password(password, user.password):
            return Response({"detail": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
        token = jwt.encode({
            "user_id": user.id,
            "exp": timezone.now() + timedelta(days=30)
        }, settings.SECRET_KEY, algorithm='HS256')
        
        return Response({
            "token": token,
            "user": CurrentUserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_target, *args, **kwargs):
        try:
            limit = int(request.query_params.get("limit", 20))
        except (TypeError, ValueError):
            limit = 20
        limit = max(1, min(limit, 100))

        week_start = _week_start_for_date(timezone.localdate())
        entries = (
            LeaderboardEntry.objects.filter(exam_target=exam_target, week_start=week_start)
            .select_related("user")
            .order_by("rank", "-xp_this_week")[:limit]
        )

        rows = []
        if entries:
            for index, entry in enumerate(entries, start=1):
                rank = int(entry.rank) if entry.rank else index
                rows.append(
                    {
                        "rank": rank,
                        "name": entry.user.full_name,
                        "user_id": entry.user.id,
                        "xp_this_week": int(entry.xp_this_week),
                        "xp_all_time": int(entry.xp_all_time),
                        "is_you": entry.user_id == request.user.id,
                    }
                )
        else:
            fallback = ExamifyUser.objects.filter(
                exam_target=exam_target,
                is_active=True,
            ).order_by("-xp")[:limit]
            for index, user in enumerate(fallback, start=1):
                rows.append(
                    {
                        "rank": index,
                        "name": user.full_name,
                        "user_id": user.id,
                        "xp_this_week": 0,
                        "xp_all_time": int(user.xp),
                        "is_you": user.id == request.user.id,
                    }
                )

        return Response(
            {
                "exam_target": exam_target,
                "week_start": week_start,
                "entries": rows,
            },
            status=status.HTTP_200_OK,
        )


class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from quiz.models import QuizSession
        week_start = _week_start_for_date(timezone.localdate())
        entry = LeaderboardEntry.objects.filter(
            user=request.user,
            exam_target=request.user.exam_target,
            week_start=week_start,
        ).first()

        has_completed_quiz = QuizSession.objects.filter(
            user=request.user,
            completed_at__isnull=False,
        ).exists()
        requires_premium_initial_quiz = bool(request.user.plan == "premium" and not has_completed_quiz)

        return Response(
            {
                "xp": int(request.user.xp),
                "level": int(request.user.level),
                "streak": int(request.user.streak),
                "exam_target": request.user.exam_target,
                "plan": request.user.plan,
                "credits_remaining": int(request.user.credits_remaining),
                "plan_expiry": request.user.plan_expiry,
                "weekly_rank": int(entry.rank) if entry else None,
                "weekly_xp": int(entry.xp_this_week) if entry else 0,
                "xp_all_time": int(entry.xp_all_time) if entry else int(request.user.xp),
                "has_completed_quiz": has_completed_quiz,
                "requires_premium_initial_quiz": requires_premium_initial_quiz,
            },
            status=status.HTTP_200_OK,
        )


class XPHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from quiz.models import SessionAnswer, QuizSession
        from django.db.models import Sum, Count
        from datetime import date

        today = timezone.localdate()
        rows = []
        for i in range(13, -1, -1):
            day = today - timedelta(days=i)
            answers = SessionAnswer.objects.filter(
                session__user=request.user,
                answered_at__date=day,
            )
            agg = answers.aggregate(xp_total=Sum("xp_delta"), q_count=Count("id"))
            rows.append({
                "date": day.isoformat(),
                "xp_earned": max(0, int(agg["xp_total"] or 0)),
                "quizzes_taken": QuizSession.objects.filter(
                    user=request.user, started_at__date=day
                ).count(),
                "questions_answered": int(agg["q_count"] or 0),
            })

        return Response({"history": rows}, status=status.HTTP_200_OK)