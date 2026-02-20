/**
 * Base Mock Repository — PLYAZ League Manager
 * 
 * Provides a base class for all mock repositories using LocalStore.
 */

import { LocalStore } from '@/lib/mock/store';
import { IRepository } from './types';

export abstract class BaseMockRepository<T extends { id: string }> implements IRepository<T> {
    constructor(protected storeKey: string) { }

    async findAll(filters?: Record<string, any>): Promise<T[]> {
        const items = LocalStore.get<T>(this.storeKey);
        if (!filters) return items;

        return items.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                return (item as any)[key] === value;
            });
        });
    }

    async findById(id: string): Promise<T | null> {
        return LocalStore.findOne<T>(this.storeKey, item => item.id === id);
    }

    async create(data: Partial<T>): Promise<T> {
        return LocalStore.addItem(this.storeKey, data as any) as unknown as T;
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const updated = LocalStore.updateItem(this.storeKey, id, data as any);
        if (!updated) throw new Error(`Item with id ${id} not found in ${this.storeKey}`);
        return updated as unknown as T;
    }

    async delete(id: string): Promise<boolean> {
        return LocalStore.deleteItem(this.storeKey, id);
    }
}
