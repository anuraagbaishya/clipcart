from typing import List
from pydantic import BaseModel, Field, ConfigDict


class IngredientList(BaseModel):
    ingredients: List[str]


class Recipe(BaseModel):
    id: str = Field(alias="_id")
    title: str
    url: str
    ingredients: List[str] = Field(default_factory=list)
    measured_ingredients: List[str] = Field(
        default_factory=list, alias="measuredIngredients"
    )
    instructions: str

    model_config = ConfigDict({"populate_by_name": True})
