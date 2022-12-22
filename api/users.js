const express = require('express'); //Imports our express from node_modules
const usersRouter  = express.Router(); //This function is used to create a new router object
const { getAllUsers } = require('../db');//importing our getAllUsers function from our database

usersRouter.use((req, res, next) => { //.use invokes a function that starts your middleware 
    console.log('A request is being made to /users.js'); //checkpoint to see if our code is good 

    res.send({message: 'hello from /users!'}); //This is the message that will show up on the page
});

usersRouter.get('/', async(req, res) => { //get request asks the database for the data we want, then send it back to the user.


    const users = await getAllUsers();
    res.send({
      users: [users]
    });
  });
  

module.exports = usersRouter; //Exporting our usersRouter function 