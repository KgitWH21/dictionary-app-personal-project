from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.views import JWTCookieAuthentication

from .models import Collection, Entry
from .serializers import CollectionSerializer, EntrySerializer
from .services import SpeechError, synthesize_speech


class OwnedAPIView(APIView):
    authentication_classes = [JWTCookieAuthentication, JWTAuthentication]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.filter(owner=self.request.user)

    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def serializer_context(self):
        return {"request": self.request}



class CollectionListCreateView(OwnedAPIView):
    model = Collection
    serializer_class = CollectionSerializer

    def get(self, request):
        serializer = CollectionSerializer(
            self.get_queryset(), many=True, context=self.serializer_context()
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = CollectionSerializer(
            data=request.data, context=self.serializer_context()
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CollectionDetailView(OwnedAPIView):
    model = Collection
    serializer_class = CollectionSerializer

    def get(self, request, pk):
        serializer = CollectionSerializer(
            self.get_object(pk), context=self.serializer_context()
        )
        return Response(serializer.data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        collection = self.get_object(pk)
        serializer = CollectionSerializer(
            collection,
            data=request.data,
            partial=partial,
            context=self.serializer_context(),
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class EntryListCreateView(OwnedAPIView):
    model = Entry
    serializer_class = EntrySerializer

    def get_queryset(self):
        qs = self.model.objects.select_related("collection").filter(
            owner=self.request.user
        )
        collection_id = self.request.query_params.get("collection")
        if collection_id:
            qs = qs.filter(collection_id=collection_id)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(word__icontains=search)
        return qs

    def get(self, request):
        serializer = EntrySerializer(
            self.get_queryset(), many=True, context=self.serializer_context()
        )
        return Response(serializer.data)

    # AddWord: Step 11. POST from createEntry() passes through here
    def post(self, request):
        serializer = EntrySerializer(
            data=request.data, context=self.serializer_context()
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EntryDetailView(OwnedAPIView):
    model = Entry
    serializer_class = EntrySerializer

    def get_queryset(self):
        return self.model.objects.select_related("collection").filter(
            owner=self.request.user
        )

    def get(self, request, pk):
        serializer = EntrySerializer(
            self.get_object(pk), context=self.serializer_context()
        )
        return Response(serializer.data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        entry = self.get_object(pk)
        serializer = EntrySerializer(
            entry, data=request.data, partial=partial,
            context=self.serializer_context(),
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EntryPronounceView(OwnedAPIView):
    model = Entry
    serializer_class = EntrySerializer

    def post(self, request, pk):
        entry = self.get_object(pk)
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

        entry.audio.save(f"entry-{entry.pk}.mp3", ContentFile(audio_bytes), save=True)
        serializer = EntrySerializer(entry, context=self.serializer_context())
        return Response(serializer.data)
