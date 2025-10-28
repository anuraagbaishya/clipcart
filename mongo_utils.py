from typing import Any, Dict, Optional, List

from bson import ObjectId
from pymongo import MongoClient

from models import (
    Recipe,
    ShoppingListItem,
    ShoppingList,
    ShoppingListList,
    ShoppingListRequest,
)


class MongoUtils:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.mongo_path: str = "localhost:27017"
        self.client: MongoClient = MongoClient(f"mongodb://{self.mongo_path}")
        self.db = self.client.clipcart
        self.recipes_collection = self.db.recipes
        self.shopping_list_collection = self.db.shopping_list

    def add_recipe(self, recipe: Recipe) -> ObjectId:
        result = self.recipes_collection.insert_one(recipe.model_dump())

        return result.inserted_id

    def get_recipe_by_id(self, id: str) -> Optional[Recipe]:
        recipe: Optional[Dict[str, Any]] = self.recipes_collection.find_one(
            {"_id": ObjectId(id)}
        )
        if not recipe:
            return None

        recipe["_id"] = str(recipe["_id"])
        return Recipe.model_validate(recipe)

    def get_all_recipes(self) -> List[Recipe]:
        recipes = self.recipes_collection.find({})

        recipe_list = []

        for r in recipes:
            r["_id"] = str(r["_id"])
            recipe_list.append(Recipe.model_validate(r))

        return recipe_list

    def delete_recipe(self, id: str) -> None:
        self.recipes_collection.delete_one({"_id": ObjectId(id)})

    def update_recipe_details(
        self, id: ObjectId, ingredients: List[str], cusine: str
    ) -> None:
        self.recipes_collection.update_one(
            {"_id": id}, {"$set": {"ingredients": ingredients, "cuisine": cusine}}
        )

    def update_recipe(self, id: str, recipe: Recipe) -> None:
        self.recipes_collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "title": recipe.title,
                    "ingredients": recipe.ingredients,
                    "measured_ingredients": recipe.measured_ingredients,
                    "instructions": recipe.instructions,
                },
            },
        )

    def find_recipes_by_ids(self, ids: List[str]) -> List[Recipe]:
        object_ids = [ObjectId(_id) for _id in ids]

        recipes = list(self.recipes_collection.find({"_id": {"$in": object_ids}}))

        recipe_list = []

        for r in recipes:
            r["_id"] = str(r["_id"])
            recipe_list.append(Recipe.model_validate(r))

        return recipe_list

    def create_shopping_list(self, shopping_list: ShoppingListRequest) -> ObjectId:
        res = self.shopping_list_collection.insert_one(
            {
                "name": shopping_list.name,
                "items": [i.model_dump() for i in shopping_list.items],
            }
        )

        return res.inserted_id

    def delete_shopping_list(self, id: str) -> None:
        self.shopping_list_collection.delete_one({"_id": ObjectId(id)})

    def update_shopping_list(self, id: str, items: List[ShoppingListItem]) -> None:
        self.shopping_list_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": {"items": [i.model_dump() for i in items]}}
        )

    def get_all_shopping_lists(self) -> ShoppingListList:
        shopping_lists_from_db: List[dict] = list(
            self.shopping_list_collection.find({})
        )

        shopping_lists: List[ShoppingList] = []

        for s in shopping_lists_from_db:
            items_data: List[str] = s.get("items", [])
            name: str = s.get("name", "")
            id: ObjectId = s.get("_id", "")
            items: List[ShoppingListItem] = [
                ShoppingListItem.model_validate(i) for i in items_data
            ]
            shopping_list = ShoppingList(items=items, name=name, _id=str(id))
            shopping_lists.append(shopping_list)

        return ShoppingListList(lists=shopping_lists)
