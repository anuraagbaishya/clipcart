import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RecipePanel from "../../components/RecipePanel/RecipePanel";
import type { Recipe, RecipeList } from "../../types";
import "./Recipes.css";
import { TopBar } from "../../components/TopBar/TopBar";

export default function Recipes() {
    const [recipes, setRecipes] = useState<RecipeList>({ recipes: [] });
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch("/api/recipes");
                const data: RecipeList = await res.json();

                setRecipes(data);

                // Preselect recipe if query param exists
                const params = new URLSearchParams(location.search);
                const selectedId = params.get("selected");
                if (selectedId) {
                    const match = data.recipes.find((r) => r._id === selectedId);
                    if (match) setSelectedRecipe(match);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRecipes();
    }, [location.search]);

    return (
        <div className="recipes-page">
            {/* Top Bar */}
            <TopBar />

            {/* Recipe List + Detail */}
            <RecipePanel
                recipes={recipes}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={setSelectedRecipe}
                setRecipes={setRecipes}
            />
        </div>
    );
}
