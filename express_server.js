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
  getUrlIdForCurrentUser,
  urlIdExists
} = require("./helpers");

////// Database //////
const { urlDatabase, users } = require('./database');

////// Express Config //////
const app = express();
const PORT = 8080;

////// Template Engine //////
app.set('view engine', 'ejs');

////// Middleware //////
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPd', 'VkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!'],
  maxAge: 10 * 60 * 1000 // 10 min
}));

////// Body Parser - needs to come before routes //////
app.use(express.urlencoded({ extended: true }));

////// ROUTES //////
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
    urls: urlsForUser(userID, urlDatabase),
    errMessage: ''
  };

  if (!userID) {
    templateVars.errMessage = `You are not logged in. <a href="/register">Register</a> or <a href="/login">login</a> to begin creating tiny urls!`;
  }

  res.render("pages/urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
    errMessage: '',
  };

  if (!userID) {
    templateVars.errMessage = `You don't have access to add a new url. Try logging in.`;
    res.render('pages/urls_login', templateVars);
  }

  if (userID) {
    res.render("pages/urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
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
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const isUsersUrl = getUrlIdForCurrentUser(urlID, userUrls);

  const templateVars = {
    id: urlID,
    user: users[userID],
    errMessage: '',
    hasAccess: false,
  };

  if (!userID) {
    templateVars.errMessage = `You need to <a href="/login">login</a> to access this page`;
  }

  if (userID && isUsersUrl.length === 0) {
    templateVars.errMessage = `You do not have access to this page. Go <a href="/">back home</a>`;
  }

  if (isUsersUrl.length > 0) {
    templateVars.hasAccess = true;
    templateVars.longURL = urlDatabase[urlID].longURL;
  }
 
  res.render("pages/urls_show", templateVars);
});

////// Redirect shortened urls to the LongURL //////
app.get("/u/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  const templateVars = {
    id: urlID,
    user: users[userID],
    errMessage: '',
  };

  if (!urlIdExists(urlID, urlDatabase)) {
    res.status(404).render("pages/urls_404", templateVars);
  }

  if (urlIdExists(urlID, urlDatabase)) {
    const longURL = urlDatabase[urlID].longURL;
    res.redirect(longURL);
  }
});

app.get('*', (req, res) => {
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

  if (! userPwd || ! userEmail) {
    templateVars.errMessage = "Email address and password cannot be blank";
    res.status(400).render('pages/urls_register', templateVars);
  }
  
  if (emailExists) {
    templateVars.errMessage = `Email address already exists. Try a different email address or try logging in with your existing account.`;

    res.status(400).render('pages/urls_register', templateVars);
  }

  if (!emailExists && userPwd && userEmail) {
    users[userID] = {};
    users[userID]["id"] = userID;
    users[userID]["email"] = userEmail;
    users[userID]["password"] = hashedPassword;

    req.session.user_id = userID;
      
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  let userID;
  const userEmail = req.body.email;
  const userPwd = req.body.password;
  const user = getUserByEmail(userEmail, users);

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
      req.session.user_id = user.id;
      res.redirect('/urls');
    }
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session = null;
  res.redirect('/login');
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    const random = generateRandomString(6);

    urlDatabase[random] = {
      longURL: req.body.longURL,
      userID: userID,
    };

    res.redirect('/urls');
  } else {
    res.status(403).send("You must login to add new urls");
  }
});

////// UPDATE //////
app.post("/urls/:id/update", (req, res) => {
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


////// DELETE ///////
app.post("/urls/:id/delete", (req, res) => {
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
