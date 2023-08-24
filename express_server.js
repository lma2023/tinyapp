const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const checkHttp = (url) => {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "https://" + url;
  } 
  return url;
}
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
    const templateVars = {
      username: req.cookies.username,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    const templateVars = {
      username: req.cookies.username,
    };
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username };
    res.render("urls_show", templateVars);
  });

  app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  });

 app.post("/urls", (req, res) => {
    const id = generateRandomString(6); 
    const url = req.body.longURL;
    urlDatabase[id] = checkHttp(url);
    res.redirect(`/urls/${id}`);
  });

  app.post("/urls/:id", (req, res) => {
      const id = req.params.id;
      const url = req.body.longURL;
      urlDatabase[id] = checkHttp(url);
      res.redirect("/urls/");
    });
  
    app.post("/urls/:id/delete", (req, res) => {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    });

  app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie("username", username);
    res.redirect("/urls");
  })

  app.post("/logout", (req, res) => {
    const username = req.body.username;
    res.clearCookie("username");
    res.redirect('/urls');
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
  
  
