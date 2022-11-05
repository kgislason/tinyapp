const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const { generateRandomString, emailLookup, passwordCheck, urlsForUser } = require("./functions");
const { urlDatabase, users } = require('./database');

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
    errMessage: ''
  };

  if (!userID) {
    templateVars.errMessage = `You are not logged in. <a href=\"/register\">Register</a> or <a href="/login">login</a> to begin creating tiny urls!`;
  }

  res.render("pages/urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/urls/new', (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!userID) {
    templateVars.errMessage = "You don't have access to add a new url. Try logging in again.";
    res.render('pages/urls_login', templateVars);
  }

  res.render("pages/urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  if (userID) {
    res.redirect('/urls');
  }

  res.render("pages/urls_register", templateVars);
});


app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  if (userID) {
    res.redirect('/urls');
  }

  res.render("pages/urls_login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies["user_id"];
  let urlID = req.params.id;

  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: users[userID],
  };

  res.render("pages/urls_show", templateVars);
});

// Redirect shortened urls to the LongURL
app.get("/u/:id", (req, res) => {
  let userID = '';
  if (req.cookies["user_id"]) {
    userID = req.cookies["user_id"];
  }

  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };

  console.log(templateVars.longURL);

  console.log("If ", req.params.id === undefined);

  if (templateVars.longURL) {
    console.log("Hi");
    res.redirect(templateVars.longURL);
  }
  res.render("pages/urls_404", templateVars);
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

  const templateVars = {
    errMessage: '',
  };

  // Check for empty fields or existing user
  if (! userPwd || ! userEmail) {
    templateVars.errMessage = "Email address and password cannot be blank";
    //res.status(400).send(errMessage);
    res.status(400).render('pages/urls_register', templateVars);
  }
  
  // Check if email exists in database
  if (emailExists) {
    templateVars.errMessage = `Email address already exists. Try a different email address or try logging in with your existing account.`;

    res.status(400).render('pages/urls_register', templateVars);
  }

  if (!emailExists && userPwd && userEmail) {
    // Build our new user in the database
    users[userID] = {};
    users[userID]["id"] = userID;
    users[userID]["email"] = userEmail;
    users[userID]["password"] = userPwd;

    // Set the cookie
    res.cookie('user_id', userID);
      
    // send user to index
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPwd = req.body.password;
  let user = emailLookup(userEmail, users);
  let userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  if (!userEmail || !userPwd) {
    templateVars.errMessage = "Username and password are required.";
    res.status(403).render("pages/urls_login", templateVars);
  }
  
  if (!user) {
    templateVars.errMessage = "Hmmmm. That email was not found.";
    res.status(403).render("pages/urls_login", templateVars);
  }

  if (user) {
    if (!passwordCheck(userPwd, user)) {
      templateVars.errMessage = "Password Incorrect!!!!";
      res.status(403).render("pages/urls_login", templateVars);
    }

    if (passwordCheck(userPwd, user)) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', { path: '/' });
  res.redirect('/login');
});

app.post("/urls", (req, res) => {
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs. Double check that in this case the URL is not added to the database.
  let userID = req.cookies["user_id"];

  if (userID) {
    //generate new short URL id
    const random = generateRandomString(6);

    // Add it to database:
    urlDatabase[random].longURL = req.body.longURL;

    // res.redirect('/urls' + random);
    res.redirect('/urls');
  } else {
    res.status(403).send("You must login to add new urls");
  }
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

////// LISTENER //////
app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
