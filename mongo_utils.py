from typing import Any, Dict, Optional, List

from bson import ObjectId
from pymongo import MongoClient

from models.data_models import Recipe


class MongoUtils:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.mongo_path: str = "localhost:27017"
        self.client: MongoClient = MongoClient(f"mongodb://{self.mongo_path}")
        self.db = self.client.clipcart
        self.recipes_collection = self.db.recipes

    def add_recipe(self, recipe: Recipe) -> ObjectId:
        result = self.recipes_collection.insert_one(recipe.model_dump())

        return result.inserted_id

    def get_recipe_by_id(self, id: str) -> Recipe:
        recipe: Dict[str, Any] = self.recipes_collection.find_one({"_id": ObjectId(id)})

        recipe["_id"] = str(recipe["_id"])
        return Recipe.model_validate(recipe)

    def get_all_recipes(self) -> List[Recipe]:
        recipes = self.recipes_collection.find({})

        recipe_list = []

        for r in recipes:
            r["_id"] = str(r["_id"])
            recipe_list.append(Recipe.model_validate(r))

        return recipe_list

    def update_ingredients_in_recipe(
        self, id: ObjectId, ingredients: List[str]
    ) -> None:
        self.recipes_collection.update_one(
            {"_id": id}, {"$set": {"ingredients": ingredients}}
        )
