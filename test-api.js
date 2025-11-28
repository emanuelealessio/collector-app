const API_URL = 'https://api.pokemontcg.io/v2/cards';

async function testQuery() {
    const query = 'charizard';
    // Try to filter by price > 5 for holofoil OR reverseHolofoil OR normal
    // Syntax: (condition1 OR condition2 OR condition3)
    const queryString = `name:"${query}*" (tcgplayer.prices.holofoil.market:[5 TO *] OR tcgplayer.prices.reverseHolofoil.market:[5 TO *] OR tcgplayer.prices.normal.market:[5 TO *])`;

    console.log('Testing query:', queryString);

    const url = `${API_URL}?q=${encodeURIComponent(queryString)}&pageSize=10&select=id,name,tcgplayer`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Count:', data.count);
        if (data.data && data.data.length > 0) {
            console.log('First result:', JSON.stringify(data.data[0], null, 2));
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testQuery();
