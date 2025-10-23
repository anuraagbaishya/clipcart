import React from "react";
import type { Recipe } from "./types";

interface RecipeCardProps {
    recipe: Recipe;
    selected: boolean;
    onSelect: (r: Recipe) => void;
    menuIds: string[];
    toggleMenu: (id: string) => void;
    handleDelete: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, selected, onSelect, menuIds, toggleMenu, handleDelete }) => (
    <div
        className={`recipe-card ${selected ? "active" : ""}`}
        onClick={() => onSelect(recipe)}
    >
        <span>{recipe.title}</span>
        <div className="recipe-card-buttons">
            <button
                className="menu-button"
                onClick={(e) => { e.stopPropagation(); toggleMenu(recipe._id); }}
            >
                {menuIds.includes(recipe._id) ? "×" : "+"}
            </button>
            <button
                className="delete-button"
                onClick={(e) => { e.stopPropagation(); handleDelete(recipe._id); }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M15 2H9a1 1 0 0 0-1 1v3h8V3a1 1 0 0 0-1-1z"></path>
                </svg>
            </button>
        </div>
    </div>
);

export default RecipeCard;
