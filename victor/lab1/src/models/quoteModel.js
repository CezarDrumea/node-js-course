import axios from 'axios';

const API_URL = 'http://localhost:3001';
const api = axios.create({baseURL: API_URL});

export async function getAllQuotes() {
    const { data } = await api.get('/quotes');
    return data;
}

export async function getQuoteById(id) {
    const { data } = await api.get(`/quotes/${ id }`);
    return data;
}

export async function createQuote(quote) {
    const { data } = await api.post('/quotes', quote);
    return data;
}

export async function updateQuote(id, quote) {
    const { data } = await api.put(`/quotes/${ id }`, quote);
    return data;
}

export async function deleteQuote(id) {
    await axios.delete(`/quotes/${ id }`);
}