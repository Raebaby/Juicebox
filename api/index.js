const express = require('express'); //importing node_modules
const apiRouter = express.Router(); //creating a new router object for api 
const usersRouter = require('./users'); //importing our usersRouter function from users.js

apiRouter.use('/users', usersRouter);// invokes a function that starts your middleware for the api router

module.exports = apiRouter; //exporting oour apiRouter function 

