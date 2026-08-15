from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CollectionViewSet, EntryViewSet

router = DefaultRouter()
router.register("collections", CollectionViewSet, basename="collection")
router.register("entries", EntryViewSet, basename="entry")

urlpatterns = [
    path('', include(router.urls)),
]

#turns out the routing of viewsets wasn't as bad as I thought

