from django.urls import path

from .views import PlanActivateView, PlanPricingView, PlanStatusView

urlpatterns = [
    path("pricing/", PlanPricingView.as_view(), name="plan-pricing"),
    path("activate/", PlanActivateView.as_view(), name="plan-activate"),
    path("status/", PlanStatusView.as_view(), name="plan-status"),
]
