import React, { useState } from "react";
import type { ShoppingList } from "../../types";

interface Props {
    list: ShoppingList | null;
    isVisible: boolean;
    onClose: () => void;
    onUpdate: (updatedItems: ShoppingList) => void;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    newItem: string;
    setNewItem: React.Dispatch<React.SetStateAction<string>>;
    addItem: () => void;
    toggleItem: (idx: number) => void;
    deleteItem: (idx: number) => void;
    handleDeleteList: (id?: string) => Promise<void>;

}

export const ShoppingListDetail: React.FC<Props> = ({
    list,
    isVisible,
    onClose,
    onUpdate,
    isEditing,
    setIsEditing,
    newItem,
    setNewItem,
    addItem,
    toggleItem,
    deleteItem,
    handleDeleteList
}) => {
    const [showConfirm, setShowConfirm] = useState(false)

    return (
        <>
            <div className={`shoppinglist-detail ${isVisible ? "slide-in" : "slide-out"}`}>
                {list && (
                    <div className="shoppinglist-detail-inner">
                        <button className="close-button" onClick={onClose}>
                            ×
                        </button>
                        <h2>{list.name}</h2>

                        <ul className="checklist">
                            {list.items.map((item, idx) => (
                                <li
                                    key={idx}
                                    className={`${item.checked ? "checked" : ""} ${isEditing ? "editing" : ""}`}
                                >
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const updatedItems = [...list.items];
                                                    updatedItems[idx].name = e.target.value;
                                                    onUpdate(list);
                                                }}
                                                style={{ flexGrow: 1, marginRight: "0.5rem" }}
                                            />
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
                            <button onClick={() => {
                                console.log("Show confirm clicked");
                                setShowConfirm(true);
                            }}>Done</button>
                        </div>

                    </div>
                )}
            </div>

            {
                showConfirm && (
                    <>
                        <div className="confirm-overlay" onClick={() => setShowConfirm(false)} />
                        <div className="confirm-modal">
                            {list && (
                                <p>
                                    Clicking <strong>Done</strong> will <strong>delete this list permanently</strong>.{" "}
                                    {list.items.filter(item => !item.checked).length > 0 && (
                                        <>You still have <strong>{list.items.filter(item => !item.checked).length}</strong> incomplete {list.items.filter(item => !item.checked).length === 1 ? "item" : "items"}.</>
                                    )}
                                </p>
                            )}
                            <div className="confirm-actions">
                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        {
                                            list && (handleDeleteList(list.id))
                                        }
                                        onClose();
                                    }}
                                >
                                    Yes
                                </button>
                                <button onClick={() => setShowConfirm(false)}>Cancel</button>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
};
