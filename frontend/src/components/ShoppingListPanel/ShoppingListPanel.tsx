import React, { useState } from "react";
import type { ShoppingList, ShoppingListItem } from "../../types";
import { ShoppingListDetail } from "./ShoppingListDetail";
import "./ShoppingListPanel.css";

interface Props {
    shoppingLists: ShoppingList[];
    selectedList: ShoppingList | null;
    setSelectedList: React.Dispatch<React.SetStateAction<ShoppingList | null>>;
    setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
}

export const ShoppingListPanel: React.FC<Props> = ({
    // shoppingLists,
    selectedList,
    setSelectedList,
    setShoppingLists,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState("");

    if (!selectedList) return null;

    const updateItems = (updatedItems: ShoppingListItem[]) => {
        console.log("DEBUG: Updating items:", updatedItems);
        const updatedList = { ...selectedList, items: updatedItems };
        setSelectedList(updatedList);
        setShoppingLists(prev =>
            prev.map(l => (l.id === updatedList.id ? updatedList : l))
        );
    };

    const addItem = () => {
        if (!newItem.trim()) return;
        updateItems([...selectedList.items, { name: newItem.trim(), checked: false }]);
        setNewItem("");
    };

    const deleteItem = (idx: number) => {
        const updated = selectedList.items.filter((_, i) => i !== idx);
        updateItems(updated);
    };

    const toggleItem = (idx: number) => {
        const updated = [...selectedList.items];
        updated[idx].checked = !updated[idx].checked;
        updateItems(updated);
    };

    return (
        <ShoppingListDetail
            list={selectedList}
            isVisible={!!selectedList}
            onClose={() => setSelectedList(null)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            newItem={newItem}
            setNewItem={setNewItem}
            addItem={addItem}
            toggleItem={toggleItem}
            deleteItem={deleteItem}
            onUpdate={updateItems}
        />
    );
};
