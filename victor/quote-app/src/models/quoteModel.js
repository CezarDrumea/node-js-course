import { query } from '../db.js';

export async function getAllQuotes() {
    const result = await query(
        'SELECT id, text, author, source, type FROM quotes ORDER BY id ASC'
    );
    return result.rows;
}

export async function getQuoteById(id) {
    const result = await query(
        'SELECT id, text, author, source, type FROM quotes WHERE id = $1',
        [id]
    );
    return result.rows[0]; // undefined if not found (your controller handles errors)
}

export async function createQuote(quote) {
    const { text, author, source, type } = quote;
    const result = await query(
        `INSERT INTO quotes (text, author, source, type)
     VALUES ($1, $2, $3, $4)
     RETURNING id, text, author, source, type`,
        [text, author, source, type]
    );
    return result.rows[0];
}

export async function updateQuote(id, quote) {
    const { text, author, source, type } = quote;
    const result = await query(
        `UPDATE quotes
     SET text = $1,
         author = $2,
         source = $3,
         type = $4
     WHERE id = $5
     RETURNING id, text, author, source, type`,
        [text, author, source, type, id]
    );
    return result.rows[0];
}

export async function deleteQuote(id) {
    await query('DELETE FROM quotes WHERE id = $1', [id]);
}