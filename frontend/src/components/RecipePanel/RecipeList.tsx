import React from "react";
import type { Recipe, RecipeList as RecipeListType } from "./types";
import RecipeCard from "./RecipeCard";

interface Props {
    recipes: RecipeListType;
    selectedRecipe: Recipe | null;
    onSelectRecipe: (r: Recipe) => void;
    menuIds: string[];
    toggleMenu: (id: string) => void;
    handleDelete: (id: string) => void;
}

const RecipeList: React.FC<Props> = ({ recipes, selectedRecipe, onSelectRecipe, menuIds, toggleMenu, handleDelete }) => (
    <div className="recipe-list">
        {recipes.recipes.map(r => (
            <RecipeCard
                key={r._id}
                recipe={r}
                selected={selectedRecipe?._id === r._id}
                onSelect={onSelectRecipe}
                menuIds={menuIds}
                toggleMenu={toggleMenu}
                handleDelete={handleDelete}
            />
        ))}
    </div>
);

export default RecipeList;
