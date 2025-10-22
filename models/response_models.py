from pydantic import BaseModel, Field, ConfigDict, RootModel
from .data_models import Recipe
from typing import List, Optional


class ExtractResponse(BaseModel):
    recipe_id: str = Field(alias="recipeId")

    model_config = ConfigDict(populate_by_name=True)


class RecipeResponse(RootModel):
    root: Optional[Recipe]


class RecipeListResponse(BaseModel):
    recipes: List[Recipe]


class OkResponse(BaseModel):
    ok: str = "ok"


class ShoppingListResponse(BaseModel):
    items: List[str]
