//Returns the user id for a given email, or empty string if email not in DB
module.exports = (email, db) => {
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