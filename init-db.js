const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the database file path
const dbFilePath = path.join(__dirname, 'data', 'my_personal_contacts.db');

// Establish a connection to the personal contacts database
let personalContactsDB = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(`Failed to connect to the personal contacts database: ${err.message}`);
  } else {
    console.log('Connected to the personal contacts database.');
  }
});

// Create the contacts table if it doesn't exist
const createContactsTableQuery = `
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  notes TEXT,
  created TEXT,
  lastEdited TEXT
)`;

personalContactsDB.run(createContactsTableQuery, (err) => {
  if (err) {
    console.error(`Failed to create the contacts table: ${err.message}`);
  } else {
    console.log('Contacts table is ready.');
  }
});

// Close the connection to the personal contacts database
personalContactsDB.close((err) => {
  if (err) {
    console.error(`Error closing the database connection: ${err.message}`);
  } else {
    console.log('Connection to the personal contacts database closed.');
  }
});
