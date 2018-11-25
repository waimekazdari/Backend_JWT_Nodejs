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


getUsersList = function (usersJson){

        var parseUsers = [];
        if(!localStorage.getItem('usersLocal')){
            console.log('heeeeeeeeeeeeeeeeeeeeeere inside getUserList');
            let usersAsArray = [];
            Object.keys(usersJson).map((pid)=>{
                            usersAsArray.push(usersJson[pid]);
                          });
            usersAsArray = JSON.stringify(usersAsArray);
            localStorage.setItem('usersLocal',usersAsArray);
            console.log('inside : ');
            console.log(JSON.parse(localStorage.getItem('usersLocal')));
            //localStorage._deleteLocation()  ;//cleans up ./scratch created during doctest
            //  console.log('inside : '+localStorage.getItem('usersLocal'));
        }
        var objUsers = localStorage.getItem('usersLocal');
        parsUsers = JSON.parse(objUsers);
        console.log(parsUsers);
        users = parsUsers;
    }


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
  console.log('inside post');
  getUsersList(Users);

  console.log(users);
    const { email, password } = req.body;
    console.log(email);
    var test = false;
    for (i=0; i<users.length; i++) { // I am using a simple array users which i made above (from localStorage)

        console.log(users[i].email);
        if (email === users[i].email && password === users[i].password ) {
          test = true;
            //If all credentials are correct do this
            let token = jwt.sign({ id: users[i].id, email: users[i].email }, 'keyboard cat 4 ever', { expiresIn: 129600 }); // Sigining the token
            let users_id = users[i].id;
            console.log(users_id);
            res.json({
                sucess: true,
                err: null,
                token,
                users_id
            });
            break;
        }}
      if(test === true) {
            res.status(401).json({
                sucess: false,
                token: null,
                users_id: null,
                err: 'email or password is incorrect'
            });
        }



});

//check the data if the user alrealy authenticated
  checkUsersDataBase = (newUser)=>{

    getUsersList(Users);
    console.log('checkUsersDataBase 1 :');
    //console.log(getUsersList(Users));
    console.log(users);

    var checkUser= false;
    //var usersData = localStorage.getItem('usersLocal');
    //console.log('inside the checkUsersDataBase');
    //console.log(usersData);
  //  usersData = JSON.parse(usersData);
    console.log('inside the checkUsersDataBase : ');
    console.log(users);
    users.map((user)=>{

      if (user.email === newUser.email){
        checkUser = true;
      }
    });
    console.log('checkuser'+checkUser);
    return checkUser;
  }

// SIGN UP ROUTE
app.post('/signUp', (req, res) => {
    console.log('SIGN UP ROUTE');
    users = getUsersList(Users);

    //users = getUsersList(Users);

    //users = JSON.parse(users);
  //  console.log('inside the poste signup'+users);
    const newUser = req.body;
    //console.log(req.body);
    //console.log(newUser.id);
    var checkUser = checkUsersDataBase(newUser);
    if(!checkUser){
      console.log('here here ');
      users.push(newUser);
      console.log(users);
      var parsUsers = JSON.stringify(users);
      console.log(parsUsers);
      localStorage.removeItem('usersLocal');
      localStorage.setItem('usersLocal',parsUsers);

      //console.log('inside SIGN UP ROUTE 2 '+newUser);
      let token = jwt.sign({ id: newUser.id, email: newUser.email }, 'keyboard cat 4 ever', { expiresIn: 129600 }); // Sigining the token
      let users_id = newUser.id;
      res.json({
          sucess: true,
          err: null,
          token,
          users_id
      });
    }else {
      res.status(401).json({
          sucess: false,
          token: null,
          users_id: null,
          err: 'email or password is incorrect'
      });
      res.send('You are already authenicated');
    }
});

//app.get('/signUp', jwtMW /* Using the express jwt MW here */, (req, res) => {
  //  res.send('You are added with succes'); //Sending some response when authenticated
//});

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
