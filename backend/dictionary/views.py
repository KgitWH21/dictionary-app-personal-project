from django.core.files.base import ContentFile
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.views import JWTCookieAuthentication

from .models import Collection, Entry
from .serializers import CollectionSerializer, EntrySerializer
# from .services import # for Elevenlabs API later

# this makes every dictionary account private 
class OwnedModelViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTCookieAuthentication, JWTAuthentication]
    
    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)   

class CollectionViewSet(OwnedModelViewSet):
    ## /api/collections/ - CRUD capability for the user collection
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

class EntryViewSet(OwnedModelViewSet):
    ## /api/entries/ - gives CRUD to the users saved words
    queryset = Entry.objects.select_related("collection").all()
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        collection_id = self.request.query_params.get("collection")
        if collection_id:
            qs = qs.filter(collection_id=collection_id)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(word__icontains=search)
        return qs
    
    @action(detail=True, methods=["post"])
    def pronounce(self, request, pk=None):
        # /api/entries/<id>/pronounce/
        entry = self.get_object()
        source = request.data.get("source", "word")
        text = entry.example_sentence if source == "example" else entry.word
        
        if not text.strip():
            return Response(
                {"detail": "There's no text to prounounce for that."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            audio_bytes = synthesize_speech(text)
        except SpeechError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        
        # save=True writes the fiels and updates the row in one step
        entry.audio.save(f"entry-{entry.pk}.mp3", ContentFile(audio_bytes), save=True)
        return Response(self.get_serializer(entry).data)


