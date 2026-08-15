from django.db import models
from django.contrib.auth.models import User

class Collection(models.Model):
    # allows user to create a collection of words, one User can have multiple collections (so one-to-many relationship)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collections")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]
        
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"],
                name="unique_collection_name_per_owner"
            )
        ]
    
    def __str__(self):
        return f"{self.name} ({self.owner.username})"


class Entry(models.Model):
    #this covers saved words and a user notes entry field
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entries")
    collection = models.ForeignKey(
        Collection,
        on_delete=models.CASCADE,
        related_name="entries",
        null=True,
        blank=True, #an entry doesn't have to be in any collection
    )
    # these will come from the Free Dicitionary API
    word = models.CharField(max_length=100)
    phonetic = models.CharField(max_length=100, blank=True)
    part_of_speech = models.CharField(max_length=50, blank=True)
    definition = models.TextField()
    
    # user created fields
    example_sentence = models.TextField(blank=True)
    usage_note = models.TextField(blank=True)
    
    # filled in by ElevenLabs; it'll stay empty until the user asks for audio
    audio = models.FileField(upload_to="pronunciations/", blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["word"]
        verbose_name_plural = "entries"
    
    def __str__(self):
        return self.word
    
