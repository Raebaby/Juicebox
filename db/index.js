const { Client } = require('pg'); // imports the pg module

const client = new Client('postgres://localhost:5432/juicebox-dev'); //location and name of our database 

module.exports = {
    client,
}

async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username 
      FROM users;
    `);
  
    return rows;
  }
  
  // and export them
  module.exports = {
    client,
    getAllUsers,
  }