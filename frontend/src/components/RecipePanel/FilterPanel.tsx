import React from "react";

interface Props {
    ingredientInput: string;
    setIngredientInput: (s: string) => void;
    ingredientsFilter: string[];
    setIngredientsFilter: React.Dispatch<React.SetStateAction<string[]>>;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    cuisineOptions: string[];
    selectedCuisines: string[];
    setSelectedCuisines: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterPanel: React.FC<Props> = ({
    ingredientInput, setIngredientInput,
    ingredientsFilter, setIngredientsFilter,
    searchTerm, setSearchTerm,
    cuisineOptions,
    selectedCuisines, setSelectedCuisines
}) => (
    <div className="filter-panel">
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
            <p>Filter by cuisine</p>
            <select
                className="filter-panel-select"
                value=""
                onChange={(e) => {
                    const cuisine = e.target.value;
                    if (cuisine && !selectedCuisines.includes(cuisine)) {
                        setSelectedCuisines(prev => [...prev, cuisine]);
                    }
                }}
            >
                <option value="">Select cuisine</option>
                {cuisineOptions.map((cuisine, idx) => (
                    <option key={idx} value={cuisine}>
                        {cuisine}
                    </option>
                ))}
            </select>


            <div className="cuisine-bubbles">
                {selectedCuisines.map((ing, idx) => (
                    <span key={idx} className="bubble">
                        {ing} <button onClick={() => setSelectedCuisines(prev => prev.filter((_, i) => i !== idx))}>×</button>
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
