import { z } from "zod";

// regula comună pentru parole
const passwordRules = z.string()
  .min(8, "Parola trebuie să aibă minim 8 caractere.")
  .max(16, "Parola trebuie să aibă maxim 16 caractere.")
  .regex(/[A-Z]/, "Parola trebuie să conțină o literă mare.")
  .regex(/[a-z]/, "Parola trebuie să conțină o literă mică.")
  .regex(/[0-9]/, "Parola trebuie să conțină un număr.")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină un simbol special.");

export const signUpSchema = z.object({
  username: z.string().min(3, "Username minim 3 caractere."),
  password: passwordRules,
  passwordConfirm: z.string().min(1, "Confirmă parola.")
}).refine(
  (data) => data.password === data.passwordConfirm,
  { message: "Parolele nu coincid.", path: ["passwordConfirm"] }
);

export const loginSchema = z.object({
  username: z.string().min(1, "Introdu username."),
  password: z.string().min(1, "Introdu parola.")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Introdu parola curentă."),  
  newPassword: passwordRules, 
  confirmNewPassword: z.string().min(1, "Confirmă noua parolă.")
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  { message: "Parolele nu se potrivesc.", path: ["confirmNewPassword"] }
);
