import { useEffect, useRef, useState } from "react";
import type { ShoppingListItem } from "../../types";

export function useShoppingListSync(
    listId: string | null,
    initialItems: ShoppingListItem[]
) {
    const [items, setItems] = useState<ShoppingListItem[]>(initialItems);
    const [dirty, setDirty] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const lastSavedId = useRef<string | null>(null);

    const updateItems = (newItems: ShoppingListItem[]) => {
        setItems(newItems);
        setDirty(true);
    };

    const saveToDB = async (id: string, itemsToSave: ShoppingListItem[]) => {
        try {
            await fetch("/api/shopping_list/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, items: itemsToSave }),
            });
            setDirty(false);
            console.log(`Shopping list ${id} saved!`);
        } catch (err) {
            console.error("Failed to save shopping list:", err);
        }
    };

    // Debounced save whenever items change
    useEffect(() => {
        if (dirty && listId) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => saveToDB(listId, items), 1500);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [items, dirty, listId]);

    // Save immediately when listId changes or hook unmounts
    useEffect(() => {
        if (lastSavedId.current && dirty) {
            saveToDB(lastSavedId.current, items);
        }
        lastSavedId.current = listId;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listId]);

    // Save when page unloads
    useEffect(() => {
        const handleUnload = () => {
            if (dirty && listId) {
                navigator.sendBeacon(
                    "/api/shopping_list/update",
                    JSON.stringify({ id: listId, items })
                );
            }
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [items, dirty, listId]);

    return { items, updateItems, setItemsDirect: setItems };
}
