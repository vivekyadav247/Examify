"""
examify_backend/features/urls.py

URL routes for all new Examify features using DRF APIViews.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Syllabus Explorer
    path('syllabus/', views.SyllabusView.as_view(), name='syllabus'),

    # Short Notes Generator
    path('notes/generate/', views.GenerateNotesView.as_view(), name='generate_notes'),

    # Study Plan Generator
    path('plan/generate/', views.GeneratePlanView.as_view(), name='generate_plan'),

    # AI Chat
    path('chat/', views.AIChatView.as_view(), name='ai_chat'),

    # Rank Predictor
    path('predict-rank/', views.PredictRankView.as_view(), name='predict_rank'),

    # Mock Test Generation
    path('mock-test/', views.GenerateMockTestView.as_view(), name='mock_test'),
    path('mock-test/submit/', views.SubmitMockTestView.as_view(), name='submit_mock_test'),

    # Revision Material
    path('revision/generate/', views.GenerateRevisionView.as_view(), name='generate_revision'),

    # Full DNA Report (extends existing analytics)
    path('analytics/dna-full/', views.DNAFullReportView.as_view(), name='dna_full_report'),
]
