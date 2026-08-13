// URL do seu Web App no Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzTFQSghz7va0BMPNj2HJ1mctEiZw8uqEssLTpvtQp4XBzueWKVmkYhFjxR9UvPozUGuQ/exec';

async function loginApi(username, password) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ username, password })
    });
    return await response.json();
}