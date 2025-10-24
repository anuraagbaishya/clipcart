export interface Recipe {
    _id: string;
    title: string;
    url: string;
    ingredients: string[];
    measuredIngredients: string[];
    instructions: string;
}

export interface RecipeList {
    recipes: Recipe[];
}

export interface ShoppingListItem {
    name: string;
    checked: boolean;
}


export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingListItem[];
}

export interface ShoppingListList {
    lists: ShoppingList[]
}