const PORT = 3000; 
const express = require('express'); // Requires the Express module and puts it in a variable.
const server = express();

server.listen (PORT, () => {
    console.log('The server is up on port', PORT)
});
