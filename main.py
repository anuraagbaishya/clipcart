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
from models import ExtractRequest, Recipe, ExportResponse

from gemini_ops import GeminiOps
import os

from mongo_utils import MongoUtils

logging.basicConfig(level=logging.INFO)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates directory
templates = Jinja2Templates(directory="templates")

mongo = MongoUtils()


@app.post("/api/recipe/extract")
async def extract_recipe_from_url(data: ExtractRequest, response_model=ExportResponse):
    url: str = data.url

    try:
        scraper = scrape_me(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {e}")

    measured_ingredients: List[str] = scraper.ingredients()
    instructions: str = scraper.instructions()
    title: str = scraper.title()

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

    return ExportResponse(recipe_id=str(recipe_id))  # type: ignore


@app.get("/", response_class=HTMLResponse)
@app.get("/recipe/<id>")
@app.get("/recipes")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/recipe/{recipe_id}")
def get_recipe_by_id(recipe_id: str):
    return mongo.get_recipe_by_id(recipe_id)


@app.get("/api/recipes")
def get_all_recipes() -> List[Recipe]:
    return mongo.get_all_recipes()


def update_ingredients_in_recipe(id: ObjectId, measured_ingredients: List[str]) -> None:
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    gemini_ops = GeminiOps(gemini_key, "gemini-2.5-flash-lite")

    ingredients: Optional[List[str]] = gemini_ops.extract(measured_ingredients)

    if not ingredients:
        logging.error("ingredient extraction failed")
        return None

    mongo.update_ingredients_in_recipe(id, ingredients)
    logging.info(f"ingredient list updated for {id}")
