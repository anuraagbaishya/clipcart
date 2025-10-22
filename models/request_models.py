from pydantic import BaseModel
from typing import List


class ExtractRequest(BaseModel):
    url: str


class ShoppingListRequest(BaseModel):
    ids: List[str]
