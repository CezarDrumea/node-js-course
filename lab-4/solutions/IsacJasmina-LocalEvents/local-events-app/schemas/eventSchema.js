import { z } from "zod";

export const eventSchema = z.object({
  title: z.string()
    .min(3, "Titlul trebuie să aibă minim 3 caractere.")
    .max(100, "Titlul nu poate depăși 100 de caractere."),
  
  description: z
    .string()
    .min(10, "Descrierea trebuie să aibă minim 10 caractere.")
    .max(1000, "Descrierea nu poate depăși 1000 de caractere."),

  date: z.string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Data trebuie să fie validă (YYYY-MM-DD)."
    ),

  time: z.string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Ora trebuie să fie validă (HH:MM, 24h)."
    ),

  location: z.string()
    .min(3, "Locația trebuie să aibă minim 3 caractere.")
    .max(200, "Locația nu poate depăși 200 de caractere."),

  categoryId: z.string()
    .min(1, "Categoria este obligatorie."),

  organizer: z.string()
    .min(3, "Numele organizatorului trebuie să aibă minim 3 caractere.")
    .max(100, "Numele organizatorului nu poate depăși 100 de caractere."),

  price: z.string()
  .min(1, "Prețul este obligatoriu.")
  .refine(
    (val) => {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === "gratuit" || trimmed === "free") return true;
      
      const priceRegex = /^\d+(\.\d{1,2})?\s+(mdl|lei|eur|usd|ron|gbp|chf)$/i;
      return priceRegex.test(trimmed);
    },
    "Prețul trebuie să fie: număr + monedă (ex: 100 MDL, 20 Lei, 11.50 EUR) sau 'Gratuit'."
  ),
}).refine(
  (data) => {
    const eventDateTime = new Date(`${data.date}T${data.time}:00`);
    return eventDateTime > new Date();
  },
  {
    message: "Evenimentul nu poate avea data și ora în trecut.",
    path: ["date", "time"],
  }
);

export const eventEditSchema = z.object({
  title: z.string()
    .min(3, "Titlul trebuie să aibă minim 3 caractere.")
    .max(100, "Titlul nu poate depăși 100 de caractere."),
  
  description: z
    .string()
    .min(10, "Descrierea trebuie să aibă minim 10 caractere.")
    .max(1000, "Descrierea nu poate depăși 1000 de caractere."),

  date: z.string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Data trebuie să fie validă (YYYY-MM-DD)."
    ),

  time: z.string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Ora trebuie să fie validă (HH:MM, 24h)."
    ),

  location: z.string()
    .min(3, "Locația trebuie să aibă minim 3 caractere.")
    .max(200, "Locația nu poate depăși 200 de caractere."),

  categoryId: z.string()
    .min(1, "Categoria este obligatorie."),

  organizer: z.string()
    .min(3, "Numele organizatorului trebuie să aibă minim 3 caractere.")
    .max(100, "Numele organizatorului nu poate depăși 100 de caractere."),

  price: z.string()
  .min(1, "Prețul este obligatoriu.")
  .refine(
    (val) => {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === "gratuit" || trimmed === "free") return true;
      
      const priceRegex = /^\d+(\.\d{1,2})?\s+(mdl|lei|eur|usd|ron|gbp|chf)$/i;
      return priceRegex.test(trimmed);
    },
    "Prețul trebuie să fie: număr + monedă (ex: 100 MDL, 20 Lei, 11.50 EUR) sau 'Gratuit'."
  )
});