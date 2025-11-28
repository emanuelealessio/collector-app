import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PokemonCard, getCardMarketPrice } from './pokemon-api';

interface CollectionState {
    collection: PokemonCard[];
    addToCollection: (card: PokemonCard) => void;
    removeFromCollection: (cardId: string) => void;
    isInCollection: (cardId: string) => boolean;
    getTotalValue: () => number;
}

export const useCollectionStore = create<CollectionState>()(
    persist(
        (set, get) => ({
            collection: [],
            addToCollection: (card) => {
                const { collection } = get();
                if (!collection.find((c) => c.id === card.id)) {
                    set({ collection: [...collection, card] });
                }
            },
            removeFromCollection: (cardId) => {
                set({ collection: get().collection.filter((c) => c.id !== cardId) });
            },
            isInCollection: (cardId) => {
                return !!get().collection.find((c) => c.id === cardId);
            },
            getTotalValue: () => {
                return get().collection.reduce((total, card) => {
                    const price = getCardMarketPrice(card) || 0;
                    return total + price;
                }, 0);
            },
        }),
        {
            name: 'collector-storage', // unique name for localStorage key
        }
    )
);
