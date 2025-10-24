from pydantic import BaseModel, Field, ConfigDict, RootModel
from .data_models import Recipe, ShoppingListItem
from typing import List, Optional


class IdResponse(BaseModel):
    id: str


class RecipeResponse(RootModel):
    root: Optional[Recipe]


class RecipeListResponse(BaseModel):
    recipes: List[Recipe]


class OkResponse(BaseModel):
    ok: str = "ok"
