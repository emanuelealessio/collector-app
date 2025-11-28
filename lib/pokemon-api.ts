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
    // We sort by price descending to ensure we see the most valuable cards first
    // We also increase pageSize to 100 to get a better spread
    // OPTIMIZATION: We only fetch the fields we need to reduce payload size
    const response = await fetch(`${API_URL}?q=name:"${query}*"&orderBy=-tcgplayer.prices.holofoil.market&pageSize=100&select=id,name,images,tcgplayer,set`);

    if (!response.ok) {
        throw new Error('Failed to fetch cards');
    }

    const data = await response.json();
    return data.data;
}

export async function getPokemonNames(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    // We fetch a small number of cards matching the name to get suggestions
    // Increased to 10 to provide better variety
    const response = await fetch(`${API_URL}?q=name:"${query}*"&pageSize=10&select=name`);
    if (!response.ok) return [];

    const data = await response.json();
    // Deduplicate names and sort them
    const names = Array.from(new Set(data.data.map((c: any) => c.name))).sort();
    return names as string[];
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
