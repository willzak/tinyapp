//Returns the user id for a given email, or empty string if email not in DB
const getIdByEmail = (email, db) => {
  if (!email || !db) {
    return undefined;
  }

  for (let account in db) {
    if (email === db[account]['email']) {
      return account;
    }
  }
  return '';
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6); //generates random string of 6 letters & numbers
};

const urlsForUser = (id, db) => {
  //returns the URLS where userId = current user's ID
  let res = {};
  for (const item in db) {
    if (db[item].userId === id) {
      res[item] = db[item];
    }
  }
  return res;
};

module.exports = { getIdByEmail, generateRandomString, urlsForUser };