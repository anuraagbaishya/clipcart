from pydantic import BaseModel, Field, ConfigDict


class ExportResponse(BaseModel):
    recipe_id: str = Field(alias="recipeId")

    model_config = ConfigDict(populate_by_name=True)
