import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clipcart from "../../assets/clipcart.png";
import RecipePanel from "../../components/RecipePanel/RecipePanel";
import type { Recipe } from "../../components/RecipePanel/RecipePanel";
import "./Recipes.css"; // Separate CSS for Recipes page

export default function Recipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch("/api/recipes");
                const data: Recipe[] = await res.json();
                setRecipes(data);

                // Preselect recipe if query param exists
                const params = new URLSearchParams(location.search);
                const selectedId = params.get("selected");
                if (selectedId) {
                    const match = data.find((r) => r._id === selectedId);
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
            <div className="top-bar">
                {/* Left: Logo and title */}
                <div className="top-bar-left">
                    <img src={clipcart} alt="Clipcart Logo" className="logo" />
                    <span>Clipcart</span>
                </div>

                {/* Right: Home button */}
                <button className="home-button" onClick={() => navigate("/")}>
                    Home
                </button>
            </div>

            {/* Recipe List + Detail */}
            <RecipePanel
                recipes={recipes}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={setSelectedRecipe}
            />
        </div>
    );
}
