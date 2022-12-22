const express = require('express'); //importing node_modules


//API ROUTES REQUIRE/IMPORTS
const usersRouter = require('./users'); //importing our usersRouter function from users.js
const postsRouter = require('./post');
const tagsRouter = require('./tags');
const apiRouter = express.Router(); //creating a new router object for api 

//API ROUTES - Connect apirouter to the middle ware in our other pages
apiRouter.use('/users', usersRouter);// invokes a function that starts your middleware for the api router
apiRouter.use('/posts', postsRouter);// invokes a function that starts your posts middleware for the api router
apiRouter.use('/tags', tagsRouter);//Allows us to use the middleware functions written in api/tags

module.exports = apiRouter; //exporting oour apiRouter function 

