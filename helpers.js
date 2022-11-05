const { urlDatabase } = require("./database");

const generateRandomString = (length = 8) => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const max = char.length - 1;

  for (let i = 0; i < length; i++) {
    result += char[Math.floor(Math.random() * max)];
  }

  return result;
};

const getUserByEmail = (email, users) => {
  let objArr = Object.keys(users);
  for (let item of objArr) {
    if (email === users[item].email) {
      return users[item];
    }
  }
  return;
};

const urlsForUser = (id) => {
  let objArr = Object.keys(urlDatabase);
  let obj = {};
  if (!id) return obj;
  let filteredArr = objArr.filter( (item) => { 
    return urlDatabase[item].userID === id
  });

  for (let key of filteredArr) {
    obj[key] = urlDatabase[key];
  }
  return obj;
};

const getUrlIdForCurrentUser = (id, obj) => {
  return Object.keys(obj).filter( (item) => item == id );
};

const passwordCheck = (password, user) => {
  bcrypt.compareSync(password, user["password"]); // returns true or false
};

module.exports = { 
  generateRandomString,
  getUserByEmail,
  passwordCheck,
  urlsForUser,
  getUrlIdForCurrentUser,
};