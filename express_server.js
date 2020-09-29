const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6); //generates random string of 6 letters & numbers
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//shows an object of all url key val pairs in the DB
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Shows index of urls in DB
app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
  };

  res.render("urls_index", templateVars);
})

//Form to add new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

//Create page w info about a single url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
}) 

//redirect to website of longURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send('ERROR: URL not in Database')
  }
  res.redirect(urlDatabase[req.params.shortURL]);
})

//Add new URL to DB
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

//Edit entry
app.post('/urls/:shortURL', (req, res) => {
  const changedURL = req.body.changedURL;
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = changedURL;

  res.redirect(`/urls/${shortURL}`);
});

//Delete button for each entry
app.post('/urls/:shortURL/delete', (req, res) => {
  const url = req.params.shortURL
  delete urlDatabase[url];

  res.redirect('/urls');
});

//Login to website
app.post('/login', (req, res) => {
  const loginID = req.body.username;
  res.cookie('username', loginID);

  res.redirect('/urls');
});

//Logout of website
app.post('/logout', (req, res) => {
  res.clearCookie('username')

  res.redirect('/urls');
});

// catchall
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});