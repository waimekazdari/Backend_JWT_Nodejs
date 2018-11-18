// Bringing all the dependencies in
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
var Users = require('./Users');
var users = [] ;
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


// Instantiating the express app
const app = express();


getUsersList = (usersJson)=>{

        if(!localStorage.getItem('usersLocal')){
          let usersAsArray = [];
          Object.keys(usersJson).map((pid)=>{
                          usersAsArray.push(usersJson[pid]);
                        });
          console.log(usersAsArray);
          usersAsArray = JSON.stringify(usersAsArray);
          localStorage.setItem('usersLocal',usersAsArray);
          console.log('inside getUsersList');
        // localStorage._deleteLocation()  ;//cleans up ./scratch created during doctest
        }
        var parseUsers = JSON.parse(localStorage.getItem('usersLocal'));
        return parseUsers;
    }

users = getUsersList(Users);
console.log('outside');
console.log(users);
// See the react auth blog in which cors is required for access
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// Setting up bodyParser to use json and set it to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// INstantiating the express-jwt middleware
const jwtMW = exjwt({
    secret: 'keyboard cat 4 ever'
});

// MOCKING DB just from LocalStorage
//var users = JSON.parse(localStorage.getItem('usersLocal'));


// LOGIN ROUTE
app.post('/', (req, res) => {
  console.log('inside the poste'+users);
    const { email, password } = req.body;
    for (let user of users) { // I am using a simple array users which i made above (from localStorage)
        console.log(user);
        if (email == user.email && password == user.password ) {

            //If all credentials are correct do this
            let token = jwt.sign({ id: user.id, email: user.email }, 'keyboard cat 4 ever', { expiresIn: 129600 }); // Sigining the token
            res.json({
                sucess: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                sucess: false,
                token: null,
                err: 'email or password is incorrect'
            });
        }
    }
});

app.get('/', jwtMW /* Using the express jwt MW here */, (req, res) => {
    res.send('You are authenticated'); //Sending some response when authenticated
});

// Error handling
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') { // Send the error rather than to show it on the console
        res.status(401).send(err);
    }
    else {
        next(err);
    }
});

// Starting the app on PORT 3000
const PORT = 8080;
app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`Magic happens on port ${PORT}`);
});
