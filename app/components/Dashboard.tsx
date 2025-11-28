'use client';

import { useCollectionStore } from '@/lib/store';
import { getCardMarketPrice } from '@/lib/pokemon-api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { collection, getTotalValue, removeFromCollection } = useCollectionStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch for localStorage
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalValue = getTotalValue();

    if (collection.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <h2 className="text-2xl font-bold text-gray-300 mb-2">Your Collection is Empty</h2>
                <p className="text-gray-400">Start searching for cards to add them here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-blue-800/50 backdrop-blur-sm">
                <h2 className="text-gray-300 text-lg font-medium mb-1">Total Portfolio Value</h2>
                <div className="text-5xl font-bold text-white tracking-tight">
                    ${totalValue.toFixed(2)}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    {collection.length} cards in collection
                </p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-white mb-6">My Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {collection.map((card) => {
                        const price = getCardMarketPrice(card);
                        return (
                            <div key={card.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-colors group">
                                <div className="relative aspect-[2.5/3.5]">
                                    <img
                                        src={card.images.small}
                                        alt={card.name}
                                        className="w-full h-full object-contain bg-gray-900"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => removeFromCollection(card.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transform translate-y-4 group-hover:translate-y-0 transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-white truncate">{card.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-green-400 font-mono font-bold text-xl">
                                            ${price?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
