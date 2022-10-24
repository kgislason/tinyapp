const generateRandomString = (length) => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const max = char.length - 1;

  for ( let i = 0; i < length; i++ ) {
    result += char[Math.floor(Math.random() * max)];
  }

  return result;
};

console.log(generateRandomString(6));

module.exports = { generateRandomString };