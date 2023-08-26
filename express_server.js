const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const { generateRandomString, getUserByEmail, cookieUserDatabase} = require("./helper");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key 2'],
  maxAge: 24 * 60 * 60 * 1000 
}));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Databases for the project
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

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    user_id: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    user_id: "aJ48lW",
  },
};

const urlsForUser = function(id, urlDatabase) {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
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
}

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
  console.log(urlDatabase)
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id, urlDatabase)
    };
    res.render("urls_index", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  if (!cookieUserDatabase(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});
// Showing selected URL page
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
      const templateVars = {
        user: users[req.session.user_id],
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL
      };
      res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The short URL does not correspond the long URL");
  }
});

// Redirecting to longURL website
app.get("/u/:id", (req, res) => {
  // Checking if URL exists
  if (urlDatabase[req.params.id]) {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
} else {
  res.status(404).send("The short URL does not correspond the long URL");
}
});

// Login page
app.get("/login", (req, res) => {
  if (cookieUserDatabase(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  }
});

// Registration page
app.get("/register", (req, res) => {
  if (cookieUserDatabase(req.session.user_id, users)) {
    // If user already logged in, redirect to /urls/
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_registration", templateVars);
  }
});

// New URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Login Required!\n");
  }else{
    const id = generateRandomString(6); 
    const url = req.body.longURL;
    urlDatabase[id] = {
    longURL: url,
    user_id: req.session.user_id
    }
    res.redirect(`/urls/${id}`);
  }
  });

// Updating existing URL
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are not authroized");
  } else {
    const id = req.params.id;
    const url = req.body.longURL;
    urlDatabase[id]  = checkHttp(url);
    res.redirect('/urls');
  }
});

// Deleting URL
app.post("/urls/:id/delete", (req, res) => {
const userID = req.session.user_id;
const userUrls = urlsForUser(userID, urlDatabase);
if (Object.keys(userUrls).includes(req.params.id)) {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
} else {
  res.status(401).send("You do not have authorization to delete this short URL.");
}
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
  } else {
    const NewUserId = generateRandomString(6);
    users[NewUserId] = {
      id: NewUserId,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }
    req.session.user_id = NewUserId;
    res.redirect("/urls");
  }
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
  } else {
    res.status(403).send('Passwords dont match')
    return;
  }
} else {
  res.status(403).send('Email not found')
  return;
}
});

// Logging out and clearing cookie session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



  
  
