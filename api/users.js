const express = require('express'); //Imports our express from node_modules
const usersRouter  = express.Router(); //This function is used to create a new router object
const { getAllUsers } = require('../db');//importing our getAllUsers function from our database
const { getUserByUserName } = require("../db");
const { createUser } = require('../db')
const jwt = require('jsonwebtoken');





usersRouter.use((req, res, next) => { //.use invokes a function that starts your middleware 
    console.log('A request is being made to /users.js'); //checkpoint to see if our code is good 
    //res.send({message: 'hello from /users!'}); //This is the message that will show up on the page
    next();
});




usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body)
  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUserByUserName(username);
    
    if (user && user.password == password) {
      
    const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET)
    console.log(process.env.JWT_SECRET)
      // create token & return to user
      console.log(token)
      res.send({ message: "you're logged in!", token: token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
  


usersRouter.post('/register', async (req, res, next) => {
  const {username, password, name, location} = req.body
  try {
    const _user = await getUserByUserName(username) 
    
    if(_user) {
      next({name: 'UserExistsError',message: 'A user by that username already exists'})
    }
    const user = await createUser ({
      username,
      password,
      name,
      location,
    })
    const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET)
    console.log(token)
    res.send({ 
      message: "thank you for signing up",
      token 
    });
  }catch({name, message}) {
  
    next({name, message})
  }
})




usersRouter.get('/', async(req, res) => { //get request asks the database for the data we want, then send it back to the user.
  const users = await getAllUsers();
  res.send({
    users: [users]
  });
});


module.exports = usersRouter; //Exporting our usersRouter function 