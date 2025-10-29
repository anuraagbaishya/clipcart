import React, { useState, useEffect } from "react";
import type { ShoppingList, ShoppingListItem } from "../../types";
import { ShoppingListDetail } from "./ShoppingListDetail";
import "./ShoppingListPanel.css";

interface Props {
    shoppingLists: ShoppingList[];
    selectedList: ShoppingList | null;
    setSelectedList: React.Dispatch<React.SetStateAction<ShoppingList | null>>;
    setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
    handleDeleteList: (id?: string) => Promise<void>;
    handleUpdateList: (shoppingList: ShoppingList) => Promise<void>;
    handleSyncList: (shoppingList: ShoppingList) => Promise<void>;
}

export const ShoppingListPanel: React.FC<Props> = ({
    selectedList,
    setSelectedList,
    setShoppingLists,
    handleDeleteList,
    handleUpdateList,
    handleSyncList

}) => {
    const [localList, setLocalList] = useState<ShoppingList | null>(selectedList);
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        setLocalList(selectedList);
        if (selectedList) setShowDetail(true);
    }, [selectedList]);

    const addItem = () => {
        if (!newItem.trim() || !localList) return;
        const updatedItems: ShoppingListItem[] = [
            ...localList.items,
            { name: newItem.trim(), checked: false }
        ];
        handleUpdate({ ...localList, items: updatedItems });
        setNewItem("");
    };

    const deleteItem = (idx: number) => {
        if (!localList) return;
        const updatedItems = localList.items.filter((_, i) => i !== idx);
        handleUpdate({ ...localList, items: updatedItems });
    };

    const toggleItem = (idx: number) => {
        if (!localList) return;
        const updatedItems = [...localList.items];
        updatedItems[idx].checked = !updatedItems[idx].checked;
        handleUpdate({ ...localList, items: updatedItems });
    };

    const handleClose = () => {
        setShowDetail(false);
        setTimeout(() => setSelectedList(null), 300);
    };

    const handleUpdate = (updatedList: ShoppingList) => {
        setLocalList(updatedList);
        setSelectedList(updatedList);
        setShoppingLists(prev =>
            prev.map(l => (l.id === updatedList.id ? updatedList : l))
        );
        handleUpdateList(updatedList)
    }

    if (!localList) return null;

    return (
        <ShoppingListDetail
            list={localList}
            isVisible={showDetail}
            onClose={handleClose}
            onUpdate={handleUpdate}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            newItem={newItem}
            setNewItem={setNewItem}
            addItem={addItem}
            toggleItem={toggleItem}
            deleteItem={deleteItem}
            handleDeleteList={handleDeleteList}
            handleSyncList={handleSyncList}
        />
    );
};
