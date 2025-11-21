import {z} from 'zod';
export const authValidator = z.object({
    login: z.string()
        .min(8, "Loginul nu e valid!")
        .max(30, "Loginul nu e valid!")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!%#*?&]{8,30}$/,
            "Loginul nu e valid!")
        .trim(),
    password: z.string()
        .min(8, "Parola nu e validă!")
        .max(30, "Parola nu e validă!")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&]).{8,30}$/,
            "Parola nu e validă!"
        )
        .trim(),
})