const express = require('express');
const path = require('path');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', passwordRoutes);

app.listen(PORT, () => {
  console.log(`Password Manager running on http://localhost:${PORT}`);
});