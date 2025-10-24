import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../../components/TopBar/TopBar";
import { GenerateListModal } from "../../components/ShoppingListPanel/GenerateListModal";
import { ShoppingListPanel } from "../../components/ShoppingListPanel/ShoppingListPanel";
import { ShoppingListCard } from "../../components/ShoppingListPanel/ShoppingListCard";
import type { ShoppingList, ShoppingListItem } from "../../types";
import "./ShoppingList.css"

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

    const [showModal, setShowModal] = useState(true);
    const [newListName, setNewListName] = useState("");
    const [selectedExisting, setSelectedExisting] = useState("");

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch("/api/shopping_lists");
                const data = await res.json();
                console.log(data)
                setShoppingLists(Array.isArray(data.lists) ? data.lists : []);
            } catch (err) {
                console.error("Failed to fetch shopping lists:", err);
            }
        };
        fetchLists();
    }, []);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        const newList: ShoppingList = {
            name: newListName,
            items: itemsFromState.map(i => ({
                name: typeof i === "string" ? i : i.name,
                checked: false
            }))
        };

        try {
            const res = await fetch("/api/shopping_list/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newList)
            });

            if (!res.ok) {
                console.log("Shopping list creation failed")
            }
        } catch (err) {
            console.error("Failed to fetch shopping lists:", err);
        }

        setShoppingLists(prev => [...prev, newList]);
        setSelectedList(newList);
        setShowModal(false);
    };

    const handleSelectExisting = () => {
        const existing = shoppingLists.find(l => l.id === selectedExisting);
        if (existing) setSelectedList(existing);
        setShowModal(false);
    };

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
            />

            <div className="shopping-lists-container">
                <h2>Existing Shopping Lists</h2>
                {shoppingLists.length === 0 ? (
                    <p>No shopping lists found.</p>
                ) : (
                    <ul className="shopping-lists">
                        {shoppingLists.map((list) => {
                            console.log(list);
                            return (
                                <ShoppingListCard
                                    key={list.id}
                                    list={list}
                                    isActive={selectedList?.id === list.id}
                                    onClick={() => setSelectedList(list)}
                                    onDelete={() =>
                                        setShoppingLists(prev =>
                                            prev.filter(l => l.id !== list.id)
                                        )
                                    }
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
                />
            )}
        </div>
    );
}
