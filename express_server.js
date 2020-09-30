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

//Returns the user id for a given email, or empty string if email not in DB
const checkEmail = (email) => {
  for (let account in users) {
    if (email === users[account].email) {
      return account;
    }
  }
  return '';
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
    urls: null,
    user: null
  };

  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
  } else {
    res.render(res.render("urls_index", templateVars));
  }

  templateVars.urls = urlsForUser(templateVars.user.id);

  res.render("urls_index", templateVars);
})

//Form to add new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: null
  };

  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
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

  if (req.cookies.userId && users[req.cookies.userId]) {
    templateVars.user = users[req.cookies.userId];
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

  if (!email || !password) {
    res.status(400).json({message: 'Bad Request no email or password provided'});
  } else if (users[accId].email === email) {
      if (users[accId].password === password) { //check if email and password match
        res.cookie('userId', accId);
        res.redirect('/urls');
      } else {
        res.status(403).json({message: 'Incorrect password given'})
      }
    } else {
      res.status(403).json({message: 'Incorrect email'});
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

  if(checkEmail(email) !== '') {
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