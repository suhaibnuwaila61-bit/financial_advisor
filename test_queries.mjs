import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

async function testQueries() {
  try {
    // Test investments list
    const res = await fetch(`${baseUrl}/api/trpc/investments.list`);
    console.log('Investments list status:', res.status);
    const data = await res.json();
    console.log('Investments data:', JSON.stringify(data).substring(0, 200));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testQueries();
