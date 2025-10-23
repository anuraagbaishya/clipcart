import { useEffect, useRef, useState } from "react";
import type { ShoppingItem } from "../../types";

export function useShoppingListSync(initialItems: ShoppingItem[]) {
    const [items, setItems] = useState<ShoppingItem[]>(initialItems);
    const [dirty, setDirty] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const updateItems = (newItems: ShoppingItem[]) => {
        setItems(newItems);
        setDirty(true);
    };

    const saveToDB = async (itemsToSave: ShoppingItem[]) => {
        try {
            await fetch("/api/shopping_list/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: itemsToSave }),
            });
            setDirty(false);
            console.log("Shopping list saved!");
        } catch (err) {
            console.error("Failed to save shopping list:", err);
        }
    };

    useEffect(() => {
        if (dirty) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => saveToDB(items), 1500);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [items, dirty]);

    useEffect(() => {
        const handleUnload = () => {
            if (dirty) {
                navigator.sendBeacon(
                    "/api/shopping_list",
                    JSON.stringify({ items })
                );
            }
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [items, dirty]);

    return { items, updateItems };
}
