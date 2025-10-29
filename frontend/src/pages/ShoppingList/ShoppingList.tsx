import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "../../components/TopBar/TopBar";
import { GenerateListModal } from "../../components/ShoppingListPanel/GenerateListModal";
import { ShoppingListPanel } from "../../components/ShoppingListPanel/ShoppingListPanel";
import { ShoppingListCard } from "../../components/ShoppingListPanel/ShoppingListCard";
import type { ShoppingList, ShoppingListItem } from "../../types";
import "./ShoppingList.css"

export default function ShoppingListPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const itemsFromState: ShoppingListItem[] = (location.state?.items?.items ?? []).map(
        (i: ShoppingListItem) => ({
            name: i.name,
            checked: i.checked ?? false,
        })
    );

    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
    const [showModal, setShowModal] = useState(location.state?.openModal || false);
    const [newListName, setNewListName] = useState("");
    const [selectedExisting, setSelectedExisting] = useState("");
    const [modalItems] = useState<ShoppingListItem[]>(itemsFromState);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch("/api/shopping_lists");
                const data = await res.json();

                const lists: ShoppingList[] = data.lists.map((l: any) => ({
                    ...l,
                    id: l._id  // normalize
                }));


                setShoppingLists(lists);
            } catch (err) {
                console.error("Failed to fetch shopping lists:", err);
            }
        };
        fetchLists();
    }, []);

    useEffect(() => {
        if (location.state?.openModal) {
            // Remove state so it doesn't reopen on reload / back navigation
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate]);


    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        const newList: ShoppingList = {
            name: newListName,
            items: modalItems.map(i => ({ ...i, checked: false }))
        };

        try {
            const res = await fetch("/api/shopping_list/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newList)
            });

            if (!res.ok) {
                console.log("Shopping list creation failed: ")
            }

            const data = await res.json()

            const savedList = {
                ...newList, id: data["_id"]
            }

            setShoppingLists(prev => [...prev, savedList]);
            setSelectedList(newList); // now panel slides in
            setShowModal(false);
        } catch (err) {
            console.log("Shopping list creation failed: ", err)
        }
    };

    const handleSelectExisting = () => {
        const existing = shoppingLists.find(l => l.id === selectedExisting);
        if (existing) {
            const updatedItems = [
                ...existing.items, // keep all existing items
                ...modalItems
                    .filter(mi => !existing.items.some(ei => ei.name === mi.name)) // only new items
                    .map(i => ({ ...i, checked: false })), // reset checked
            ];

            const updatedList: ShoppingList = { ...existing, items: updatedItems };
            setSelectedList(updatedList);

            updateShoppingList(updatedList)
        }
        setShowModal(false);
    };

    const updateShoppingList = async (updatedList: ShoppingList) => {
        try {
            const res = await fetch("/api/shopping_list/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedList),
            });
            if (!res.ok) throw new Error("Failed to save shopping list");
            console.log("Shopping list saved!");
        } catch (err) {
            console.error("Error saving shopping list:", err);
        }
    };

    const handleDeleteList = async (id?: string) => {
        console.log(id)
        if (!id) return;

        try {
            const res = await fetch(`/api/shopping_list/delete?id=${id}`, {
                method: "DELETE"
            })

            if (!res.ok) console.log("Delete failed");
        } catch (err) {
            console.log("Delete failed", err);
        }

        setShoppingLists(prev => prev.filter(l => l.id !== id));
        if (selectedList?.id === id) setSelectedList(null);
    }
    return (
        <div className="shopping-list-page">
            <TopBar />

            <GenerateListModal
                show={showModal}
                shoppingLists={shoppingLists} // pass fetched lists here
                newListName={newListName}
                setNewListName={setNewListName}
                selectedExisting={selectedExisting}
                setSelectedExisting={setSelectedExisting}
                handleCreateList={handleCreateList}
                handleSelectExisting={handleSelectExisting}
                onClose={() => setShowModal(false)}
            />

            <div className="shopping-lists-container">
                <h2>Existing Shopping Lists</h2>
                {shoppingLists.length === 0 ? (
                    <p>No shopping lists found.</p>
                ) : (
                    <ul className="shopping-lists">
                        {shoppingLists.map((list) => {
                            return (
                                <ShoppingListCard
                                    key={list.id}
                                    list={list}
                                    isActive={selectedList?.id === list.id}
                                    onClick={() => setSelectedList(list)}
                                    onDelete={() => handleDeleteList(list.id)}
                                />
                            )
                        })}
                    </ul>
                )}
            </div>


            {selectedList && (
                <ShoppingListPanel
                    selectedList={selectedList}
                    setSelectedList={setSelectedList}
                    setShoppingLists={setShoppingLists}
                    shoppingLists={shoppingLists}
                    handleDeleteList={handleDeleteList}
                    handleUpdateList={updateShoppingList}
                />
            )}
        </div>
    );
}
