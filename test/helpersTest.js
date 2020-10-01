const { assert } = require('chai');

const { getIdByEmail } = require('../helpers.js');

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

describe('getIdByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getIdByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.equal(user, expectedOutput);
  }),

  it('should return an empty string when given an email not in the database', () => {
    const user = getIdByEmail("not@inDatabase.com", testUsers);
    const expectedOutput = "";

    assert.equal(user, expectedOutput);
  }),

  it('should return undefined if it is missing an input', () => {
    const user = getIdByEmail();
    assert.isUndefined(user);
  })
})