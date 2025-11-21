import {z} from 'zod';
export const registerValidator = z.object({
    login: z.string()
        .min(8, "Loginul trebuie să conțină minim 8 caractere!")
        .max(30, "Loginul trebuie să conțină maxim 30 de caractere!")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%#*?&]{8,30}$/,
            "Loginul trebuie să conțină litere mari și mici, cifre și un caracter special între 8 și 30 de caractere!")
        .trim(),
    password: z.string()
        .min(8, "Parola trebuie să aibă minim 8 caractere!")
        .max(30, "Parola trebuie să aibă maxim 30 de caractere!")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,30}$/,
            "Parola trebuie să conțină litere mari și mici, cifre și un caracter special între 8 și 30 de caractere!"
        )
        .trim(),
})