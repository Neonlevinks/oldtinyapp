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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2ID"}
};

const urlFinder = (ID) => {
  let result = {};
  for ( url in urlDatabase) {
    if (urlDatabase[url].userID === ID) {
      result[url] = { 
        longURL: urlDatabase[url].longURL,
        userID: ID
      }
      //urlDatabase[url].longURL;
    };
  };
  return result
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
};

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
  const userid = req.cookies["user_id"];
  if (!userid) {
    return res.redirect("/login");
  };
  const filteredDB = urlFinder(userid);
  const templateVars = { 
    user_id: userid,
    user: users[userid],
    urls: filteredDB,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const userid = req.cookies["user_id"]
  const templateVars = { 
    user_id: userid,
    user: users[userid],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: userid,
    user: users[userid],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
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
  urlDatabase[shortURL].longURL = editedURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  const userid = req.cookies["user_id"]
  const templateVars = { 
    user_id: userid,
    user: users[userid],
    urls: urlDatabase,
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userid = req.cookies["user_id"]
  const templateVars = { 
    user_id: userid,
    user: users[userid],
    urls: urlDatabase,
  };
  res.render("login", templateVars);
})

const findUser = (email, password) => {
  for (const object in users) {
    if (users[object].email === email && users[object].password === password) {
      return object;
    } 
  };
}

app.post("/login", (req, res) => {
  const userID = findUser(req.body.email, req.body.password)
  if (userID) {
    res.cookie("user_id", userID);
    return res.redirect("/urls",);
  }
  else {
    return res.status(403).send("Incorrect email/password");
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
      return res.status(400).send("Email is already registered");
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
