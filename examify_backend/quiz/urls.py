from django.urls import path

from .views import (
    ContentQuizStartView,
    DiagnosticStartView,
    OverallDNAReportView,
    QuizAnswerView,
    QuizDNAReportView,
    QuizHistoryView,
    QuizNextBatchView,
    QuizSessionCompleteView,
    QuizSessionDetailView,
    QuizStartView,
)

urlpatterns = [
    path("start/", QuizStartView.as_view(), name="quiz-start"),
    path("start/content/", ContentQuizStartView.as_view(), name="quiz-start-content"),
    path("answer/", QuizAnswerView.as_view(), name="quiz-answer"),
    path("history/", QuizHistoryView.as_view(), name="quiz-history"),
    path("diagnostic/start/", DiagnosticStartView.as_view(), name="quiz-diagnostic-start"),
    path("session/<uuid:session_id>/", QuizSessionDetailView.as_view(), name="quiz-session-detail"),
    path("session/<uuid:session_id>/next-batch/", QuizNextBatchView.as_view(), name="quiz-next-batch"),
    path(
        "session/<uuid:session_id>/complete/",
        QuizSessionCompleteView.as_view(),
        name="quiz-session-complete",
    ),
    path(
        "sessions/<uuid:session_id>/dna-report/",
        QuizDNAReportView.as_view(),
        name="quiz-dna-report",
    ),
    path("dna/profile/", OverallDNAReportView.as_view(), name="quiz-dna-profile-report"),
]
