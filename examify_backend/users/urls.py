from django.urls import path

from .views import (
    SignupView,
    LoginView,
    CurrentUserView,
    LeaderboardView,
    UpdateUserView,
    UserStatsView,
    XPHistoryView,
)

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("me/update/", UpdateUserView.as_view(), name="update-user"),
    path("leaderboard/<str:exam_target>/", LeaderboardView.as_view(), name="leaderboard"),
    path("stats/", UserStatsView.as_view(), name="user-stats"),
    path("xp-history/", XPHistoryView.as_view(), name="xp-history"),
]