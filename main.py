# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from recipe_scrapers import scrape_me
from typing import List, Optional
import asyncio

import logging

from bson import ObjectId
from models import (
    ExtractRequest,
    Recipe,
    RecipeIdResponse,
    RecipeListResponse,
    RecipeResponse,
    OkResponse,
    AddRecipeRequest,
)

from gemini_ops import GeminiOps
import os

from mongo_utils import MongoUtils

logging.basicConfig(level=logging.INFO)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates directory
templates = Jinja2Templates(directory="templates")

mongo = MongoUtils()


@app.get("/", response_class=HTMLResponse)
@app.get("/recipes", response_class=HTMLResponse)
@app.get("/addRecipe", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/recipe/extract", response_model=RecipeIdResponse)
async def extract_recipe_from_url(data: ExtractRequest) -> RecipeIdResponse:
    url: str = data.url

    try:
        scraper = scrape_me(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {e}")

    measured_ingredients: List[str] = scraper.ingredients()
    instructions: str = scraper.instructions()
    title: str = scraper.title()

    print(title)
    print(instructions)
    print(measured_ingredients)

    recipe = Recipe(
        title=title,
        url=url,
        measured_ingredients=measured_ingredients,  # type: ignore
        instructions=instructions,
    )  # type: ignore

    recipe_id: ObjectId = mongo.add_recipe(recipe)

    asyncio.create_task(
        asyncio.to_thread(update_ingredients_in_recipe, recipe_id, measured_ingredients)
    )

    return RecipeIdResponse(recipe_id=str(recipe_id))  # type: ignore


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


@app.post("/api/recipe/add", response_model=RecipeIdResponse)
async def add_recipe(data: AddRecipeRequest) -> RecipeIdResponse:

    recipe = Recipe(
        title=data.title,
        url="",
        measured_ingredients=data.ingredients,  # type: ignore
        instructions=data.instructions,
    )  # type: ignore

    recipe_id: ObjectId = mongo.add_recipe(recipe)

    asyncio.create_task(
        asyncio.to_thread(update_ingredients_in_recipe, recipe_id, data.ingredients)
    )

    return RecipeIdResponse(recipe_id=str(recipe_id))  # type: ignore


def update_ingredients_in_recipe(id: ObjectId, measured_ingredients: List[str]) -> None:
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    gemini_ops = GeminiOps(gemini_key, "gemini-2.5-flash-lite")

    ingredients: Optional[List[str]] = gemini_ops.extract(measured_ingredients)

    if not ingredients:
        logging.error("ingredient extraction failed")
        return None

    mongo.update_ingredients_in_recipe(id, ingredients)
    logging.info(f"ingredient list updated for {id}")


def get_unique_ingredients(recipes: List[Recipe]) -> List[str]:
    unique_ingredients = set()
    for r in recipes:
        unique_ingredients.update(r.ingredients)

    return list(unique_ingredients)
