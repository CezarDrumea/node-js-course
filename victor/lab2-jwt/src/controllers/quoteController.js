import * as Quote from '../models/quoteModel.js'

export async function listQuotes(req, res, next) {
    try {
        const quotes = await Quote.getAllQuotes()
        res.render('quotes/index', { quotes , error:null })
    } catch (err) {
        next(err)
    }
}

export async function showQuote(req, res, next) {
    try {
        const { id } = req.params;
        const quote = await Quote.getQuoteById(id)
        res.render('quotes/show', { quote, error:null })
    } catch (err) {
        next(err)
    }
}

export function showCreateForm(req, res) {
    res.render('quotes/new');
}

export async function createQuote(req, res, next) {
    try {
        const { text, author, source, type } = req.body;
        if (validateField(text) === -1 && validateField(source) === -1 && validateField(type) === -1) {
            return res.status(400).json({ error: "something is required" });
        }
        await Quote.createQuote({ text: text.trim(), author: author.trim(), source: source.trim(), type: type.trim() })
        res.status(201).redirect('/quotes')
    } catch (err) {
        next(err)
    }
}

function validateField(field) {
    if (!field || typeof field.trim() !== 'string' || field.trim().length < 1) {
        return -1;
    }
    return field
}

export async function showEditForm(req, res, next) {
    try {
        const quote = await Quote.getQuoteById(req.params.id)
        res.render('quotes/edit', { quote })
    } catch (err) {
        next(err)
    }
}

export async function updateQuote(req, res, next) {
    try {
        const { id } = req.params
        const { text, author, source, type } = req.body;
        await Quote.updateQuote(id, { text: text.trim(), author: author.trim(), source: source.trim(), type: type.trim() })
        res.redirect(`/quotes/${id}`)
    } catch (err) {
        next(err)
    }
}

export async function deleteQuote(req, res, next) {
    try {
        await Quote.deleteQuote(req.params.id)
        res.redirect('/quotes')
    } catch (err) {
        next(err)
    }
}