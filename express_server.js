const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./functions");

app.set('view engine', 'ejs');

// BOdy parser - needs to come before routes
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.render("pages/index", {
    urlDatabase
  });
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("pages/urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("pages/urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  res.send("Ok"); // respond with 'Ok' (we will replace this)
  urlDatabase[generateRandomString(6)] = req.body.longURL;
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

