import requests 
from django.conf import settings

# from elevenlabs documentation
ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

class SpeechError(Exception):
    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def synthesize_speech(text):
    ##grabs the mp3 for `text` or raise a speech error
    if not settings.ELEVENLABS_API_KEY:
        raise SpeechError(
            "ElevenLabs API key not configured.",
            status_code=503, 
        ) #503 = service unavailable
    
    try:
        response = requests.post(
            ELEVENLABS_TTS_URL.format(voice_id=settings.ELEVENLABS_VOICE_ID),
            headers={
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_v3",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
                
            },
            params={
                "output_format": "mp3_44100_128"
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise SpeechError(f"Could not reach ElevenLabs: {exc}") from exc
    
    if response.status_code == 401:
        raise SpeechError("ElevenLabs rejected server's API key.", status_code=502)
    if response.status_code != 200:
        raise SpeechError(
            f"ElevenLabs returned an error (HTTP {response.status_code})", status_code=502
        )
    
    return response.content

