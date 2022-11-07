const bcrypt = require("bcryptjs");

// Returns a random ID of letters, default length: 8
const generateRandomString = (length = 8) => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const max = char.length - 1;

  for (let i = 0; i < length; i++) {
    result += char[Math.floor(Math.random() * max)];
  }

  return result;
};

// returns the user object or undefined
const getUserByEmail = (email, users) => {
  let objArr = Object.keys(users);
  for (let item of objArr) {
    if (email === users[item].email) {
      return users[item];
    }
  }
  return;
};

// Returns an object with all urls for a given user ID
const urlsForUser = (id, urlDatabase) => {
  let objArr = Object.keys(urlDatabase);
  let obj = {};
  if (!id) {
    return obj;
  }
  let filteredArr = objArr.filter((item) => {
    return urlDatabase[item].userID === id;
  });
  for (let key of filteredArr) {
    obj[key] = urlDatabase[key];
  }
  return obj;
};

// Returns true or false if a given URL id is associated with the current user
const isUrlIdForCurrentUser  = (urlID, userObj) => {
  for (const key of Object.keys(userObj)) {
    if (key === urlID) {
      return true;
    }
  }
  return false;
};

// Checks the password entered at login against the password in user database
const passwordCheck = (password, userObj) => {
  return bcrypt.compareSync(password, userObj.password); // returns true or false
};

// Check if id exists in the database
const urlIdExists = (urlID, urlDatabase) => {
  let result = false;
  for (let item of Object.keys(urlDatabase)) {
    if (item === urlID) {
      result = true;
    }
  }
  return result;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  passwordCheck,
  urlsForUser,
  isUrlIdForCurrentUser ,
  urlIdExists,
};