import React, { useEffect, useState } from "react";
import "./RecipePanel.css";

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

interface ShoppingList {
    items: string[]
}

interface RecipePanelProps {
    recipes: RecipeList;
    selectedRecipe: Recipe | null;
    onSelectRecipe: (recipe: Recipe | null) => void;
    setRecipes?: React.Dispatch<React.SetStateAction<RecipeList>>;
}

const RecipePanel: React.FC<RecipePanelProps> = ({
    recipes,
    selectedRecipe,
    onSelectRecipe,
    setRecipes,
}) => {
    const [menuIds, setMenuIds] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(!!selectedRecipe);
    }, [selectedRecipe]);

    useEffect(() => {
        const stored = localStorage.getItem("menu");
        if (stored) setMenuIds(JSON.parse(stored));
    }, []);

    const toggleMenu = (id: string) => {
        const newMenu = menuIds.includes(id)
            ? menuIds.filter((x) => x !== id)
            : [...menuIds, id];
        setMenuIds(newMenu);
        localStorage.setItem("menu", JSON.stringify(newMenu));
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/recipe/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");

            if (setRecipes)
                setRecipes((prev) => ({
                    recipes: prev.recipes.filter((r) => r._id !== id),
                }));

            if (selectedRecipe?._id === id) onSelectRecipe(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete recipe");
        }
    };

    const handleShoppingList = async () => {
        try {
            const menu = JSON.parse(localStorage.getItem("menu") || "[]");
            const res = await fetch(`/api/shoppinglist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "ids": menu }),
            });

            const data: ShoppingList = await res.json()
            console.log(data)
        } catch (err) {
            console.error(err);
            alert("Failed to get shopping list");
        }
    };

    return (
        <div className="recipe-panel-wrapper">
            {/* Recipe List */}
            <div className="recipe-list">
                {recipes.recipes.map((r) => (
                    <div
                        key={r._id}
                        className={`recipe-card ${selectedRecipe?._id === r._id ? "active" : ""
                            }`}
                        onClick={() => onSelectRecipe(r)}
                    >
                        <span>{r.title}</span>
                        <div className="recipe-card-buttons">
                            <button
                                className="menu-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(r._id);
                                }}
                            >
                                {menuIds.includes(r._id) ? "×" : "+"}
                            </button>
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(r._id);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5a1 1 0 01-1 .5H8.5a1 1 0 01-1-.5L6 9zm3 2v8h2v-8H9zm4 0v8h2v-8h-2zM10 4V3a1 1 0 011-1h2a1 1 0 011 1v1h5v2H5V4h5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Panel */}
            <div className={`recipe-detail ${isVisible ? "slide-in" : "slide-out"}`}>
                {selectedRecipe && (
                    <div className="recipe-detail-inner">
                        <button
                            className="close-button"
                            onClick={() => onSelectRecipe(null)}
                        >
                            ×
                        </button>
                        <h2>{selectedRecipe.title}</h2>
                        <h3>Ingredients</h3>
                        <ul className="ingredients-list">
                            {selectedRecipe.measuredIngredients.map((i, idx) => (
                                <li key={idx}>{i}</li>
                            ))}
                        </ul>
                        <h3>Instructions</h3>
                        <p>{selectedRecipe.instructions}</p>
                    </div>
                )}
            </div>

            {/* Shopping List */}
            {menuIds.length > 0 && (
                <button
                    className="shopping-list-button"
                    onClick={() => handleShoppingList()}
                >
                    Shopping List</button>
            )
            }
        </div >
    );
};

export default RecipePanel;
