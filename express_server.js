const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getIdByEmail = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['thisisasecretkey', 'thisisanothersupersecretkey']
}));

const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6); //generates random string of 6 letters & numbers
};

const urlsForUser = (id) => {
  //returns the URLS where userId = current user's ID
  let res = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userId === id) {
      res[item] = urlDatabase[item];
    }
  }
  return res;
}

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "haneul"
  },

  "9sm5xK": {
    longURL: "http://www.google.com", 
    userId: 'aJ48lW'
  }
};

const users = {

  "haneul": {
    id: "haneul",
    email: "han@gmail.com", 
    password: "password"
  },

 "hubugy": {
    id: "user2RandomID", 
    email: "examp@le.com", 
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
    urls: null,
    user: null
  };

  if (req.session.userId && users[req.session.userId]) {
    templateVars.user = users[req.session.userId];
  } else {
    return res.render("urls_index", templateVars);
  }

  templateVars.urls = urlsForUser(templateVars.user.id);

  res.render("urls_index", templateVars);
})

//Form to add new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: null
  };

  if (req.session.userId && users[req.session.userId]) {
    templateVars.user = users[req.session.userId];
  } else {
    return res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});

//Create page w info about a single url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: null
  };

  if (req.session.userId && users[req.session.userId]) {
    templateVars.user = users[req.session.userId];
  }

  res.render('urls_show', templateVars);
}) 

//redirect to website of longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL] === undefined) {
    return res.send('ERROR: URL not in Database')
  }
  res.redirect(urlDatabase[shortURL].longURL);
})

//Create a registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: null
  }
  
  if (req.session.userId && users[req.session.userId]) {
    templateVars.user = users[req.session.userId];
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

//Redirect at logout
app.get('/logout', (req, res) => {
  res.redirect('/login')
})




//POST requests

//Add new URL to DB
app.post('/urls', (req, res) => {
  const userId = req.session.userId
  const longURL = req.body.newLongURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL,
    userId
  };

  res.redirect(`/urls/${shortURL}`);
});

//Edit entry
app.post('/urls/:shortURL', (req, res) => {
  const changedURL = req.body.changedURL;
  const shortURL = req.params.shortURL;
  const user = req.session.userId;

  if (urlDatabase[shortURL].userId === user) {
    urlDatabase[shortURL] = changedURL;
  }

  res.redirect(`/urls/${shortURL}`);
});

//Delete button for each entry
app.post('/urls/:shortURL/delete', (req, res) => {
  const url = req.params.shortURL
  const user = req.session.userId

  if (urlDatabase[url].userId === user) {
    delete urlDatabase[url];
  }

  res.redirect('/urls');
});

//Login to website
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let accId = getIdByEmail(email, urlDatabase);
  const currentUser = users[accId];

  if (currentUser.email === email) {
    if (bcrypt.compareSync(password, currentUser.password)) {
      req.session.userId = accId;
      return res.redirect('/urls');
    } else {
      return res.status(403).json({message: "Incorrect password given"});
    }
  } else if (!email || !password) {
    return res.status(400).json({message: "Bad Request: No email or password given"});
  } else {
    return res.status(403).json({message: "Incorrect email"});
  };

});

//Logout of website
app.post('/logout', (req, res) => {
  req.session = null;

  res.redirect('/urls');
});

//Create endpoint for registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const randUserID = generateRandomString();

  if (!email || !password) {
    return res.status(400).json({message: 'Bad Request: No email or password entered'});
  };

  if(getIdByEmail(email, urlDatabase) !== '') {
    return res.status(400).json({message: 'ERROR: Email already in use'});
  };

  users[randUserID] = {
    id: randUserID,
    email,
    password: hashedPassword
  };

  req.session.userId = randUserID;

  res.redirect('/urls');
})

// catchall
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});