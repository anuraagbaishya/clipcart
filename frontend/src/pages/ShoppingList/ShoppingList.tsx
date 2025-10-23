import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clipcart from "../../assets/clipcart.png";
import "./ShoppingList.css";
import { useShoppingListSync } from "./useShoppingListSync";
import type { ShoppingItem } from "../../types";

export default function ShoppingList() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { items?: ShoppingItem[] } | undefined;
    const initialItems = state?.items || [];

    const { items, updateItems } = useShoppingListSync(initialItems);
    const [newItem, setNewItem] = useState("");

    const toggleItem = (name: string) => {
        const updated = items.map((item) =>
            item.name === name ? { ...item, checked: !item.checked } : item
        );
        // move checked items to bottom
        updated.sort((a, b) => Number(a.checked) - Number(b.checked));
        updateItems(updated);
    };

    const addItem = () => {
        const trimmed = newItem.trim();
        if (trimmed && !items.some((i) => i.name === trimmed)) {
            updateItems([{ name: trimmed, checked: false }, ...items]);
            setNewItem("");
        }
    };

    const deleteItem = (name: string) => {
        updateItems(items.filter((i) => i.name !== name));
    };

    return (
        <div className="shopping-list-page">
            <div className="top-bar">
                <div className="top-bar-left">
                    <img src={clipcart} alt="Clipcart Logo" className="logo" />
                    <span>Clipcart</span>
                </div>
                <div className="top-bar-right">
                    <button className="top-bar-button" onClick={() => navigate("/recipes")}>View Recipes</button>
                    <button className="top-bar-button" onClick={() => navigate("/addRecipe")}>Add Recipe</button>
                    <button className="top-bar-button" onClick={() => navigate("/")}>Home</button>
                </div>
            </div>

            <div className="shopping-list-container">
                <h2>Shopping List</h2>

                <div className="add-item">
                    <input
                        type="text"
                        placeholder="Add new item..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                    <button onClick={addItem}>+</button>
                </div>

                {items.length === 0 ? (
                    <p>No items selected.</p>
                ) : (
                    <ul className="shopping-list">
                        {items.map((item) => (
                            <li key={item.name} className={`shopping-item ${item.checked ? "checked" : ""}`}>
                                <div className="shopping-item-left" onClick={() => toggleItem(item.name)}>
                                    <input type="checkbox" checked={item.checked} readOnly />
                                    <span>{item.name}</span>
                                </div>
                                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteItem(item.name); }}>✕</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
