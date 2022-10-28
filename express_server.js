const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./functions");
const { urlDatabase } = require('./database');

app.set('view engine', 'ejs');
app.use(morgan('dev'));

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("pages/urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("pages/urls_show", templateVars);
});

// Redirect shortened urls to the LongURL
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.redirect(templateVars.longURL);
});

app.get('*', (req, res) => {
  res.status(404);
  res.render("pages/urls_404");
});

////// POST //////
app.post("/", (req, res) => {
  //generate new short URL id
  const random = generateRandomString(6);
  // Add it to database:
  urlDatabase[random] = req.body.longURL;
  // res.redirect('/' + random);
  res.redirect('/');
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/');
});

////// LISTENER //////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
