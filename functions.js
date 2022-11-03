const generateRandomString = (length = 8) => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const max = char.length - 1;

  for (let i = 0; i < length; i++) {
    result += char[Math.floor(Math.random() * max)];
  }

  return result;
};

const emailLookup = (email, users) => {
  let objArr = Object.keys(users);
  for (let item of objArr) {
    if (email === users[item].email) {
      return users[item];
    }
  }
  return false;
};

const passwordCheck = (password, user) => {
  if (user["password"] === password) {
    return true;
  }
  return false;
};

module.exports = { generateRandomString, emailLookup, passwordCheck };