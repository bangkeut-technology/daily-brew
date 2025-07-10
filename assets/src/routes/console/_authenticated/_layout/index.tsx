import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CategoryShare } from '@/components/category-share';
import { ProductShare } from '@/components/product-share';
import { CategoryBarStacked } from '@/components/category-bar-stacked';
import { ProductBarStacked } from '@/components/product-bar-stacked';

export const Route = createFileRoute('/console/_authenticated/_layout/')({
    component: Index,
});

function Index() {
    return (
        <div className="w-full space-y-2">
            <div className="flex flex-row space-x-2 items-center justify-center">
                <CategoryShare />
                <ProductShare />
            </div>
            <div className="flex flex-row space-x-2 items-center justify-center">
                <CategoryBarStacked />
                <ProductBarStacked />
            </div>
        </div>
    );
}
