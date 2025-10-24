import React from "react";
import type { ShoppingList } from "../../types";

interface Props {
    list: ShoppingList;
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
}

export const ShoppingListCard: React.FC<Props> = ({ list, isActive, onClick, onDelete }) => (
    <li
        className={`shopping-list-card ${isActive ? "active" : ""}`}
        onClick={onClick}
    >
        <div className="shopping-list-card-main">
            <span className="list-name">{list.name}</span>
            <span className="list-progress">
                {list.items.filter((i) => i.checked).length}/{list.items.length} shopped
            </span>
        </div>

        <div className="shopping-list-card-buttons">
            <button
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                ✕
            </button>
        </div>
    </li>
);
