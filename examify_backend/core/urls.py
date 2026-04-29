from django.contrib import admin
from django.urls import include, path

from users.admin_views import AdminUpdateUserView, AdminUserListView
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/quiz/", include("quiz.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/content/", include("content.urls")),
    path("api/plans/", include("plans.urls")),
    path("api/admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("api/admin/users/update/", AdminUpdateUserView.as_view(), name="admin-user-update"),
]
