// inside db/seed.js

// grab our client with destructuring from the export in index.js
const { client, getAllUsers } = require('./index');

async function testDB() {
  try {    

    client.connect();// connect the client to the database, finally

    const { rows } = await client.query(`SELECT * FROM users;`);// queries are promises, so we can await them

    const users = await getAllUsers();
    console.log(users)
    
    console.log(rows);// using console.log is a way to see how your code is
  } catch (error) {
    console.error(error);
  } finally {
    client.end();// it's important to close out the client connection
  }
}

testDB();