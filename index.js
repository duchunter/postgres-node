//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./queries');
const port = 3000;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'WebTruyen',
  password: 'postgres',
  port: '5432'
});

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API'
  });
});
app.get('/admins', db.getAdmins);
app.get('/admins/:id', db.getAdminById);
app.delete('/admins/:id', db.deleteAdmin);

app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.put('/users/:id', db.promoteUser);
app.delete('/users/:id', db.deleteUser);

app.get('/mangas', db.getManga);
app.get('/mangas/:id', db.getMangaById);
app.post('/mangas', db.addManga);



app.post('/mangas/chapters/:id', db.addChapter);
app.post('/mangas/chapters/:id', db.getChapterById);


app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
