const API_URL = 'https://api.pokemontcg.io/v2/cards';

async function testParams() {
    const base = `${API_URL}?q=name:"charizard*"`;

    console.log('--- Test 1: Base Query ---');
    await fetchAndLog(base);

    console.log('\n--- Test 2: With OrderBy ---');
    await fetchAndLog(`${base}&orderBy=-tcgplayer.prices.holofoil.market`);

    console.log('\n--- Test 3: With Select ---');
    await fetchAndLog(`${base}&select=id,name,images,tcgplayer,set`);

    console.log('\n--- Test 4: Combined (Original Failure) ---');
    await fetchAndLog(`${base}&orderBy=-tcgplayer.prices.holofoil.market&select=id,name,images,tcgplayer,set`);
}

async function fetchAndLog(url) {
    try {
        const response = await fetch(url);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            const text = await response.text();
            console.log(`Error Body: ${text}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

testParams();
