from pydantic import BaseModel
from typing import List
from .data_models import ShoppingListItem, Recipe


class RecipeRequest(BaseModel):
    request: str  # either a URL for extraction or a prompt for AI generation


class AddRecipeRequest(BaseModel):
    title: str
    ingredients: List[str]
    instructions: str


class ShoppingListRequest(BaseModel):
    name: str
    items: List[ShoppingListItem]


class UpdateShoppingListRequest(BaseModel):
    id: str
    name: str
    items: List[ShoppingListItem]


class UpdateRecipeRequest(BaseModel):
    id: str
    recipe: Recipe
