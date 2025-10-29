import os
from typing import List

from notion_client import Client


class NotionUtils:
    def __init__(self):
        self.client: Client = Client(auth=os.environ.get("NOTION_KEY"))
        self.parent_page_id: str = "29b6907f6f8680238d52f30faf463772"

    def create_new_page(self, title: str, items: List[str]) -> str:
        new_page = self.client.pages.create(
            parent={"page_id": self.parent_page_id},
            properties={"title": [{"type": "text", "text": {"content": title}}]},
            children=[
                {
                    "object": "block",
                    "type": "to_do",
                    "to_do": {
                        "rich_text": [{"type": "text", "text": {"content": item}}],
                        "checked": False,
                    },
                }
                for item in items
            ],
        )

        return new_page["id"]  # type: ignore

    def update_page(self, page_id: str, title: str, items: List[str]) -> None:
        # 1. Fetch existing children correctly
        children = self.client.blocks.children.list(block_id=page_id)["results"]  # type: ignore

        # 2. Delete each block (use self.client, not notion)
        for block in children:
            self.client.blocks.delete(block_id=block["id"])

        # 3. Append new TODO blocks (use self.client, and fix variable name)
        self.client.blocks.children.append(
            block_id=page_id,
            children=[
                {
                    "object": "block",
                    "type": "to_do",
                    "to_do": {
                        "rich_text": [{"type": "text", "text": {"content": item}}],
                        "checked": False,
                    },
                }
                for item in items
            ],
        )
