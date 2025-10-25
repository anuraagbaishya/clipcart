import React, { useState, useEffect } from "react";
import type { ShoppingList } from "../../types";
import { ShoppingListDetail } from "./ShoppingListDetail";
import { useShoppingListSync } from "./useShoppingListSync"; // adjust import path if needed
import "./ShoppingListPanel.css";

interface Props {
    shoppingLists: ShoppingList[];
    selectedList: ShoppingList | null;
    setSelectedList: React.Dispatch<React.SetStateAction<ShoppingList | null>>;
    setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
    handleDeleteList: (id?: string) => Promise<void>;
}

export const ShoppingListPanel: React.FC<Props> = ({
    selectedList,
    setSelectedList,
    setShoppingLists,
    handleDeleteList
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [showDetail, setShowDetail] = useState(false);

    // Integrate the hook
    const { items, updateItems, setItemsDirect } = useShoppingListSync(
        selectedList?.id ?? null,
        selectedList?.items ?? []
    );

    // Sync hook’s items with selectedList (UI consistency)
    useEffect(() => {
        if (selectedList?.id) {
            setItemsDirect(selectedList.items);
        }
    }, [selectedList?.id]);

    // Keep parent state (shoppingLists) in sync when items change
    useEffect(() => {
        if (!selectedList) return;
        const updatedList = { ...selectedList, items };
        setSelectedList(updatedList);
        setShoppingLists(prev =>
            prev.map(l => (l.id === updatedList.id ? updatedList : l))
        );
    }, [items, selectedList, setSelectedList, setShoppingLists]);

    const addItem = () => {
        console.log(newItem)
        if (!newItem.trim()) return;
        updateItems([...items, { name: newItem.trim(), checked: false }]);
        console.log(items)
        setNewItem("");
    };

    const deleteItem = (idx: number) => {
        updateItems(items.filter((_, i) => i !== idx));
    };

    const toggleItem = (idx: number) => {
        const updated = [...items];
        updated[idx].checked = !updated[idx].checked;
        updateItems(updated);
    };

    const handleClose = () => {
        setShowDetail(false);
        setTimeout(() => setSelectedList(null), 300); // wait for slide-out
    };

    // Whenever a new list is selected, show the panel
    useEffect(() => {
        if (selectedList) setShowDetail(true);
    }, [selectedList]);

    return (
        <ShoppingListDetail
            list={selectedList ? { ...selectedList, items } : null}
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
            handleDeleteList={handleDeleteList}
        />
    );
};
