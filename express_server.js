const express = require("express");
const { getUserByEmail } = require("./helper");
const app = express();
const PORT = 8080; 
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

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

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const urlsForUser = (id) => {
  let userURL = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURL[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      };
    }
  }
  return userURL;
};

app.set("view engine", "ejs");

app.use(cookieParser());

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

  app.get("/urls", (req, res) => {
    if (req.session.userId && users[req.session.userId] === undefined) {
     req.session = null;
     res.redirect("/");
   } else { 
     const templateVars = {
       cookieId: req.session.userId,
       user: users[req.session.userId],
       urls: urlsForUser(req.session.userId)
     };
     res.render("urls_index", templateVars);
    }
  });

  app.get("/urls/new", (req, res) => {
    if (!req.session.userId) {
      res.redirect("/login");
    } else {
      const templateVars = {
        cookieId: req.session.userId,
        user: users[req.session.userId]
      };
      res.render("urls_new", templateVars);
    }
  });

  app.get("/urls/:id", (req, res) => {
    if (checkURL(req.params.id)) {
      if (!req.session.userId) {
        res.status(403).send(wrongPerm);
      } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
        res.status(403).send(wrongUser);
      } else {
        const templateVars = {
          cookieId: req.session.userId,
          user: users[req.session.userId],
          id: req.params.id,
          longURL: urlDatabase[req.params.id].longURL
        };
        res.render("urls_show", templateVars);
      }
    } else {
      res.redirect("/urls/");
    }
  });

  app.get("/u/:id", (req, res) => {
    if (checkURL(req.params.id)) {
      const longURL = urlDatabase[req.params.id].longURL;
      res.redirect(longURL);
    } else {
      res.status(404).send(url404);
    }
  });

  app.get("/login", (req, res) => {
    if (req.session.userId) {
      res.redirect("/urls/");
    } else {
      const templateVars = {
        cookieId: req.session.userId,
        user: users[req.session.userId]
      };
      res.render("login", templateVars);
    }
  });

app.get("/register", (req, res) => {
  if (req.session.userId) {
    // If user already logged in, redirect to /urls/
    res.redirect("/urls/");
  } else {
    const templateVars = {
      cookieId: req.session.userId,
      user: users[req.session.userId]
    };
    res.render("urls_registration", templateVars);
  }
});

  app.post("/urls", (req, res) => {
    if (!req.session.userId) {
      res.send("Login Required!\n");
    } else {
      const id = generateRandomString(6); 
      const url = req.body.longURL;
      urlDatabase[id] = {
        longURL: checkHttp(url),
        userID: req.session.userId
      };
      res.redirect(`/urls/${id}`);
    }
  });

  app.post("/urls/:id", (req, res) => {
    if (checkURL(req.params.id)) {
      if (!req.session.userId) {
        res.status(403).send(wrongPerm);
      } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
        res.status(403).send(wrongUser);
      } else {
        const id = req.params.id;
        const url = req.body.longURL;
        urlDatabase[id] = {
          longURL: checkHttp(url),
          userID: req.session.userId
        };
        res.redirect("/urls/");
      }
    } else {
      res.status(403).send(url404);
    }
  });


  app.post("/urls/:id/delete", (req, res) => {
    // We need to check if the URL exists, check if the user logged in, check if it is correct logged in user before actioning Delete.
    if (checkURL(req.params.id)) {
      if (!req.session.userId) {
        res.status(403).send(wrongPerm);
      } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
        res.status(403).send(wrongUser);
      } else {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
      }
    } else {
      res.status(403).send(url404);
    }
  });

  app.post("/login", (req, res) => {
    console.log("+++++++++", req.body);
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);
    const logedInUser = users[user];
  if (logedInUser) {
    if (bcrypt.compareSync(password, logedInUser.password)) {
      req.session.userId = cookieID;
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
        password: bcrypt.hashSync(password, 10)
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
  
  