import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clipcart from "../../assets/clipcart.png";
import "./AddRecipe.css";

export default function AddRecipe() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([""]);
    const [instructions, setInstructions] = useState("");

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => setIngredients([...ingredients, ""]);
    const removeIngredient = (index: number) =>
        setIngredients(ingredients.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newRecipe = {
            "title": title,
            "ingredients": ingredients,
            "instructions": instructions,
        };

        console.log(newRecipe)

        const res = await fetch("/api/recipe/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRecipe),
        });

        if (!res.ok) throw new Error("Extraction failed");

        const { recipeId } = await res.json();
        navigate(`/recipes?selected=${recipeId}`);
    };

    return (
        <div className="add-recipe-page">
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
            <div className="add-recipe-container">
                <h2>Add New Recipe</h2>
                <form className="add-recipe-form" onSubmit={handleSubmit}>
                    {/* Title */}
                    <label>
                        Title:
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </label>

                    {/* Ingredients */}
                    <label>
                        Ingredients:
                        <div className="ingredients-list">
                            {ingredients.map((ing, idx) => (
                                <div key={idx} className="ingredient-row">
                                    <input
                                        type="text"
                                        value={ing}
                                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                                        placeholder={`Ingredient ${idx + 1}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="remove-ingredient"
                                        onClick={() => removeIngredient(idx)}
                                        disabled={ingredients.length === 1}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="add-ingredient" onClick={addIngredient}>
                            Add Ingredient
                        </button>
                    </label>

                    {/* Instructions */}
                    <label>
                        Instructions:
                        <textarea className="instructions-textarea"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto"; // reset height
                                target.style.height = target.scrollHeight + "px"; // expand to fit content
                            }}
                            placeholder="Write instructions here..."
                            rows={6}
                            required
                        />
                    </label>

                    <button type="submit" className="submit-recipe">
                        Save Recipe
                    </button>
                </form>
            </div>
        </div>

    );
}
