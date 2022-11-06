const bcrypt = require("bcryptjs");

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

const getUrlIdForCurrentUser = (id, userObj) => {
  return Object.keys(userObj).filter((item) => item === id);
};

const passwordCheck = (password, userObj) => {
  return bcrypt.compareSync(password, userObj.password); // returns true or false
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  passwordCheck,
  urlsForUser,
  getUrlIdForCurrentUser,
};