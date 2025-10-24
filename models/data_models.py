from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class IngredientList(BaseModel):
    ingredients: List[str]


class ShoppingListItem(BaseModel):
    name: str
    checked: bool


class ShoppingList(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    items: List[ShoppingListItem]


class ShoppingListList(BaseModel):
    lists: List[ShoppingList]


class Recipe(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    url: str
    ingredients: List[str] = Field(default_factory=list)
    measured_ingredients: List[str] = Field(
        default_factory=list, alias="measuredIngredients"
    )
    instructions: str

    model_config = ConfigDict({"populate_by_name": True})
