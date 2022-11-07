const { assert } = require('chai');
const { getUserByEmail, generateRandomString, urlsForUser, isUrlIdForCurrentUser, urlIdExists  } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID2",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if the email is not found in the database', function() {
    const user = getUserByEmail("nobody@example.com", testUsers);
    const expectedUser = undefined;

    assert.equal(user, expectedUser);
  });
});

describe('generateRandomString', function() {
  it('should return a string with 8 characters', function() {
    const expected = "hfgstRTj";
    const actual = generateRandomString(8);

    assert.equal(actual.length, expected.length);
  });
});

describe('urlsForUser', function() {
  it('should return an object with all urls for a given user ID', function() {
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
    };

    const actual = urlsForUser('userRandomID', testURLs);

    assert.deepEqual(expected, actual);
  });
});

describe('isUrlIdForCurrentUser ', function() {
  it('should return true if a given urlID is associated with the current user id', function() {
    const expected = true;
    const actual = isUrlIdForCurrentUser('b2xVn2', {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
    });

    assert.equal(expected, actual);
  });

  it('should return false if a given urlID is NOT associated with the current user id', function() {
    const expected = false;
    const actual = isUrlIdForCurrentUser('34t634', {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID2",
      },
    });

    assert.equal(expected, actual);
  });


  // urlIdExists
});


describe('urlIdExists', function() {
  it('should return true if a given urlID exists in the database', function() {
    const expected = true;
    const actual = urlIdExists("b2xVn2", testURLs);

    assert.equal(expected, actual);
  });

  it('should return false if a given urlID does not exist in the database', function() {
    const expected = false;
    const actual = urlIdExists("123456", testURLs);

    assert.equal(expected, actual);
  });
});