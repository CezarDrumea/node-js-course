import { UserModel } from '../models/user_model.js';
import { registerValidator } from "../validators/registerValidator.js";
import { authValidator } from "../validators/authValidator.js";
import { ZodError } from "zod";

const users = new UserModel();

export const registerUser = async (req, res) => {
    const { login, password } = req.body;
    const values = { login, password };

    try {
        registerValidator.parse(values);
        await users.addUser({ login, password });
        return res.redirect("/auth");
    } catch (err) {

        const errors = {};

        if (err instanceof ZodError) {
            err.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });

            return res.status(400).render("register", {
                errors,
                values
            });
        }

        // orice alt tip de eroare
        return res.status(500).send("Eroare server!");
    }
};


export const loginUser = async (req, res) => {
    const result = authValidator.safeParse(req.body);

    if (!result.success) {
        const errors = {};

        result.error.issues.forEach(issue => {
            errors[issue.path[0]] = issue.message;
        });

        return res.status(400).render("login", {
            errors,
            values: req.body
        });
    }

    const { login, password } = result.data;

    try {
        const user = await users.authenticate(login, password);

        if (!user) {
            return res.status(401).render("login", {
                errors: { login: "Login sau parolă incorecte!" },
                values: req.body
            });
        }

        res.cookie("user", JSON.stringify({ id: user.id, login: user.login }), {
            httpOnly: true,
            maxAge: 1000 * 60 * 30
        });

        res.redirect("/notes");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Eroare server");
    }
};


export const logoutUser = (req, res) => {
    res.clearCookie("user");
    res.redirect("/auth");
};
