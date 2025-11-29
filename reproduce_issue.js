// Using native fetch in Node.js

// The exact URL from the user's log
const urlWithOrderBy = 'https://api.pokemontcg.io/v2/cards?q=name:%22Ninetales-alola*%22&orderBy=-tcgplayer.prices.holofoil.market&pageSize=100';
const urlWithoutOrderBy = 'https://api.pokemontcg.io/v2/cards?q=name:%22Ninetales-alola*%22&pageSize=100';

async function testUrl(name, url) {
    console.log(`Testing ${name}...`);
    console.log(`URL: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, response.headers.raw ? response.headers.raw() : response.headers);

        if (!response.ok) {
            const text = await response.text();
            console.log(`Error Body: ${text.substring(0, 200)}...`);
        } else {
            const data = await response.json();
            console.log(`Success! Found ${data.data.length} cards.`);
        }
    } catch (error) {
        console.error(`Network Error: ${error.message}`);
    }
    console.log('-----------------------------------');
}

async function runTests() {
    await testUrl('With OrderBy (User Query)', urlWithOrderBy);
    await testUrl('Without OrderBy', urlWithoutOrderBy);
}

runTests();
