const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { request, response } = require("express");
const PORT = 8080;
const generateRandomString = () => Math.random().toString(36).substr(2, 6) //make a 6 character string of random alphanumeric characters

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: "dishwasher-sink"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b/>")
});

app.get("/urls", (req, res) => {
  const userid = req.cookies["user_id"]
  const templateVars = { 
    user_id: userid,
    user: users[userid],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userid = req.cookies["user_id"];
  const templateVars = { 
    user_id: req.cookies["user_id"],
    user: users[userid]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: userid
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const editedURL = req.body.text;
  urlDatabase[shortURL] = editedURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: null, 
    user_id: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: null, 
    user_id: req.cookies["user_id"]};
  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  for (const object in users) {
    if (users[object].email === req.body.email && users[object].password === req.body.password) {
      res.cookie("user_id", object);
      return res.redirect("/urls",);
    } else {
      res.status(403).send("Incorrect email/password").end;
    };
  };
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const user = generateRandomString();
  for (const object in users) {
    if (users[object].email === req.body.email) {
      res.status(400).send("Email is already registered").end
    }
  };
  users[user] = {
    id: user,
    email: req.body.email,
    password: req.body.password
  };  
  if (!users[user].email || !users[user].password) {
    res.status(400).send("Invalid input").end();
  };
  res.cookie("user_id", users[user].id);
  res.redirect("/urls") ;
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
