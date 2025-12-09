const Carte = require("../models/Carte");

exports.lista = async (req, res) => {
  const carti = await Carte.findAll({ where: { userId: req.user.id } });
  res.render("index", { carti, user: req.user });
};

exports.showAdd = (req, res) => {
  res.render("add", { errors: {}, body: {} });
};

exports.add = async (req, res) => {
  const { titlu, autor, citita, rating } = req.body;

  await Carte.create({
    titlu,
    autor,
    citita: citita === "true",
    rating,
    userId: req.user.id,
  });
  res.redirect("/carti");
};

exports.toggleCitita = async (req, res) => {
  const carte = await Carte.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (carte) {
    carte.citita = !carte.citita;
    await carte.save();
  }
  res.redirect("/carti");
};

exports.sterge = async (req, res) => {
  await Carte.destroy({ where: { id: req.params.id, userId: req.user.id } });
  res.redirect("/carti");
};

exports.showEdit = async (req, res) => {
  const carte = await Carte.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (carte) res.render("modifica", { carte });
  else res.redirect("/carti");
};

exports.edit = async (req, res) => {
  const carte = await Carte.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (carte) {
    const { titlu, autor, citita, rating } = req.body;
    carte.titlu = titlu;
    carte.autor = autor;
    carte.citita = citita === "true";
    carte.rating = rating;
    await carte.save();
  }
  res.redirect("/carti");
};
