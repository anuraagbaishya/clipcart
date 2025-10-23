import React, { useEffect, useState } from "react";
import type { Recipe, RecipeList as RecipeListType, ShoppingList } from "./types";
import RecipeList from "./RecipeList";
import FilterPanel from "./FilterPanel";
import RecipeDetail from "./RecipeDetail";
import "./RecipePanel.css";

interface Props {
    recipes: RecipeListType;
    selectedRecipe: Recipe | null;
    onSelectRecipe: (recipe: Recipe | null) => void;
    setRecipes?: React.Dispatch<React.SetStateAction<RecipeListType>>;
}

const RecipePanel: React.FC<Props> = ({ recipes, selectedRecipe, onSelectRecipe, setRecipes }) => {
    const [menuIds, setMenuIds] = useState<string[]>([]);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredientsFilter, setIngredientsFilter] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes.recipes);

    useEffect(() => setFilteredRecipes(recipes.recipes), [recipes.recipes]);

    useEffect(() => {
        const stored = localStorage.getItem("menu");
        if (stored) setMenuIds(JSON.parse(stored));
    }, []);

    useEffect(() => {
        let updated = [...recipes.recipes];

        if (ingredientsFilter.length > 0) {
            updated = updated.filter(r =>
                ingredientsFilter.every(ing =>
                    r.ingredients.some(i => i.toLowerCase().includes(ing.toLowerCase()))
                )
            );
        }

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            updated = updated.filter(r => r.title.toLowerCase().includes(term));
        }

        setFilteredRecipes(updated);
    }, [recipes.recipes, ingredientsFilter, searchTerm]);

    const toggleMenu = (id: string) => {
        const newMenu = menuIds.includes(id)
            ? menuIds.filter(x => x !== id)
            : [...menuIds, id];
        setMenuIds(newMenu);
        localStorage.setItem("menu", JSON.stringify(newMenu));
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/recipe/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");

            if (setRecipes) setRecipes(prev => ({
                recipes: prev.recipes.filter(r => r._id !== id)
            }));

            if (selectedRecipe?._id === id) onSelectRecipe(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete recipe");
        }
    };

    const handleShoppingList = async () => {
        const items = new Set<string>();
        recipes.recipes.forEach(r => {
            if (menuIds.includes(r._id)) r.ingredients.forEach(i => items.add(i));
        });
        const shoppingList: ShoppingList = { items: Array.from(items) };
        console.log(shoppingList);
    };

    return (
        <div className="recipe-panel-wrapper">
            <RecipeList
                recipes={{ recipes: filteredRecipes }}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={onSelectRecipe}
                menuIds={menuIds}
                toggleMenu={toggleMenu}
                handleDelete={handleDelete}
            />

            <FilterPanel
                favoritesOnly={favoritesOnly}
                setFavoritesOnly={setFavoritesOnly}
                ingredientInput={ingredientInput}
                setIngredientInput={setIngredientInput}
                ingredientsFilter={ingredientsFilter}
                setIngredientsFilter={setIngredientsFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <RecipeDetail
                recipe={selectedRecipe}
                isVisible={!!selectedRecipe}
                onClose={() => onSelectRecipe(null)}
            />

            {menuIds.length > 0 && (
                <button className="shopping-list-button" onClick={handleShoppingList}>
                    Shopping List
                </button>
            )}
        </div>
    );
};

export default RecipePanel;
