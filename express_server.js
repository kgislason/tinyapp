const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const { generateRandomString, emailLookup, passwordCheck } = require("./functions");
const { urlDatabase, users } = require('./database');

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };

  res.render("pages/urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  res.render("pages/urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  if (userID !== undefined) {
    res.redirect('/');
  }

  res.render("pages/urls_register", templateVars);
});


app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  if (userID !== undefined) {
    res.redirect('/');
  }

  res.render("pages/urls_login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userID]
  };

  res.render("pages/urls_show", templateVars);
});

// Redirect shortened urls to the LongURL
app.get("/u/:id", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };

  res.redirect(templateVars.longURL);
});

app.get('*', (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  res.render("pages/urls_404", templateVars);
});

////// POST //////
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPwd = req.body.password;
  let emailExists = emailLookup(userEmail, users);

  // Check for empty fields or existing user
  if (! userPwd || ! userEmail) {
    res.status(400).send("Email address and password cannot be blank.");
  }
  
  if (emailExists) {
    res.status(400).send("Email address already exists. Try a different email address.");
  }
  
  // Build our new user in the database
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = userEmail;
  users[userID]["password"] = userPwd;

  // Set the cookie
  res.cookie('user_id', userID);
    
  // send user to index
  res.redirect('/');
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPwd = req.body.password;
  let user = emailLookup(userEmail, users);

  if (!userEmail || !userPwd) {
    res.status(403).send("Username and password are required!");
  }
  
  if (!user) {
    res.status(403).send("Hmmmm. That email was not found.");
  }

  if (user) {
    if (!passwordCheck(userPwd, user)) {
      res.status(403).send("Password Incorrect!!!!");
    }

    if (passwordCheck(userPwd, user)) {
      res.cookie('user_id', user.id);
      res.redirect('/');
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', { path: '/' });
  res.redirect('/login');
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
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
