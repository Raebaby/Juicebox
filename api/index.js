const express = require('express'); //importing node_modules

//JSON webtoken REQUIRE/IMPORTS
const jwt = require('jsonwebtoken');
const {getUserById} = require('../db');
const { JWT_SECRET } = process.env;

//API ROUTES REQUIRE/IMPORTS
const apiRouter = express.Router(); //creating a new router object for api 
const usersRouter = require('./users'); //importing our usersRouter function from users.js
const postsRouter = require('./post');
const tagsRouter = require('./tags');
const { token } = require('morgan');



console.log('Required JSON & API routes') //TESTING



apiRouter.use(async (req, res, next) => {
    console.log('JSON Webtoken function is running')
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    if(!auth) {
        next ()
    }else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length)
        try {
            const {id} = jwt.verify(token, JWT_SECRET)
            if (id) {
                req.user = await getUserById(id)
                next ()
            }
        }catch({name, message}) {
            next({name, message })
        }
    } else {
        next ({
            name: 'AuthoizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        })
    }
});


//API ROUTES - Connect apirouter to the middle ware in our other pages
apiRouter.use('/users', usersRouter);// invokes a function that starts your middleware for the api router
apiRouter.use('/posts', postsRouter);// invokes a function that starts your posts middleware for the api router
apiRouter.use('/tags', tagsRouter);//Allows us to use the middleware functions written in api/tags



console.log('API routes are connected to the imported routes') //TESTING



apiRouter.use((req, res, next)=> {
    if(req.user){
      console.log("User is set", req.user);
    }

    next();
  })

apiRouter.use((error, req, res, next) => {
    res.send({
      name: error.name,
      message: error.message
    });
  });

module.exports = apiRouter; //exporting our apiRouter function 

