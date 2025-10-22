import logging
from typing import cast, List, Optional

from google import genai
from models.data_models import IngredientList

logging.basicConfig(level=logging.INFO)
logging.getLogger("google_genai").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)


class GeminiOps:
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def extract(
        self,
        ingredients: List[str],
    ) -> Optional[List[str]]:
        prompt = f"""
            You are an ingredient extraction expert. Your task is to process the following JSON list of recipe ingredients. 
            For each string in the list, extract and return **only the base ingredient name in singular form**. 
            You must strip away all measurements, quantities, units, preparation instructions, and parenthetical notes. You must keep the cut of meat including ground meat

            **Input JSON:**
            {ingredients}

            **Required Output:**
            Return only a single Python list of strings containing the extracted ingredient names.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": IngredientList,
                },
            )
            if response and response.parsed:
                ingredient_list: IngredientList = cast(IngredientList, response.parsed)
                return ingredient_list.ingredients
            else:
                return None
        except Exception as e:
            raise RuntimeError(f"Gemini request failed with error {e}")
