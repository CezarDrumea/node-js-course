import * as Quote from '../models/quoteModel.js';
import { quoteSchema } from '../validation/schemas.js';

export async function listQuotes(req, res, next) {
    try {
        const quotes = await Quote.getAllQuotes();
        res.render('quotes/index', { quotes, error: null });
    } catch (err) {
        next(err);
    }
}

export async function showQuote(req, res, next) {
    try {
        const { id } = req.params;
        const quote = await Quote.getQuoteById(id);
        res.render('quotes/show', { quote, error: null });
    } catch (err) {
        next(err);
    }
}

export function showCreateForm(req, res) {
    res.render('quotes/new', { error: null });
}

export async function createQuote(req, res, next) {
    try {
        const parsed = quoteSchema.safeParse(req.body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || 'Invalid data';
            return res.status(400).render('quotes/new', { error: message });
        }

        const { text, author, source, type } = parsed.data;

        await Quote.createQuote({ text, author, source, type });
        res.status(201).redirect('/quotes');
    } catch (err) {
        next(err);
    }
}

export async function showEditForm(req, res, next) {
    try {
        const quote = await Quote.getQuoteById(req.params.id);
        res.render('quotes/edit', { quote, error: null });
    } catch (err) {
        next(err);
    }
}

export async function updateQuote(req, res, next) {
    try {
        const { id } = req.params;

        const parsed = quoteSchema.safeParse(req.body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || 'Invalid data';
            const quote = await Quote.getQuoteById(id); // to refill form
            return res.status(400).render('quotes/edit', {
                quote,
                error: message,
            });
        }

        const { text, author, source, type } = parsed.data;

        await Quote.updateQuote(id, { text, author, source, type });
        res.redirect(`/quotes/${id}`);
    } catch (err) {
        next(err);
    }
}

export async function deleteQuote(req, res, next) {
    try {
        await Quote.deleteQuote(req.params.id);
        res.redirect('/quotes');
    } catch (err) {
        next(err);
    }
}