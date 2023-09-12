const { users, urlDatabase } = require("./database");

const getUserByEmail = function(email, userDatabase) {
    for (const user in userDatabase) {
      if (userDatabase[user].email === email) {
        return userDatabase[user].id;
      }
    }
  };
  // Urls for the logged in user

  function generateRandomString() {
    const alphanumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 6; i++) {
      randomString += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
    }
    return randomString;
  };
  
  // Checking cookie in the database
  const cookieUserDatabase = function(cookie, database) {
    for (const user in database) {
      if (cookie === user) {
        return true;
      }
    } return false;
  };

  const urlsForUser = function(id, urlDatabase) {
    let userURLs = {};
    for (const url in urlDatabase) {
      if (id === urlDatabase[url].userId) {
        userURLs[url] = urlDatabase[url];
      }
    }
    return userURLs;
  };
  
  const checkHttp = (url) => {
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      return "https://" + url;
    } 
    return url;
  };
  
  const checkURL = (url) => {
    for (const id in urlDatabase) {
      if (url === id) {
        return true;
      }
    }
    return false;
  };
  
  module.exports = { 
    getUserByEmail,
    generateRandomString,
    cookieUserDatabase,
    checkURL,
    checkHttp,
    urlsForUser
  };
