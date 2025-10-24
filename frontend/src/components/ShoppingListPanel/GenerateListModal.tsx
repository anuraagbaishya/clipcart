// GenerateListModal.tsx
import React from "react";
import type { ShoppingList } from "../../types";

interface Props {
    show: boolean;
    shoppingLists: ShoppingList[];
    newListName: string;
    setNewListName: (name: string) => void;
    selectedExisting: string;
    setSelectedExisting: (id: string) => void;
    handleCreateList: () => void;
    handleSelectExisting: () => void;
}

export const GenerateListModal: React.FC<Props> = ({
    show,
    shoppingLists,
    newListName,
    setNewListName,
    selectedExisting,
    setSelectedExisting,
    handleCreateList,
    handleSelectExisting,
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Generate Shopping List</h3>

                <div className="modal-section">
                    <h4>Create New List</h4>
                    <input
                        type="text"
                        placeholder="Enter list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <button onClick={handleCreateList}>Create</button>
                </div>

                <div className="modal-section">
                    <h4>Or Select Existing List</h4>
                    <select
                        value={selectedExisting}
                        onChange={(e) => setSelectedExisting(e.target.value)}
                    >
                        <option value="">Select...</option>
                        {shoppingLists.map((list) => (
                            <option key={list.id} value={list.id}>
                                {list.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSelectExisting} disabled={!selectedExisting}>
                        Open
                    </button>
                </div>
            </div>
        </div>
    );
};
