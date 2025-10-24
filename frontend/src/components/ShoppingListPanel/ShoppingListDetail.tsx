import React from "react";
import type { ShoppingList, ShoppingListItem } from "../../types";

interface Props {
    list: ShoppingList | null;
    isVisible: boolean;
    onClose: () => void;
    onUpdate: (updatedItems: ShoppingListItem[]) => void;

    // New props
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    newItem: string;
    setNewItem: React.Dispatch<React.SetStateAction<string>>;
    addItem: () => void;
    toggleItem: (idx: number) => void;
    deleteItem: (idx: number) => void;
}

export const ShoppingListDetail: React.FC<Props> = ({
    list,
    isVisible,
    onClose,
    isEditing,
    setIsEditing,
    newItem,
    setNewItem,
    addItem,
    toggleItem,
    deleteItem,
}) => {
    if (!list) return null;

    return (
        <div className={`shoppinglist-detail ${isVisible ? "slide-in" : "slide-out"}`}>
            <div className="shoppinglist-detail-inner">
                <button className="close-button" onClick={onClose}>
                    ×
                </button>
                <h2>{list.name}</h2>

                <ul className="checklist">
                    {list.items.map((item, idx) => (
                        <li key={idx} className={item.checked ? "checked" : ""}>
                            {isEditing ? (
                                <>
                                    <span>{item.name}</span>
                                    <button onClick={() => deleteItem(idx)}>✕</button>
                                </>
                            ) : (
                                <div onClick={() => toggleItem(idx)}>
                                    <input type="checkbox" checked={item.checked} readOnly />
                                    <span>{item.name}</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {isEditing && (
                    <div className="add-item-row">
                        <input
                            type="text"
                            placeholder="New item..."
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addItem()}
                        />
                        <button onClick={addItem}>+</button>
                    </div>
                )}

                <div className="button-row">
                    <button onClick={() => setIsEditing((prev) => !prev)}>
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button>Done</button>
                </div>
            </div>
        </div>
    );
};
