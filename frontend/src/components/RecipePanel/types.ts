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

export interface ShoppingList {
    items: string[];
}
