import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clipcart from "../../assets/clipcart.png";
import aiicon from "../../assets/ai.png"
import "./Home.css";

export default function Home() {
    const [urlOrPrompt, setUrlOrPrompt] = useState("");
    const navigate = useNavigate();

    async function recipeRequest(apiUrl: string) {
        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request: urlOrPrompt }),
            });

            if (!res.ok) throw new Error("Extraction failed");

            const { id } = await res.json();
            navigate(`/recipes?selected=${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch recipe.");
        }
    }

    const handleExtractRecipeFromUrl = async () => {
        if (!urlOrPrompt.trim()) return;

        if (!isValidUrl(urlOrPrompt)) {
            alert("Please enter a valid URL");
            return
        }

        recipeRequest("/api/recipe/add_auto")
    };
    const handleGenerateRecipe = async () => {
        if (!urlOrPrompt.trim()) return;
        console.log(urlOrPrompt)
        recipeRequest("/api/recipe/add_auto")
    }

    function isValidUrl(str: string): boolean {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    const handleAddManually = () => navigate("/addRecipe");
    const handleViewRecipes = () => navigate("/recipes");

    return (
        <div className="home-container">
            <div className="home-title">
                <img src={clipcart} alt="Clipcart Logo" className="logo" />
                Clipcart
            </div>

            <div className="home-input-section">
                <input
                    type="text"
                    className="url-input"
                    placeholder="Enter recipe URL or idea..."
                    value={urlOrPrompt}
                    onChange={(e) => setUrlOrPrompt(e.target.value)}
                />
                <div className="primary-buttons">
                    <button className="add-button" onClick={handleExtractRecipeFromUrl}>
                        +
                    </button>
                    <button className="ai-gen-button" onClick={handleGenerateRecipe}>
                        <img src={aiicon} />
                    </button>
                </div>

            </div>

            <div className="action-buttons">
                <button className="secondary-button" onClick={handleAddManually}>
                    Add Manually
                </button>
                <button className="secondary-button" onClick={handleViewRecipes}>
                    View Recipes
                </button>
            </div>
        </div>
    );
}
