import { query } from '../db.js';

export const isNonEmpty = (s) =>
    typeof s === 'string' && s.trim().length > 0;

export async function findUserExact(username, password) {
    if (!isNonEmpty(username) || !isNonEmpty(password)) return null;

    const result = await query(
        `SELECT id, username, password, name
     FROM users
     WHERE username = $1 AND password = $2
     LIMIT 1`,
        [username, password]
    );

    return result.rows[0] || null;
}