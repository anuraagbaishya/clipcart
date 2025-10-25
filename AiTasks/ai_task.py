from abc import ABC, abstractmethod
from google import genai


class AiTask(ABC):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.model = model

    @abstractmethod
    def prompt(self, *args, **kwargs):
        pass

    @abstractmethod
    def ai_request(self, *args, **kwargs):
        pass
