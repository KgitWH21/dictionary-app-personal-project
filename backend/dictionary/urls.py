from django.urls import path

from .views import (
    CollectionDetailView,
    CollectionListCreateView,
    EntryDetailView,
    EntryListCreateView,
    EntryPronounceView,
)

urlpatterns = [
    path("collections/", CollectionListCreateView.as_view(), name="collection-list"),
    path("collections/<int:pk>/", CollectionDetailView.as_view(), name="collection-detail"),
    path("entries/", EntryListCreateView.as_view(), name="entry-list"),
    path("entries/<int:pk>/", EntryDetailView.as_view(), name="entry-detail"),
    path("entries/<int:pk>/pronounce/", EntryPronounceView.as_view(), name="entry-pronounce"),
]