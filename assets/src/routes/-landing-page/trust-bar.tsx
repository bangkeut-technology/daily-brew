import React from 'react';

export function TrustBar() {
    return (
        <section className="py-6">
            <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 place-items-center text-xs text-muted-foreground">
                {['Barista teams', 'Boutique cafés', 'Cloud kitchens', 'Food carts', 'Co-working', 'Retail'].map(
                    (label) => (
                        <span key={label} className="rounded-md border px-3 py-1">
                            {label}
                        </span>
                    ),
                )}
            </div>
        </section>
    );
}
