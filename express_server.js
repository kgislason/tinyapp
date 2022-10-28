const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./functions");
const { urlDatabase } = require('./database');

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  if (req.cookies["username"] !== '') {
    templateVars.username = req.cookies["username"];
  }
  res.render("pages/urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  // if (req.cookies["username"] !== '') {
  //   templateVars.username = req.cookies["username"];
  // }
  res.render("pages/urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  if (req.cookies["username"] !== '') {
    templateVars.username = req.cookies["username"];
  }
  res.render("pages/urls_show", templateVars);
});

// Redirect shortened urls to the LongURL
app.get("/u/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', { path: '/' });
  res.redirect('/');
});

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
