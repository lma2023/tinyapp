const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { users, urlDatabase } = require("./database");
const { generateRandomString, getUserByEmail, cookieUserDatabase, urlsForUser, checkURL, checkHttp } = require("./helper");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key 2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

// List all urls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user,
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/register");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});
// Showing selected URL page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const user = users[userId];
  const urlObject = urlDatabase[id];
  if (checkURL(id)) {
    if (!userId) {
      return res.status(403).send("Not Logged in");
    }
    if (userId !== urlObject.userId) {
      return res.status(403).send("Wrong User");
      // return
    }
    const templateVars = {
      user,
      id,
      longURL: urlObject.longURL
    };
    res.render("urls_show", templateVars);
  }
});

// Redirecting to longURL website
app.get("/u/:id", (req, res) => {
  // Checking if URL exists
  const id = req.params.id;
  const urlObject = urlDatabase[id];
  if (urlObject) {
    const longURL = urlObject.longURL;
    if (longURL === undefined) {
      res.status(302);
    }
    res.redirect(longURL);
  }
});

// Login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (cookieUserDatabase(userId, users)) {
    res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (cookieUserDatabase(userId, users)) {
    // If user already logged in, redirect to /urls/
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("urls_registration", templateVars);
});

// New URL
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("Login Required!\n");
  } 
    const id = generateRandomString(6);
    const url = req.body.longURL;
    urlDatabase[id] = {
      longURL: checkHttp(url),
      userId
      // user_id: req.session.user_id
    }
    res.redirect(`/urls/${id}`);
});

// Updating existing URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const url = req.body.longURL;
  if (!userId) {
    return res.status(400).send("400: Access Denied");
  } 
    urlDatabase[id] = {
      longURL: checkHttp(url),
      userId
    };
    res.redirect(`/urls`);
});

// Deleting URL
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
  } 
    return res.status(401).send("You do not have authorization to delete this short URL.");
});

// Registering new user and checking if user email exists
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!email) {
    res.status(400).send('Please include a valid email and password');
  } else if (user) {
    res.status(400).send('An account with this email address already exists');
  } 
    const NewUserId = generateRandomString(6);
    users[NewUserId] = {
      id: NewUserId,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }
    req.session.user_id = NewUserId;
    res.redirect("/urls");
});

// User logging in and checking if email and password are correct
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);
  const logedInUser = users[userID];
  if (logedInUser) {
    if (bcrypt.compareSync(password, logedInUser.password)) {
      req.session.user_id = userID;
      res.redirect("/urls");
    } 
      res.status(403).send('Passwords dont match')
      return;
    }
    res.status(403).send('Email not found')
    return;
});

// Logging out and clearing cookie session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})



