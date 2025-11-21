import { UserModel } from '../../../lab-3/lab3-levodeanschi-anastasia-cookie/models/user_model.js';

const users = new UserModel();

export const registerUser = async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).send("Date invalide!");

    const existingUser = await users.findUser(login);
    if (existingUser) {
        return res.status(400).send("Utilizator deja existent!");
    }


    await users.addUser({ login, password });

    res.redirect("/auth");
};
export const loginUser = async (req, res) => {
    const { login, password } = req.body;
    const user = await users.authenticate(login, password);

    if (!user) return res.status(401).send("Login sau parolă incorecte!");

    res.cookie("user", JSON.stringify({ id: user.id, login: user.login }), {
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    });

    res.redirect("/notes");
};

export const logoutUser = (req, res) => {
    res.clearCookie("user");
    res.redirect("/auth");
};
