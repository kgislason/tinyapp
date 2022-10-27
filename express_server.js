const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./functions");

app.set('view engine', 'ejs');

// Body parser - needs to come before routes
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


////// ROUTES //////

app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

// Create New hort url form page
app.get('/urls/new', (req, res) => {
  res.render("pages/urls_new");
});

// Database
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

/* Redirect shortened urls to the LongURL */
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

////// POST ///////

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

// Edge Cases
// What would happen if a client requests a short URL with a non-existant id?
// What happens to the urlDatabase when the server is restarted?
//What type of status code do our redirects have? What does this status code mean?
// Warning
/*
In order to function correctly, any long URLs submitted through the form must include the protocol (http:// or https://). In a real web app, we might implement some code to help our users by detecting whether http was included in their submission, and add it if it wasn't. Because we want to focus more on the routing, request handling, and templates for this project, we're going to omit this feature. However, it means that, while testing, you may encounter problems if the sample URLs you are submitting do not include the protocol.
*/

////// LISTENER //////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

