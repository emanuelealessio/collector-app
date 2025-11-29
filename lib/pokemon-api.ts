import { useState, useEffect } from 'react';

export interface PokemonCard {
    id: string;
    name: string;
    supertype: string;
    images: {
        small: string;
        large: string;
    };
    tcgplayer?: {
        url: string;
        updatedAt: string;
        prices?: {
            holofoil?: {
                market: number;
                low: number;
                high: number;
            };
            reverseHolofoil?: {
                market: number;
                low: number;
                high: number;
            };
            normal?: {
                market: number;
                low: number;
                high: number;
            };
            [key: string]: any;
        };
    };
    set: {
        id: string;
        name: string;
        series: string;
    };
}

const API_URL = 'https://api.pokemontcg.io/v2/cards';

export async function searchCards(query: string): Promise<PokemonCard[]> {
    if (!query) return [];

    // Construct the query to search by name
    // NOTE: Removed 'select' and 'orderBy' parameters as they were causing 404/timeout errors with the API
    // We will sort client-side if necessary, but stability is priority.
    const response = await fetch(`${API_URL}?q=name:"${query}*"&pageSize=100`);

    if (!response.ok) {
        throw new Error('Failed to fetch cards');
    }

    const data = await response.json();
    return data.data;
}

// Cache for Pokemon names
let pokemonNamesCache: string[] | null = null;

export async function getAllPokemonNames(): Promise<string[]> {
    if (pokemonNamesCache) return pokemonNamesCache;

    try {
        // We use PokeAPI for the names list because it's lighter and faster than TCG API for this purpose
        // It gives us all ~1000+ species names in one go
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
        if (!response.ok) return [];

        const data = await response.json();
        // Capitalize names
        pokemonNamesCache = data.results.map((p: any) =>
            p.name.charAt(0).toUpperCase() + p.name.slice(1)
        );
        return pokemonNamesCache || [];
    } catch (error) {
        console.error('Failed to fetch pokemon names:', error);
        return [];
    }
}

export function getCardMarketPrice(card: PokemonCard): number | null {
    if (!card.tcgplayer?.prices) return null;

    // Priority: Holofoil -> Reverse Holofoil -> Normal -> Any other
    // We want the "market" price
    const prices = card.tcgplayer.prices;

    if (prices.holofoil?.market) return prices.holofoil.market;
    if (prices.reverseHolofoil?.market) return prices.reverseHolofoil.market;
    if (prices.normal?.market) return prices.normal.market;

    // Fallback: check first available price
    const firstType = Object.values(prices)[0];
    if (firstType && typeof firstType === 'object' && 'market' in firstType) {
        return (firstType as any).market;
    }

    return null;
}

export function filterValuableCards(cards: PokemonCard[], minPriceUSD: number = 5.0): PokemonCard[] {
    return cards.filter(card => {
        const price = getCardMarketPrice(card);
        return price !== null && price >= minPriceUSD;
    });
}
