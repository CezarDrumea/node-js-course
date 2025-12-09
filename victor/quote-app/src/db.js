import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/qoutes_db'
});

export async function query(text, params) {
    return pool.query(text, params);
}