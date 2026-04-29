from django.urls import path

from .views import ContentDetailView, ContentListView, ContentUploadView

urlpatterns = [
	path("upload/", ContentUploadView.as_view(), name="content-upload"),
	path("list/", ContentListView.as_view(), name="content-list"),
	path("<int:content_id>/", ContentDetailView.as_view(), name="content-detail"),
]
