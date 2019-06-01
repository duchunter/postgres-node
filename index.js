//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const db = require('./queries');
const port = 5432;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
// const pg = require('pg');
// const {
//   Pool,
//   Client
// } = require('pg');
// const secret = 'secret';
// const pool = new Pool({
//   user: 'hlsmdgqaswlniw',
//   host: 'ec2-50-19-114-27.compute-1.amazonaws.com',
//   database: 'dfes281hj43dmk',
//   password: 'f738dbfb04c124e4ebf77906679adb44e682b588273fe9eaa5c0bc551aa50774',
//   port: '5432'
// });

app.get('/auth',(request, response) =>{
  response.json({
    message: '🔒🔒🔒'
  });
});
app.post('/signup', db.signUp);
app.post('/login', db.logIn);
// app.post('/decode',db.decodeToken);


app.get('/mangasbypage', db.getManga);
app.get('/mangasbyname', db.getMangaByName);
app.get('/mangasbygenre', db.getMangaByGenre);
app.get('/mangas/:id', db.getMangaById);
app.get('/users/:id/sb',db.verifyToken,db.getFavoriteManga);
app.put('/mangas/:id', db.verifyToken,db.updateManga);
app.put('/mangas/:mangaid/rating', db.verifyToken,db.addRating);
app.put('/mangas/:mangaid/subscribed', db.verifyToken,db.addFavorite);
app.delete('/mangas/:id', db.verifyToken,db.deleteManga);
app.post('/mangas', db.verifyToken,db.addManga);


app.get('/mangas/:id/chapters',db.getChapters)
app.post('/chapters',db.verifyToken, db.addChapter);
app.get('/chapters', db.getChapterById);
app.put('/chapters',db.verifyToken, db.updateChapter);
app.delete('/chapters',db.verifyToken, db.deleteChapter);
app.get('/chapters/comments', db.getComment);
app.post('/chapters/comments/:mangaid',db.verifyToken, db.addComment);

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API'
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
