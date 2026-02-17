'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    PageHeader,
    EmptyState,
    Modal,
    NavIcons,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';
import { useCategories, useCreateCategory } from '@/lib/hooks';

type ApiCategory = {
    id: string;
    name: string;
    description: string | null;
    min_age: number | null;
    max_age: number | null;
    created_at: string;
};

export default function CategoriesPage() {
    const { data: categories = [], isLoading, error } = useCategories();
    const createCategory = useCreateCategory();
    const toast = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        min_age: '',
        max_age: '',
    });

    const categoryList: ApiCategory[] = Array.isArray(categories) ? (categories as unknown as ApiCategory[]) : [];

    const handleCreate = async () => {
        if (!newCategory.name.trim()) return;
        try {
            await createCategory.mutateAsync({
                name: newCategory.name,
                description: newCategory.description || undefined,
                minAge: newCategory.min_age ? parseInt(newCategory.min_age) : undefined,
                maxAge: newCategory.max_age ? parseInt(newCategory.max_age) : undefined,
            });
            toast.success('Category created successfully');
            setShowCreate(false);
            setNewCategory({ name: '', description: '', min_age: '', max_age: '' });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to create category');
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Categories">
            <div className="space-y-6">
                <PageHeader
                    label="Management"
                    title="Categories"
                    description={`${categoryList.length} categor${categoryList.length !== 1 ? 'ies' : 'y'}`}
                    rightAction={
                        <Button onClick={() => setShowCreate(true)} className="h-10 md:h-9 text-xs">
                            + Add Category
                        </Button>
                    }
                />

                <Modal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    title="Add Category"
                    description="Create an age or skill category"
                >
                    <div className="space-y-4">
                        <Input
                            label="Category Name"
                            placeholder="e.g., U-8 Elite"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                        <Input
                            label="Description"
                            placeholder="Optional description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Min Age"
                                type="number"
                                placeholder="6"
                                value={newCategory.min_age}
                                onChange={(e) => setNewCategory({ ...newCategory, min_age: e.target.value })}
                            />
                            <Input
                                label="Max Age"
                                type="number"
                                placeholder="8"
                                value={newCategory.max_age}
                                onChange={(e) => setNewCategory({ ...newCategory, max_age: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!newCategory.name.trim() || createCategory.isPending}
                                isLoading={createCategory.isPending}
                            >
                                Add Category
                            </Button>
                        </div>
                    </div>
                </Modal>

                {isLoading && (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            <div className="h-2 bg-gray-100 rounded w-1/4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                        Failed to load categories. Please try again.
                    </div>
                )}

                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {categoryList.map((cat) => (
                            <motion.div key={cat.id} variants={fadeUp}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                <NavIcons.Trophy className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{cat.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {(cat.min_age !== null || cat.max_age !== null) && (
                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                            {cat.min_age !== null && cat.max_age !== null
                                                                ? `Ages ${cat.min_age}–${cat.max_age}`
                                                                : cat.min_age !== null
                                                                    ? `Ages ${cat.min_age}+`
                                                                    : `Up to ${cat.max_age}`}
                                                        </span>
                                                    )}
                                                    {cat.description && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400 truncate">
                                                                {cat.description}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {categoryList.length === 0 && !isLoading && (
                            <EmptyState
                                icon={<NavIcons.Trophy />}
                                title="No Categories"
                                description="Create age or skill categories to organize your championships."
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
