const { z } = require("zod");

// Schema pentru inregistrare
const registerSchema = z.object({
  email: z
    .string()
    .email({ message: "Email invalid" })
    .min(15, { message: "Email prea scurt minim 15 caractere" })
    .max(50, { message: "Email prea lung maxim 50 caractere" }),
  parola: z
    .string()
    .min(10, { message: "Parola trebuie să aibă cel puțin 10 caractere" })
    .max(20, { message: "Parola nu poate avea mai mult de 20 de caractere" })
    .regex(
      /^[A-Za-z0-9!@#$%^&*]+$/,
      "Parola poate conține doar litere, cifre și !@#$%^&*"
    ),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalid" }),
  parola: z.string().min(1, { message: "Parola este obligatorie" }),
});

// Middleware pentru validare register
function validateRegister(req, res, next) {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).render("register", { error: err.issues[0].message });
  }
}

// Middleware pentru validare login
function validateLogin(req, res, next) {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).render("login", { error: err.issues[0].message });
  }
}

module.exports = { validateRegister, validateLogin };
