import React, { useState, useEffect } from "react";
import type { Recipe } from "../../types";

interface Props {
    recipe: Recipe | null;
    isVisible: boolean;
    onClose: () => void;
    onUpdate: (updatedRecipe: Recipe) => void;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const RecipeDetail: React.FC<Props> = ({
    recipe,
    isVisible,
    onClose,
    onUpdate,
    isEditing,
    setIsEditing
}) => {
    const [localRecipe, setLocalRecipe] = useState<Recipe | null>(recipe);
    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        setLocalRecipe(recipe);
    }, [recipe]);

    if (!localRecipe) return null;

    const handleIngredientChange = (idx: number, value: string) => {
        const updatedIngredients = [...localRecipe.measuredIngredients];
        updatedIngredients[idx] = value;
        setLocalRecipe({ ...localRecipe, measuredIngredients: updatedIngredients });
    };

    const handleAddIngredient = () => {
        if (!newItem.trim()) return;
        setLocalRecipe({
            ...localRecipe,
            measuredIngredients: [...localRecipe.measuredIngredients, newItem.trim()]
        });
        setNewItem("");
    };

    const handleDeleteIngredient = (idx: number) => {
        const updatedIngredients = [...localRecipe.measuredIngredients];
        updatedIngredients.splice(idx, 1);
        setLocalRecipe({ ...localRecipe, measuredIngredients: updatedIngredients });
    };

    const handleInstructionChange = (value: string) => {
        setLocalRecipe({ ...localRecipe, instructions: value });
    };

    const handleTitleChange = (value: string) => {
        setLocalRecipe({ ...localRecipe, title: value });
    };

    const handleCuisineChange = (value: string) => {
        setLocalRecipe({ ...localRecipe, cuisine: value });
    };

    const handleSave = () => {
        if (localRecipe) onUpdate(localRecipe);
        setIsEditing(false);
    };

    return (
        <div className={`recipe-detail ${isVisible ? "slide-in" : "slide-out"}`}>
            <div className="recipe-detail-inner">
                <button className="close-button" onClick={onClose}>×</button>

                {isEditing ? (
                    <input
                        type="text"
                        value={localRecipe.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="recipe-title-input"
                    />
                ) : (
                    <h2>
                        {localRecipe.url ? (
                            <a href={localRecipe.url} target="_blank" rel="noopener noreferrer">
                                {localRecipe.title}
                            </a>
                        ) : (
                            localRecipe.title
                        )}
                    </h2>
                )}

                <h3>Cuisine</h3>
                {isEditing ? (
                    <input
                        type="text"
                        value={localRecipe.cuisine}
                        onChange={(e) => handleCuisineChange(e.target.value)}
                        className="recipe-cuisine-input"
                    />
                ) : (
                    <p>{recipe?.cuisine}</p>
                )}


                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                    {localRecipe.measuredIngredients.map((i, idx) => (
                        <li key={idx} className={isEditing ? "editing" : ""}>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={i}
                                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                                        style={{ flexGrow: 1, marginRight: "0.5rem" }}
                                    />
                                    <button onClick={() => handleDeleteIngredient(idx)}>✕</button>
                                </>
                            ) : (
                                i
                            )}
                        </li>
                    ))}
                </ul>

                {isEditing && (
                    <div className="add-ingredient-row">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add new ingredient..."
                            style={{ flexGrow: 1 }}
                        />
                        <button onClick={handleAddIngredient}>+</button>
                    </div>
                )}

                <h3>Instructions</h3>
                {isEditing ? (
                    <div className="instructions-edit">
                        <textarea
                            value={localRecipe.instructions}
                            onChange={(e) => handleInstructionChange(e.target.value)}
                            rows={6}
                            style={{ width: "100%" }}
                        />
                    </div>
                ) : (
                    <div className="instructions">
                        {localRecipe.instructions
                            .split("\n")
                            .filter(Boolean)
                            .map((line, idx) => <p key={idx}>{line.trim()}</p>)}
                    </div>
                )}

                <div className="button-row">
                    <button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
