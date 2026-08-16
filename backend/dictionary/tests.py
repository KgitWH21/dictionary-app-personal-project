from unittest.mock import patch 

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Collection, Entry

class DictionaryTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="keith", password="reader")
        self.other = User.objects.create_user(username="joanna", password="reader")
        self.client.force_authenticate(self.user)
        
        self.collection = Collection.objects.create(owner=self.user, name="Sci-Fi Words")
        self.entry = Entry.objects.create(
            owner=self.user,
            collection=self.collection,
            word="ansible",
            definition="a device for instant communication across space",
        )

class CollectionCrudTests(DictionaryTestCase):
    def test_list_only_returns_user_collections(self):
        Collection.objects.create(owner=self.other, name="Keith's Words")
        response = self.client.get("/api/collections/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Sci-Fi Words")
    
    
class EntryCrudTest(DictionaryTestCase):
    def test_create_entry_with_personal_material(self):
        response = self.client.post(
            "/api/entries/",
            {
                "word": "petrichor",
                "definition": "The smell of rain on dry earth.",
                "part_of_speech": "noun",
                "example_sentence": "The petrichor rose off the hot road.",
                "collection": self.collection.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["collection_name"], "Sci-Fi Words")

class PronunciationTests(DictionaryTestCase):

    @patch("dictionary.views.synthesize_speech", return_value=b"fake-mp3-bytes")
    def test_pronounce_saves_audio(self, mocked):
        response = self.client.post(f"/api/entries/{self.entry.id}/pronounce/", {}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data["audio_url"])
        mocked.assert_called_once_with("ansible")