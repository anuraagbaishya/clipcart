from pydantic import BaseModel
from typing import List
from .data_models import ShoppingListItem


class ExtractRequest(BaseModel):
    url: str


class AddRecipeRequest(BaseModel):
    title: str
    ingredients: List[str]
    instructions: str


class ShoppingListRequest(BaseModel):
    name: str
    items: List[ShoppingListItem]
