import clipcart from "../../assets/clipcart.png";
import { useNavigate } from "react-router-dom";
import "./TopBar.css"

export const TopBar = () => {
    const navigate = useNavigate();
    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <img src={clipcart} alt="Clipcart Logo" className="logo" />
                <span>Clipcart</span>
            </div>
            <div className="top-bar-right">
                <button className="top-bar-button" onClick={() => navigate("/recipes")}>
                    View Recipes
                </button>
                <button className="top-bar-button" onClick={() => navigate("/")}>
                    Add Recipe
                </button>
            </div>
        </div>
    );
};
