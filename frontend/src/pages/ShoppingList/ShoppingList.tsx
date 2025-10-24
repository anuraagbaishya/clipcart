import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../../components/TopBar/TopBar";
import { GenerateListModal } from "../../components/ShoppingListPanel/GenerateListModal";
import { ShoppingListPanel } from "../../components/ShoppingListPanel/ShoppingListPanel";
import type { ShoppingList, ShoppingListItem } from "../../types";

export default function ShoppingListPage() {
    const location = useLocation();
    const itemsFromState: ShoppingListItem[] = (location.state?.items?.items ?? []).map(
        (i: ShoppingListItem) => ({
            name: i.name,
            checked: i.checked ?? false,
        })
    );

    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
    const [showModal, setShowModal] = useState(itemsFromState.length > 0);
    const [newListName, setNewListName] = useState("");
    // const [modalItems, setModalItems] = useState<ShoppingListItem[]>(itemsFromState);
    const [selectedExisting, setSelectedExisting] = useState("");

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch("/api/shopping_lists");
                const data = await res.json();
                setShoppingLists(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch shopping lists:", err);
            }
        };
        fetchLists();
    }, []);

    const handleCreateList = () => {
        if (!newListName.trim()) return;

        const newList: ShoppingList = {
            id: `list-${Date.now()}`,
            name: newListName,
            items: selectedList?.items ?? [], // use selectedList.items
        };

        setShoppingLists(prev => [...prev, newList]);
        setSelectedList(newList);
        setShowModal(false);
    };

    const handleSelectExisting = () => {
        const existing = shoppingLists.find(l => l.id === selectedExisting);
        if (existing) setSelectedList(existing); // Opens side panel
        setShowModal(false);
    };

    return (
        <div className="shopping-list-page">
            <TopBar />

            <GenerateListModal
                show={showModal}
                shoppingLists={shoppingLists}
                newListName={newListName}
                setNewListName={setNewListName}
                selectedExisting={selectedExisting}
                setSelectedExisting={setSelectedExisting}
                handleCreateList={handleCreateList}
                handleSelectExisting={handleSelectExisting}
            />

            {selectedList && (
                <ShoppingListPanel
                    shoppingLists={shoppingLists}
                    selectedList={selectedList}
                    setSelectedList={setSelectedList}
                    setShoppingLists={setShoppingLists}
                />
            )}
        </div>
    );
}