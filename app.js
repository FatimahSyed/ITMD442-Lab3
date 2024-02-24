const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');

const app = express();
const contactsPath = path.join(__dirname, 'contacts.json');

// Middleware setup
app.use(express.json(), express.urlencoded({ extended: false }), methodOverride('_method'), express.static(path.join(__dirname, 'public')))
   .set('views', path.join(__dirname, 'views')).set('view engine', 'pug');

// Helper functions for reading and writing contacts
const readContacts = () => {
  try {
    return JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') console.log('Contacts file does not exist, initializing with an empty array.');
    else throw err;
    return [];
  }
};

const writeContacts = (contacts) => fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));

// Route handlers
app.get('/', (req, res) => res.render('index'));

app.route('/contacts')
  .get((req, res) => res.render('contacts', { contacts: readContacts() }))
  .post((req, res) => {
    const contacts = readContacts();
    contacts.push({ id: uuidv4(), ...req.body, created: new Date().toISOString(), lastEdited: new Date().toISOString() });
    writeContacts(contacts);
    res.redirect(`/contacts/${contacts[contacts.length - 1].id}`);
  });

app.get('/contacts/new', (req, res) => res.render('new'));

app.route('/contacts/:id')
  .get((req, res) => {
    const contact = readContacts().find(c => c.id === req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    res.render('contact', { contact, createdFormatted: new Date(contact.created).toLocaleString(), lastEditedFormatted: new Date(contact.lastEdited).toLocaleString() });
  })
  .put((req, res) => {
    let contacts = readContacts();
    const index = contacts.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...req.body, lastEdited: new Date().toISOString() };
      writeContacts(contacts);
    }
    res.redirect(`/contacts/${req.params.id}`);
  });

app.get('/contacts/:id/edit', (req, res) => {
    const contact = readContacts().find(c => c.id === req.params.id);
    if (contact) res.render('editContact', { contact });
    else res.status(404).send('Contact not found');
  });

app.delete('/contacts/:id', (req, res) => {
  const contacts = readContacts().filter(c => c.id !== req.params.id);
  writeContacts(contacts);
  res.redirect('/contacts');
});

app.use((err, req, res, next) => res.status(500).send(`Something broke! Error: ${err.message}`));

app.listen(3000, () => console.log('Server started on port 3000'));
