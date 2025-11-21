import {z} from "zod";
export const notesValidator = z.object({
    text: z.string()
        .trim()
        .min(10, "Minim 10 caractere!")
        .max(255, "Maxim 255 de caractere!")
        .regex( /^[A-Za-z0-9ĂÂÎȘȚăâîșț ,.!?;:\-()'"@%*#&\n\r]+$/,
            "Notiță invalidă!")

})