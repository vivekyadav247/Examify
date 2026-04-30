from django.urls import path

from .views import (
    DailyPlanView,
    DashboardView,
    DnaSummaryView,
    PremiumPlanEngineView,
    SetExamView,
    TopicGraphView,
)

urlpatterns = [
    path("set-exam/", SetExamView.as_view(), name="analytics-set-exam"),
    path("dashboard/", DashboardView.as_view(), name="analytics-dashboard"),
    path("topic-graph/", TopicGraphView.as_view(), name="analytics-topic-graph"),
    path("dna/", DnaSummaryView.as_view(), name="analytics-dna"),
    path("premium-plan/", PremiumPlanEngineView.as_view(), name="analytics-premium-plan"),
    path("daily-plan/", DailyPlanView.as_view(), name="analytics-daily-plan"),
]
