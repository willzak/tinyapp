const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response } = require("express");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6); //generates random string of 6 letters & numbers
};

const checkEmail = (email) => {
  for (let account in users) {
    if (email === users[account].email) {
      return account;
    }
  }
  return '';
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

  "haneul": {
    id: "haneul",
    email: "han@gmail.com", 
    password: "password"
  },

 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
    user: null
  };

  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
  }
  res.render("urls_index", templateVars);
})

//Form to add new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: null
  };
  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
  }
  res.render('urls_new', templateVars);
});

//Create page w info about a single url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: null
  };

  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
  }

  res.render('urls_show', templateVars);
}) 

//redirect to website of longURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send('ERROR: URL not in Database')
  }
  res.redirect(urlDatabase[req.params.shortURL]);
})

//Create a registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: null
  }
  
  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
  }

  res.render('urls_register', templateVars)
})

//Create a login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  };

  res.render('login_form', templateVars);
})




//POST requests

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
  const email = req.body.email;
  const password = req.body.password;
  const accId = checkEmail(email)
  console.log(accId)

  if (!email || !password) {
    res.status(400).json({message: 'Bad Request no email or password provided'});
  } else if (users[accId].email === email && users[accId].password === password) {
    res.cookie('userId', accId);
    res.redirect('/urls');
  } else {
    res.status(403).json({message: 'Incorrect username'});
  }
});

//Logout of website
app.post('/logout', (req, res) => {
  res.clearCookie('userId')

  res.redirect('/urls');
});

//Create endpoint for registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({message: 'Bad Request: No email or password entered'});
  };

  if(checkEmail(email) === '') {
    return res.status(400).json({message: 'ERROR: Email already in use'});
  }

  const randUserID = generateRandomString();
  users[randUserID] = {
    id: randUserID,
    email,
    password
  }

  res.cookie('userId', randUserID);

  res.redirect('/urls');
})

// catchall
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});