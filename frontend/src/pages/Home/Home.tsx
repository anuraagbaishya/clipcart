import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clipcart from "../../assets/clipcart.png";
import "./Home.css";

export default function Home() {
    const [url, setUrl] = useState("");
    const navigate = useNavigate();

    const handleExtract = async () => {
        if (!url.trim()) return;

        try {
            const res = await fetch("/api/recipe/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) throw new Error("Extraction failed");

            const { recipeId } = await res.json();
            navigate(`/recipes?selected=${recipeId}`);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch recipe.");
        }
    };

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
                    placeholder="Enter recipe URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                />
                <button className="add-button" onClick={handleExtract}>
                    +
                </button>
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
