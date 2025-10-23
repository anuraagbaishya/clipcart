from pydantic import BaseModel
from typing import List


class ExtractRequest(BaseModel):
    url: str


class AddRecipeRequest(BaseModel):
    title: str
    ingredients: List[str]
    instructions: str
