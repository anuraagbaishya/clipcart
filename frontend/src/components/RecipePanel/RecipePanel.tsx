import { useEffect, useRef, useState } from "react";
import "./RecipePanel.css";

export interface Recipe {
    _id: string;
    title: string;
    url: string;
    ingredients: string[];
    measuredIngredients: string[];
    instructions: string;
}

interface RecipePanelProps {
    recipes: Recipe[];
    selectedRecipe: Recipe | null;
    onSelectRecipe: (recipe: Recipe | null) => void;
}

export default function RecipePanel({
    recipes,
    selectedRecipe,
    onSelectRecipe,
}: RecipePanelProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [showPanel, setShowPanel] = useState(false);

    // Trigger slide-in animation whenever selectedRecipe changes
    useEffect(() => {
        if (selectedRecipe) {
            setShowPanel(true);
            document.body.classList.add("overlay-open"); // prevent page scroll
        } else {
            setShowPanel(false);
            document.body.classList.remove("overlay-open");
        }
    }, [selectedRecipe]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                onSelectRecipe(null);
            }
        };

        if (selectedRecipe) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedRecipe, onSelectRecipe]);

    return (
        <div className="recipe-panel-wrapper">
            {/* Recipe list */}
            <div className="recipe-list">
                {recipes.map((r) => (
                    <div
                        key={r._id}
                        className={`recipe-card ${selectedRecipe?._id === r._id ? "active" : ""}`}
                        onClick={() => onSelectRecipe(r)}
                    >
                        {r.title}
                    </div>
                ))}
            </div>

            {/* Slide-in overlay panel */}
            {selectedRecipe && (
                <div
                    ref={overlayRef}
                    className={`recipe-detail ${showPanel ? "slide-in" : ""}`}
                >
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
                </div>
            )}
        </div>
    );
}
