# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from recipe_scrapers import scrape_me
from typing import List, Optional
import asyncio
from urllib.parse import urlparse, ParseResult

from custom_scrapers import custom_scraper_base_urls, get_scrapper, CustomScraper

import logging

from bson import ObjectId
from models import (
    RecipeRequest,
    Recipe,
    IdResponse,
    RecipeListResponse,
    RecipeResponse,
    OkResponse,
    AddRecipeRequest,
    ShoppingListRequest,
    ShoppingListList,
    RecipeDetails,
    UpdateShoppingListRequest,
    UpdateRecipeRequest,
)

from ai_tasks import ExtractRecipeDetailsTask, GenerateRecipeTask
import os

from mongo_utils import MongoUtils

logging.basicConfig(level=logging.INFO)

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash-lite"

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates directory
templates = Jinja2Templates(directory="templates")

mongo = MongoUtils()


@app.get("/", response_class=HTMLResponse)
@app.get("/recipes", response_class=HTMLResponse)
@app.get("/addRecipe", response_class=HTMLResponse)
@app.get("/shoppingList", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/recipe/extract", response_model=IdResponse)
async def extract_recipe_from_url(data: RecipeRequest) -> IdResponse:
    url: str = data.request
    parsed: ParseResult = urlparse(url)
    base_url: str = f"{parsed.scheme}://{parsed.netloc}"

    ai_supplement = False

    if base_url in custom_scraper_base_urls():
        try:
            custom_scraper: CustomScraper = get_scrapper(base_url)()
            recipe = custom_scraper.scrape(url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to scrape {url}: {e}")
    else:
        try:
            scraper = scrape_me(url)
            measured_ingredients: List[str] = scraper.ingredients()
            instructions: str = scraper.instructions()
            title: str = scraper.title()

            recipe = Recipe(
                title=title,
                url=url,
                measured_ingredients=measured_ingredients,  # type: ignore
                instructions=instructions,
            )  # type: ignore

            ai_supplement = True

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to scrape {url}: {e}")

    if not recipe:
        raise HTTPException(
            status_code=400, detail=f"Failed to scrape {url}, no recipe found."
        )

    logging.info(f"extracted recipe: {recipe.title}")

    recipe_id: ObjectId = mongo.add_recipe(recipe)

    if ai_supplement:
        asyncio.create_task(
            asyncio.to_thread(
                update_ingredients_in_recipe, recipe_id, title, measured_ingredients
            )
        )

    return IdResponse(id=str(recipe_id))  # type: ignore


@app.post("/api/recipe/generate", response_model=IdResponse)
async def generate_recipe(data: RecipeRequest) -> IdResponse:
    generate_recipe_task = GenerateRecipeTask(GEMINI_KEY, GEMINI_MODEL)
    try:
        generated_recipe: Optional[Recipe] = generate_recipe_task.ai_request(
            data.request
        )
        if not generated_recipe:
            logging.error("No recipe generated")
            raise HTTPException(status_code=400, detail=f"Failed to generate recipe")

        logging.info(f"extracted recipe: {generated_recipe.title}")

        recipe_id: ObjectId = mongo.add_recipe(generated_recipe)

        return IdResponse(id=str(recipe_id))

    except RuntimeError as e:
        logging.error(e)
        raise HTTPException(status_code=400, detail=f"{e}")


@app.get("/api/recipe/{recipe_id}", response_model=RecipeResponse)
def get_recipe_by_id(recipe_id: str) -> RecipeResponse:
    recipe = mongo.get_recipe_by_id(recipe_id)

    return RecipeResponse(root=recipe)


@app.get("/api/recipes", response_model=RecipeListResponse)
def get_all_recipes() -> RecipeListResponse:
    return RecipeListResponse(recipes=mongo.get_all_recipes())


@app.delete("/api/recipe/{recipe_id}", response_model=OkResponse)
def delete_recipe(recipe_id: str) -> OkResponse:
    mongo.delete_recipe(recipe_id)

    return OkResponse()


@app.post("/api/recipe/add", response_model=IdResponse)
async def add_recipe(data: AddRecipeRequest) -> IdResponse:

    recipe = Recipe(
        title=data.title,
        url="",
        measured_ingredients=data.ingredients,  # type: ignore
        instructions=data.instructions,
    )  # type: ignore

    recipe_id: ObjectId = mongo.add_recipe(recipe)

    asyncio.create_task(
        asyncio.to_thread(
            update_ingredients_in_recipe, recipe_id, data.title, data.ingredients
        )
    )

    return IdResponse(id=str(recipe_id))  # type: ignore


@app.get("/api/shopping_lists", response_model=ShoppingListList)
def get_all_shopping_lists() -> ShoppingListList:
    return mongo.get_all_shopping_lists()


@app.post("/api/shopping_list/create", response_model=IdResponse)
def create_shopping_list(data: ShoppingListRequest) -> IdResponse:
    shopping_list_id = mongo.create_shopping_list(data)

    return IdResponse(id=str(shopping_list_id))


@app.post("/api/recipe/update", response_model=OkResponse)
async def update_recipe(data: UpdateRecipeRequest):
    mongo.update_recipe(data.id, data.recipe)

    asyncio.create_task(
        asyncio.to_thread(
            update_ingredients_in_recipe,
            ObjectId(data.id),
            data.recipe.title,
            data.recipe.ingredients,
        )
    )

    return OkResponse()


@app.post("/api/shopping_list/update", response_model=OkResponse)
def update_shopping_list(data: UpdateShoppingListRequest) -> OkResponse:
    mongo.update_shopping_list(data.id, data.items)

    return OkResponse()


@app.delete("/api/shopping_list/delete", response_model=OkResponse)
def delete_shopping_list(id: str) -> OkResponse:
    mongo.delete_shopping_list(id)

    return OkResponse()


def update_ingredients_in_recipe(
    id: ObjectId, dish_name: str, measured_ingredients: List[str]
) -> None:
    extract_recipe_details_task = ExtractRecipeDetailsTask(GEMINI_KEY, GEMINI_MODEL)
    try:
        recipe_details: Optional[RecipeDetails] = (
            extract_recipe_details_task.ai_request(dish_name, measured_ingredients)
        )

        if not recipe_details:
            logging.error("ingredient extraction failed")
            return None

        mongo.update_recipe_details(
            id, recipe_details.ingredients, recipe_details.cuisine.capitalize()
        )
        logging.info(f"recipe details updated for {dish_name}")
    except RuntimeError as e:
        logging.error(e)


def get_unique_ingredients(recipes: List[Recipe]) -> List[str]:
    unique_ingredients = set()
    for r in recipes:
        unique_ingredients.update(r.ingredients)

    return list(unique_ingredients)
