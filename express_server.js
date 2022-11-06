////// Packages //////
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

////// Helpers //////
const {
  generateRandomString,
  getUserByEmail,
  passwordCheck,
  urlsForUser,
  getUrlIdForCurrentUser
} = require("./helpers");

////// Database ///////
const { urlDatabase, users } = require('./database');

////// Express Config /////
const app = express();
const PORT = 8080; // default port 8080

///// Template Engine /////
app.set('view engine', 'ejs');

////// Middleware //////
app.use(morgan('dev')); // For logging
app.use(cookieSession({
  name: 'session',
  keys: ['$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPd', 'VkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!'],
  maxAge: 10 * 60 * 1000
}));

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/urls", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
    urls: urlsForUser(userID, urlDatabase),
    errMessage: ''
  };

  if (!userID) {
    templateVars.errMessage = `You are not logged in. <a href="/register">Register</a> or <a href="/login">login</a> to begin creating tiny urls!`;
  }

  console.log(users);
  console.log(urlDatabase);

  res.render("pages/urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/urls/new', (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!userID) {
    templateVars.errMessage = `You don't have access to add a new url. Try logging in.`;
    res.render('pages/urls_login', templateVars);
  }

  res.render("pages/urls_new", templateVars);
});

app.get("/register", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;

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
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;

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
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const isUsersUrl = getUrlIdForCurrentUser(urlID, userUrls);

  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: users[userID],
    errMessage: '',
    hasAccess: false,
  };

  if (!userID) {
    templateVars.errMessage = `You need to <a href="/login">login</a> to access this page`;
  }

  if (isUsersUrl.length === 0) {
    templateVars.errMessage = `You do not have access to this page. Go <a href="/">back home</a>`;
  }

  console.log(isUsersUrl);
  if (isUsersUrl.length > 0) {
    templateVars.hasAccess = true;
  }
 
  res.render("pages/urls_show", templateVars);
});

// Redirect shortened urls to the LongURL
app.get("/u/:id", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const longURL = urlDatabase[req.params.id].longURL;
  console.log(longURL);

  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: longURL,
  };

  if (templateVars.longURL) {
    console.log("Hi");
    res.redirect(templateVars.longURL);
  }
  res.render("pages/urls_404", templateVars);
});

app.get('*', (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };

  res.render("pages/urls_404", templateVars);
});

////// POST //////
app.post("/register", (req, res) => {

  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPwd = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPwd, 10);
  const emailExists = getUserByEmail(userEmail, users);

  const templateVars = {
    user: users[userID],
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
    users[userID]["password"] = hashedPassword;

    // Set the cookie
    // res.cookie('user_id', userID);
    req.session.user_id = userID;
      
    // send user to index
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  let userID;
  const userEmail = req.body.email;
  const userPwd = req.body.password;
  const user = getUserByEmail(userEmail, users);
  // const userID = req.cookies["user_id"];

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

  console.log(typeof userPwd);
  console.log(typeof user.password);

  if (user) {
    if (!passwordCheck(userPwd, user)) {
      templateVars.errMessage = "Password Incorrect!!!!";
      res.status(403).render("pages/urls_login", templateVars);
    }

    if (passwordCheck(userPwd, user)) {
      // res.cookie('user_id', user.id);
      req.session.user_id = user.id;
      res.redirect('/urls');
    }
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id', { path: '/' });
  req.session.user_id = null;
  req.session = null;
  res.redirect('/login');
});

app.post("/urls", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  console.log(userID);

  if (userID) {
    //generate new short URL id
    const random = generateRandomString(6);

    // Add it to database:
    urlDatabase[random] = {
      longURL: req.body.longURL,
      userID: userID,
    };

    // res.redirect('/urls' + random);
    res.redirect('/urls');
  } else {
    res.status(403).send("You must login to add new urls");
  }
});

app.post("/urls/:id/update", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const isUsersUrl = getUrlIdForCurrentUser(urlID, userUrls);

  const templateVars = {
    errMessage: '',
  };

  if (!userID) {
    templateVars.errMessage = `You do not have access to update urls. Try logging in.`;
    res.status(403).render('pages/urls_index', templateVars);
  }

  if (isUsersUrl.length === 0) {
    templateVars.errMessage = `You do not have access to perform this action!`;
    res.status(403).render('pages/urls_index', templateVars);
  }

  if (isUsersUrl.length > 0) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const isUsersUrl = getUrlIdForCurrentUser(urlID, userUrls);

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
    errMessage: ''
  };

  if (!userID) {
    templateVars.errMessage = `You do not have access to delete urls. Try logging in.`;
    res.status(403).render('pages/urls_index', templateVars);
  }

  if (isUsersUrl.length === 0) {
    templateVars.errMessage = `You do not have access to delete this url!`;
    res.status(403).render('pages/urls_index', templateVars);
  }

  if (isUsersUrl.length > 0) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

////// LISTENER //////
app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
