import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList";
import FilterPanel from "./FilterPanel";
import RecipeDetail from "./RecipeDetail";
import "./RecipePanel.css";
import { useNavigate } from "react-router-dom";
import type { Recipe, RecipeList as RecipeListType, ShoppingList } from "../../types";

interface Props {
    recipes: RecipeListType;
    selectedRecipe: Recipe | null;
    onSelectRecipe: (recipe: Recipe | null) => void;
    setRecipes?: React.Dispatch<React.SetStateAction<RecipeListType>>;
}

const RecipePanel: React.FC<Props> = ({ recipes, selectedRecipe, onSelectRecipe, setRecipes }) => {
    const [menuIds, setMenuIds] = useState<string[]>([]);
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredientsFilter, setIngredientsFilter] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes.recipes);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);

    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => setFilteredRecipes(recipes.recipes), [recipes.recipes]);
    useEffect(() => {
        const cuisines = Array.from(new Set(recipes.recipes.map(r => r.cuisine).filter(Boolean)));
        setCuisineOptions(cuisines);
    }, [recipes.recipes]);

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

        if (selectedCuisines.length > 0) {
            updated = updated.filter(r => selectedCuisines.includes(r.cuisine));
        }

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            updated = updated.filter(r => r.title.toLowerCase().includes(term));
        }

        setFilteredRecipes(updated);
    }, [recipes.recipes, ingredientsFilter, selectedCuisines, searchTerm]);

    const updateRecipe = async (updated: Recipe) => {
        // 1. Update local state immediately (UI update)
        if (setRecipes) {
            setRecipes(prev => ({
                recipes: prev.recipes.map(r => r._id === updated._id ? updated : r)
            }));
        }
        onSelectRecipe(updated);

        try {
            const res = await fetch("/api/recipe/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: updated._id, recipe: updated }),
            });
            if (!res.ok) throw new Error("Failed to save recipe");
            console.log("Recipe saved successfully!");
        } catch (err) {
            console.error("Error saving recipe:", err);
            alert("Failed to save recipe. Please try again.");
        }
    };


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
        const itemsSet = new Set<string>();
        recipes.recipes.forEach(r => {
            if (menuIds.includes(r._id)) {
                r.ingredients.forEach(i => itemsSet.add(i));
            }
        });

        const shoppingItems: ShoppingList = {
            id: "",
            name: "",
            items: Array.from(itemsSet).map(i => ({
                name: i,
                checked: false
            }))
        };

        navigate("/shoppingList", { state: { openModal: true, items: shoppingItems } });
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
                ingredientInput={ingredientInput}
                setIngredientInput={setIngredientInput}
                ingredientsFilter={ingredientsFilter}
                setIngredientsFilter={setIngredientsFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                cuisineOptions={cuisineOptions}
                selectedCuisines={selectedCuisines}
                setSelectedCuisines={setSelectedCuisines}
            />

            <RecipeDetail
                recipe={selectedRecipe}
                isVisible={!!selectedRecipe}
                onClose={() => onSelectRecipe(null)}
                onUpdate={updateRecipe}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
            />

            {menuIds.length > 0 && (
                <button className="shopping-list-button" onClick={handleShoppingList}>
                    Create Shopping List
                </button>
            )}
        </div>
    );
};

export default RecipePanel;
