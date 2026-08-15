from rest_framework import serializers
from .models import Collection, Entry

class EntrySerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    collection_name = serializers.CharField(source="collection.name", read_only=True, allow_null=True)
    
    class Meta:
        model = Entry
        fields = [
            "id",
            "word",
            "phonetic",
            "part_of_speech",
            "definition",
            "example_sentence",
            "usage_note",
            "collection",
            "collection_name",
            "audio_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
    
    def get_audio_url(self, obj):
        if obj.audio:
            return obj.audio.url
        return None
        
    def validate_word(self, value): 
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Enter a word")
        return cleaned
    
    def validate_collection(self, value):
        # a User shouldn't be able to enter an entry into someone else's collection
        request = self.context.get("request")
        if value is not None and request and value.owner != request.user:
            raise serializers.ValidationError("The collection doesn't exist.")
        return value

class CollectionSerializer(serializers.ModelSerializer):
    # this field shows the count of entries
    entry_count = serializers.IntegerField(source="entries.count", read_only=True)
    
    class Meta:
        model = Collection
        fields = [
            "id",
            "name",
            "description",
            "entry_count",
            "created_at",
            "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]
    
    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("A collection name is required.")
        request = self.context.get("request")
        qs = Collection.objects.filter(owner=request.user, name__iexact=cleaned)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You already have a collection with that name.")
        return cleaned
        