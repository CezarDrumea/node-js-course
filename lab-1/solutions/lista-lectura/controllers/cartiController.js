const { getCarti, saveCarti } = require("../models/carti");

exports.lista = (req, res) => {
  const carti = getCarti().filter((c) => c.userId === req.user.id);
  res.render("index", { carti, user: req.user });
};

exports.showAdd = (req, res) => {
  res.render("add");
};

exports.add = (req, res) => {
  const carti = getCarti();

  const carte = {
    id: Date.now(),
    titlu: req.body.titlu,
    autor: req.body.autor,
    citita: req.body.citita === "true",
    rating: req.body.rating,
    userId: req.user.id,
  };

  carti.push(carte);
  saveCarti(carti);

  res.redirect("/carti");
};

exports.toggleCitita = (req, res) => {
  const carti = getCarti();
  const carte = carti.find((c) => c.id == req.params.id);

  if (carte && carte.userId === req.user.id) {
    carte.citita = !carte.citita;
    saveCarti(carti);
  }

  res.redirect("/carti");
};

exports.sterge = (req, res) => {
  const carti = getCarti().filter((c) => c.id != req.params.id);
  saveCarti(carti);
  res.redirect("/carti");
};

exports.showEdit = (req, res) => {
  const carti = getCarti();
  const carte = carti.find((c) => c.id == req.params.id);
  if (carte && carte.userId === req.user.id) {
    res.render("modifica", { carte });
  } else {
    res.redirect("/carti");
  }
};
exports.edit = (req, res) => {
  const carti = getCarti();
  const carte = carti.find((c) => c.id == req.params.id);
  if (carte && carte.userId === req.user.id) {
    carte.titlu = req.body.titlu;
    carte.autor = req.body.autor;
    carte.citita = req.body.citita === "true";
    carte.rating = req.body.rating;
    saveCarti(carti);
  }
  res.redirect("/carti");
};
