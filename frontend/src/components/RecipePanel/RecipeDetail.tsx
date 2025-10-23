import React from "react";
import type { Recipe } from "../../types";

interface Props {
    recipe: Recipe | null;
    isVisible: boolean;
    onClose: () => void;
}

const RecipeDetail: React.FC<Props> = ({ recipe, isVisible, onClose }) => (
    <div className={`recipe-detail ${isVisible ? "slide-in" : "slide-out"}`}>
        {recipe && (
            <div className="recipe-detail-inner">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{recipe.title}</h2>
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                    {recipe.measuredIngredients.map((i, idx) => <li key={idx}>{i}</li>)}
                </ul>
                <h3>Instructions</h3>
                <div className="instructions-list">
                    {recipe.instructions
                        .split("\n")
                        .filter(Boolean)
                        .map((sentence, idx) => <p key={idx}>{sentence.trim()}</p>)
                    }
                </div>
            </div>
        )}
    </div>
);

export default RecipeDetail;
