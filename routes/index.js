var express = require("express");
var router = express.Router();
const db = require("./queries");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/signup", db.signUp);
router.post("/login", db.logIn);

router.get('/admin/users', db.verifyToken, db.getUser);
router.delete('/admin/users/:id', db.verifyToken,db.deleteUser);
router.put('/password', db.verifyToken,db.changePassword);

router.get('/admin/mangas',db.verifyToken,db.getMangaByAdmin);
router.get("/mangas", db.getManga);
router.get("/mangas/subscribed", db.verifyToken, db.getFavoriteManga);
router.get("/mangas/:id", db.getMangaById);
router.delete("/mangas/:id", db.verifyToken, db.deleteManga);
router.post("/mangas", db.verifyToken, db.addManga);
router.put("/mangas/:id", db.verifyToken, db.updateManga);
router.put("/mangas/:mangaid/rating", db.verifyToken, db.addRating);
router.put("/mangas/:mangaid/subscription", db.verifyToken, db.addFavorite);

router.get('/mangas/:id/chapters',db.getChapters)
router.post('/mangas/:id/chapters',db.verifyToken, db.addChapter);
router.get('/mangas/:mangaid/chapters/:chapterid', db.getChapterById);
router.put('/mangas/:mangaid/chapters/:chapterid',db.verifyToken, db.updateChapter);
router.delete('/mangas/:mangaid/chapters/:chapterid',db.verifyToken, db.deleteChapter);
router.get('/mangas/:mangaid/chapters/:chapterid/comments', db.getComment);
router.post('/mangas/:mangaid/chapters/:chapterid/comments',db.verifyToken, db.addComment);

router.put('/password',db.verifyToken,db.changePassword);
router.get('/admin/users',db.verifyToken,db.getUser);
router.delete('/admin/users/:id', db.verifyToken,db.deleteUser);
router.get('/info',db.verifyToken,db.getInfo);
router.get('/genres', db.getGenre);
router.get('/mangas/:id/genres',db.getGenreByManga);

module.exports = router;
