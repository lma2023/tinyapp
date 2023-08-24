const express = require("express");
const { getUserByEmail } = require("./helper");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
// const cookieSession = require('cookie-session');
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(cookieParser());
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2'],
//   signed: false
// }));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  // app.get("/urls", (req, res) => {
  //   const templateVars = { urls: urlDatabase };
  //   res.render("urls_index", templateVars);
  // });

  app.get("/urls", (req, res) => {
    const templateVars = {
      // username: req.cookies["username"],
      user: users[req.cookies["user_id"]],
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
    res.render("urls_show", templateVars);
  });

  app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  });

  app.get("/login", (req, res) => {
      const templateVars = { 
      user: users[req.cookies["user_id"]] 
    };
      res.render("login", templateVars);
  });

app.get("/register", (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_registration", templateVars)
});

  app.post("/urls", (req, res) => {
    console.log(req.body);
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
  });

  app.post("/login", (req, res) => {
    console.log("+++++++++", req.body);
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);
    const logedInUser = users[user];
  if (logedInUser) {
    if (password === logedInUser.password) {
    res.cookie("user_id", logedInUser.id);
    res.redirect("/urls");
    } else {
      res.status(403).send('Passwords dont match')
      return;
    }
  } else {
    res.status(403).send('Email not found')
    return;
  }
  });

  app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
  });

  app.post("/register", (req, res) => {
    const id = generateRandomString(6);
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);
  
    if (!email) {
      res.status(400).send('Please include a valid email and password');
    } else if (user) {
      res.status(400).send('An account with this email address already exists');
    } else {
      users[id] = {
        id,
        email,
        password
      }
      res.cookie("user_id", users[id].id);
      res.redirect("/urls");
    }
  });

  function generateRandomString() {
    const alphanumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 6; i++) {
      randomString += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
    }
    return randomString;
  }
  
  const randomString = generateRandomString();
  console.log(randomString);
  
  