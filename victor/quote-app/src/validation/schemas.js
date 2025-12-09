import { z } from 'zod';

export const quoteSchema = z.object({
    text: z
        .string()
        .trim()
        .min(1, 'Quote text is required'),
    author: z
        .string()
        .trim()
        .min(1, 'Author is required'),
    source: z
        .string()
        .trim()
        .min(1, 'Source is required'),
    type: z
        .enum(['movie', 'book', 'series', 'other'], {
            errorMap: () => ({ message: 'Type must be movie, book, series or other' }),
        }),
});

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, 'Username is required'),
    password: z
        .string()
        .trim()
        .min(1, 'Password is required'),
});