const generateRandomString = (length = 8) => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const max = char.length - 1;

  for (let i = 0; i < length; i++) {
    result += char[Math.floor(Math.random() * max)];
  }

  return result;
};

module.exports = { generateRandomString };