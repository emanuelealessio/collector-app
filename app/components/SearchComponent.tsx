'use client';

import { useState, useEffect, useRef } from 'react';
import { searchCards, filterValuableCards, PokemonCard, getCardMarketPrice, getPokemonNames } from '@/lib/pokemon-api';
import { useCollectionStore } from '@/lib/store';

export default function SearchComponent() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [results, setResults] = useState<PokemonCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { addToCollection, removeFromCollection, isInCollection } = useCollectionStore();

    useEffect(() => {
        // Close suggestions when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length >= 2) {
                const names = await getPokemonNames(query);
                setSuggestions(names);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        // Debounce
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
        if (e) e.preventDefault();
        const q = searchQuery || query;
        if (!q.trim()) return;

        setShowSuggestions(false);
        setLoading(true);
        setError('');
        setResults([]);

        try {
            const cards = await searchCards(q);
            const valuableCards = filterValuableCards(cards, 5.0); // $5 threshold

            if (valuableCards.length === 0 && cards.length > 0) {
                setError(`Found ${cards.length} cards, but none are worth more than $5.`);
            } else if (cards.length === 0) {
                setError('No cards found.');
            }

            setResults(valuableCards);
        } catch (err) {
            setError('Failed to fetch cards. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectSuggestion = (name: string) => {
        setQuery(name);
        handleSearch(undefined, name);
    };

    const toggleCollection = (card: PokemonCard) => {
        if (isInCollection(card.id)) {
            removeFromCollection(card.id);
        } else {
            addToCollection(card);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div ref={wrapperRef} className="relative mb-8">
                <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                            placeholder="Search Pokémon (e.g., Charizard)"
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {suggestions.map((name, index) => (
                                    <li
                                        key={index}
                                        onClick={() => selectSuggestion(name)}
                                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                                    >
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-900/30 border border-red-800 text-red-200 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((card) => {
                    const price = getCardMarketPrice(card);
                    const isOwned = isInCollection(card.id);

                    return (
                        <div key={card.id} className={`bg-gray-800 rounded-xl overflow-hidden border ${isOwned ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-gray-700'} hover:border-gray-500 transition-all`}>
                            <div className="relative aspect-[2.5/3.5]">
                                <img
                                    src={card.images.small}
                                    alt={card.name}
                                    className="w-full h-full object-contain bg-gray-900"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-white truncate">{card.name}</h3>
                                <p className="text-gray-400 text-sm mb-2">{card.set.name}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-green-400 font-mono font-bold text-xl">
                                        ${price?.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => toggleCollection(card)}
                                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${isOwned
                                                ? 'bg-red-900/50 text-red-200 hover:bg-red-900'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isOwned ? 'Remove' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
