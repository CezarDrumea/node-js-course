const { z } = require("zod");

//Validare carte
const carteSchema = z.object({
  titlu: z
    .string()
    .min(4, { message: "Titlu obligatoriu minim 4 caractere" })
    .max(100, { message: "Titlu prea lung (max 100 caractere)" })
    .regex(/^[\w\s.,!?'-]+$/, { message: "Titlu conține caractere invalide" }),

  autor: z
    .string()
    .min(5, { message: "Autor obligatoriu minim 4 caractere" })
    .max(50, { message: "Nume autor prea lung (max 50 caractere)" })
    .regex(/^[a-zA-Z\s.'-]+$/, { message: "Autor conține caractere invalide" }),

  citita: z.preprocess((val) => val === "true" || val === true, z.boolean()),

  rating: z.coerce.number().int().min(0).max(5).optional(),
});

function validateCarte(req, res, next) {
  const result = carteSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((err) => {
      if (err.path && err.path.length > 0) {
        errors[err.path[0]] = err.message;
      }
    });

    return res.status(400).render("add", { errors });
  }

  req.body = result.data;
  next();
}

module.exports = validateCarte;
