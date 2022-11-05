
////// Mock Database ///////
// const urlDatabaseOld = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "12345s": "https://getbootstrap.com/docs/4.0/components/navbar/",
//   "XrFQRH": "https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q",
// };

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
  "12345s": {
    longURL: "https://getbootstrap.com/docs/4.0/components/navbar/",
    userID: "user2RandomID",
  },
  "XrFQRH": {
    longURL: "https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q",
    userID: "pxpdmdLO",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "pxpdmdLO",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  pxpdmdLO: {
    id: "pxpdmdLO",
    email: "kristy@mailinator.com",
    password: "1234567",
  }
};

module.exports = { urlDatabase, users };