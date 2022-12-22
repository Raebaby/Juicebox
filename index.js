const PORT = 3000; 
const express = require('express'); // Requires the Express module and puts it in a variable.
const server = express(); // gives our express function and stores it in a variable
const apiRouter = require('./api'); // importing apiRouter function 
const morgan = require('morgan'); //Import our morgan package/dependency that we installed 


server.use(morgan('dev')); // sets up of middleware functions with the ablility to use out morgan dependency 

server.use(express.json()) //// sets up of middleware functions with the ablility to use our express server and dependency 

const { client } = require('./db'); //conncet client to server
client.connect();

server.listen (PORT, () => {
    console.log('The server is up on port', PORT)
});

server.use((req, res, next) => {
    console.log("The body loggin is starting") // the request object (built from the client's request)
    console.log(req.body)                      // the response object (which has methods to build and send back a response)
    console.log("The body logging has ended")  // the next function, which will move forward to the next matching middleware

    next();
});

server.use('/api', apiRouter);

// The method: get, post, patch, put, and delete, or method agnostic (use)
// An optional request path that must be matched, e.g. /api/users, or even with a placeholder /api/users/:userId
// A function with either three or four parameters
// three parameter needs request, response, and next in that order
// four parameter needs error, request, response and next, in that order
// four parameter functions are considered error handling middleware (which is why the error is prioritized)
