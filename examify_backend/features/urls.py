"""
examify_backend/features/urls.py

URL routes for all new Examify features.

HOW TO USE:
-----------
In your main examify_backend/examify_backend/urls.py, add:

    from django.urls import path, include

    urlpatterns = [
        # ... your existing urls ...
        path('api/', include('features.urls')),
    ]

Or if you already have 'api/' prefix:
    path('', include('features.urls')),
"""

from django.urls import path
from . import views

urlpatterns = [
    # Syllabus Explorer
    path('syllabus/', views.syllabus_view, name='syllabus'),

    # Short Notes Generator
    path('notes/generate/', views.generate_notes, name='generate_notes'),

    # Study Plan Generator
    path('plan/generate/', views.generate_plan, name='generate_plan'),

    # AI Chat
    path('chat/', views.ai_chat, name='ai_chat'),

    # Rank Predictor
    path('predict-rank/', views.predict_rank, name='predict_rank'),

    # Mock Test Generation
    path('mock-test/', views.generate_mock_test, name='mock_test'),

    # Revision Material
    path('revision/generate/', views.generate_revision, name='generate_revision'),

    # Full DNA Report (extends existing analytics)
    path('analytics/dna-full/', views.dna_full_report, name='dna_full_report'),
]
