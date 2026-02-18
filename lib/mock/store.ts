/**
 * Mock Storage Utility
 * Simulates a database using localStorage for frontend-only development.
 */

const IS_SERVER = typeof window === 'undefined';

export const LocalStore = {
    get<T>(key: string): T[] {
        if (IS_SERVER) return [];
        const data = localStorage.getItem(`plyaz_${key}`);
        return data ? JSON.parse(data) : [];
    },

    set<T>(key: string, data: T[]): void {
        if (IS_SERVER) return;
        localStorage.setItem(`plyaz_${key}`, JSON.stringify(data));
    },

    addItem<T extends Record<string, any>>(key: string, item: T): T & { id: string; created_at: string; updated_at: string } {
        const items = this.get<any>(key);
        const newItem = {
            ...item,
            id: item.id || crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        items.push(newItem);
        this.set(key, items);
        return newItem as any;
    },

    updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
        const items = this.get<T>(key);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        const updatedItem = {
            ...items[index],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        items[index] = updatedItem;
        this.set(key, items);
        return updatedItem;
    },

    deleteItem(key: string, id: string): boolean {
        const items = this.get<any>(key);
        const filtered = items.filter((item: any) => item.id !== id);
        if (filtered.length === items.length) return false;
        this.set(key, filtered);
        return true;
    },

    find<T>(key: string, predicate: (item: T) => boolean): T[] {
        return this.get<T>(key).filter(predicate);
    },

    findOne<T>(key: string, predicate: (item: T) => boolean): T | null {
        return this.get<T>(key).find(predicate) || null;
    }
};
