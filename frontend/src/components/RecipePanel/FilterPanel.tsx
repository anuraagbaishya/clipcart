import React from "react";

interface Props {
    favoritesOnly: boolean;
    setFavoritesOnly: (b: boolean) => void;
    ingredientInput: string;
    setIngredientInput: (s: string) => void;
    ingredientsFilter: string[];
    setIngredientsFilter: React.Dispatch<React.SetStateAction<string[]>>;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
}

const FilterPanel: React.FC<Props> = ({
    favoritesOnly, setFavoritesOnly,
    ingredientInput, setIngredientInput,
    ingredientsFilter, setIngredientsFilter,
    searchTerm, setSearchTerm
}) => (
    <div className="filter-panel">
        <div className="favorite-checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(e) => setFavoritesOnly(e.target.checked)}
                />{" "}
                Favorites
            </label>
        </div>

        <div className="filter-panel-input">
            <p>Filter by ingredient</p>
            <input
                className="filter-panel-text-input"
                type="text"
                placeholder="Type ingredient..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && ingredientInput.trim() !== "") {
                        setIngredientsFilter(prev => [...prev, ingredientInput.trim()]);
                        setIngredientInput("");
                    }
                }}
            />
            <div className="ingredient-bubbles">
                {ingredientsFilter.map((ing, idx) => (
                    <span key={idx} className="bubble">
                        {ing} <button onClick={() => setIngredientsFilter(prev => prev.filter((_, i) => i !== idx))}>×</button>
                    </span>
                ))}
            </div>
        </div>

        <div className="filter-panel-input">
            <p>Search by Title</p>
            <input
                className="filter-panel-text-input"
                type="text"
                placeholder="Search title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    </div>
);

export default FilterPanel;
