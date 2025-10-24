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
    selectedList,
    setSelectedList,
    setShoppingLists,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [showDetail, setShowDetail] = useState(false);

    const updateItems = (updatedItems: ShoppingListItem[]) => {
        if (!selectedList) return;
        const updatedList = { ...selectedList, items: updatedItems };
        setSelectedList(updatedList);
        setShoppingLists(prev =>
            prev.map(l => (l.id === updatedList.id ? updatedList : l))
        );
    };

    const addItem = () => {
        if (!newItem.trim() || !selectedList) return;
        updateItems([...selectedList.items, { name: newItem.trim(), checked: false }]);
        setNewItem("");
    };

    const deleteItem = (idx: number) => {
        if (!selectedList) return;
        const updated = selectedList.items.filter((_, i) => i !== idx);
        updateItems(updated);
    };

    const toggleItem = (idx: number) => {
        if (!selectedList) return;
        const updated = [...selectedList.items];
        updated[idx].checked = !updated[idx].checked;
        updateItems(updated);
    };

    const handleClose = () => {
        setShowDetail(false);
        setTimeout(() => setSelectedList(null), 300); // wait for slide-out
    };

    // Whenever a new list is selected, show the panel
    React.useEffect(() => {
        if (selectedList) setShowDetail(true);
    }, [selectedList]);

    return (
        <ShoppingListDetail
            list={selectedList}
            isVisible={showDetail}
            onClose={handleClose}
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
