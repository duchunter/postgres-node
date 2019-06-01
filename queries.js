//jshint esversion:6
const jwt = require('jsonwebtoken');
const {
  Pool,
  Client
} = require('pg');
const secret = 'secret';
const pool = new Pool({
  user: 'hlsmdgqaswlniw',
  host: 'ec2-50-19-114-27.compute-1.amazonaws.com',
  database: 'dfes281hj43dmk',
  password: 'f738dbfb04c124e4ebf77906679adb44e682b588273fe9eaa5c0bc551aa50774',
  port: '5432'
});
//GET admins
//Create tokenn done
function createToken(userName) {
  let expirationDate = Math.floor(Date.now() / 1000) + 180 * 60 // 3hours from now
  var token = jwt.sign({
    exp: expirationDate,
    data: userName
  }, secret);

  return token;
}
//Verify token done
function verifyToken(req, res, next) {
  //GET auth header values
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    //split at the space
    const bearer = bearerHeader.split(' ');
    //get token ffrom array
    const bearerToken = bearer[1];
    //set the token
    req.token = bearerToken;
    //next middleware
    next();
  } else {
    res.sendStatus(401);
  }
}

//Done mangas
//GET all Mangas
const getManga = (request, response) => {
  var offset = request.query.page * 20 - 20;
  pool.query({
    text: `SELECT * FROM "Manga" LIMIT 20 OFFSET $1 `,
    values: [offset]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
//GET manga by name
const getMangaByName = (request, response) => {
  // console.log(request.query);
  var name = request.query.name.toUpperCase();;
  console.log(name);
  pool.query({
    text: `SELECT * FROM "Manga" WHERE Upper(manga_name) LIKE $1 `,
    values: ['%' + name + '%']
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);

  });
};
//GET manga by genre
const getMangaByGenre = (request, response) => {
  var genre = request.query.genre.toUpperCase();
  console.log(genre);
  pool.query({
    text: `SELECT manga_name
          FROM "Manga"
          WHERE manga_id IN (SELECT manga_id
                              FROM "Genre"
                              WHERE Upper(gen_name) LIKE $1)  `,
    values: ['%' + genre + '%']
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);

  });
};
//POST new manga
const addManga = (request, response) => {
  const {
    mangaID,
    mangaName,
    description,
    numOfChap,
    author,
    genre,
    cover
  } = request.body;
  //verify token
  if (mangaName == null) {
    response.status(400).send('Missing manga name');
  }else{
    jwt.verify(request.token, secret, (err, authData) => {
      if (err) {
        response.status(401);
      } else {
        var data = authData.data;
        var check = data.indexOf("admin");
        if (check != -1) {
          pool.query({
            text: 'SELECT * FROM "Manga" WHERE manga_name = $1 OR manga_id = $2',
            values: [mangaName,mangaID]
          }, (error, result) => {
            if (result.rowCount != 0) {
              response.status(500).send('Manga existed!');
            } else {
              pool.query({
                text: `INSERT INTO "Manga"(manga_id,manga_name,description,num_of_chap, author, cover) VALUES($1,$2,$3,$4,$5,$6)`,
                values: [mangaID, mangaName, description, numOfChap, author, cover]
              }, (error, result) => {
                if (error) {
                  response.status(500).send('Sever error')
                } else {
                  pool.query({
                    text: `INSERT INTO "Genre"(manga_id,gen_name) VALUES($1,$2)`,
                    values: [mangaID,genre]
                  }, (error, result) => {
                    if (error) {
                      response.status(500).send('Sever error')
                    } else {
                      response.status(201).send(`Added manga with ID: ${mangaID}`);
                    }
                  });
                }
              });
            }
          });
        } else {
          response.sendStatus(403);
        }
      }
    })
  }
};
//GET subcribed manga
const getFavoriteManga = (request, response) => {
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var data = authData.data;
      var str = data.split(" ");
      var username = str[0];
      pool.query({
        text: `SELECT * FROM "Manga" WHERE manga_id IN (SELECT manga_id FROM "Favorite" WHERE user_name = $1)`,
        values: [username]
      }, (error, result) => {
        if (error) {
          response.status(500).send('Sever error')
        } else {
          response.status(200).json(result.rows);
        }
      });

    }
  })
};
//GET manga by id
const getMangaById = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query({
    text: 'SELECT * FROM "Manga" WHERE manga_id = $1',
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rowCount == 0) {
      response.status(404).send('Manga not found');
    } else {
      response.status(200).json(results.rows);
    }
  });
};
//PUT add rating
const addRating = (request, response) => {
  var point = request.body.rating;
  var mangaId = request.params.mangaid;
  if (!point) {
    response.status(400).send('Missing rating point');
    return;
  }
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var username = (authData.data.split(" "))[0];
      pool.query({
        text: 'SELECT * FROM "Rating" WHERE manga_id = $1 AND user_name = $2',
        values: [mangaId, username]
      }, (error, result) => {
        if (result.rowCount == 0) {
          pool.query({
            text: 'INSERT INTO "Rating" (manga_id,user_name,point) VALUES($1,$2,$3)',
            values: [mangaId, username, point]
          }, (error, result) => {
            if (error) {
              response.status(500).send('Sever error');
            } else {
              response.status(201).send('Add');
            }
          });
        } else {
          pool.query({
            text: 'UPDATE "Rating" SET point = $3 WHERE manga_id = $1 AND user_name = $2',
            values: [mangaId, username, point]
          }, (error, result) => {
            if (error) {
              response.status(500).send('Sever error');
            } else {
              response.status(201).send('Update');
            }
          });
        }
      })

    }
  })
};
//PUT add Favorite
const addFavorite = (request, response) => {
  var subscribed = request.body.subscribed;
  var mangaId = request.params.mangaid;
  if (subscribed == null) {
    response.sendStatus(400);
  } else {
    jwt.verify(request.token, secret, (err, authData) => {
      if (err) {
        response.sendStatus(401);
      } else {
        var username = (authData.data.split(" "))[0];
        console.log(username);
        if (subscribed == 1) {
          pool.query({
            text: 'INSERT INTO "Favorite"(user_name,manga_id) VALUES($1,$2)',
            values: [username, mangaId]
          }, (error, result) => {
            if (error) {
              response.sendStatus(500).send('Server error!');
            } else {
              response.sendStatus(200);
            }
          });
        } else if (subscribed != 1) {
          pool.query({
            text: 'DELETE FROM "Favorite" WHERE manga_id = $1',
            values: [mangaId]
          }, (error, result) => {
            if (error) {
              response.sendStatus(500).send('Server error!');
            } else {
              response.sendStatus(200);
            }
          });
        }
      }
    })
  }
};
//DELETE manga
const deleteManga = (request, response) => {
  const id = parseInt(request.params.id);
  //verify token
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var data = authData.data;
      var check = data.indexOf("admin");
      if (check != -1) {
        pool.query({
          text: 'DELETE FROM "Manga" WHERE manga_id = $1',
          values: [id]
        }, (error, result) => {
          if (error) {
            response.status(500).send('Sever error')
          } else {
            response.status(200).send(`Manga deleted with ID: ${id}`);
          }
        });
      } else {
        response.sendStatus(403);
      }
    }
  })
};
//update manga
const updateManga = (request, response) => {
  const id = parseInt(request.params.id);
  const {
    mangaID,
    mangaName,
    description,
    numOfChap,
    author,
    cover
  } = request.body;
  if (mangaName == null | mangaID == null) {
    response.status(400).send('Missing information');
  }
  //verify token
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {

      var data = authData.data;
      var check = data.indexOf("admin");
      if (check != -1) {
        pool.query({
          text: 'UPDATE "Manga" SET manga_id = $1, manga_name = $2, description = $3, num_of_chap = $4, author = $5, cover = $7 WHERE manga_id = $6',
          values: [mangaID, mangaName, description, numOfChap, author, id, cover]
        }, (error, result) => {
          if (error) {
            response.status(500).send('Sever error')
          } else {
            response.status(200).send(`Manga updated`);
          }
        });
      } else {
        response.sendStatus(403);
      }
    }
  })
};
//POST add new Chapter
const addChapter = (request, response) => {
  const {
    mangaId,
    chapId,
    chap_name,
    chap_content,
    time
  } = request.body;
  if (mangaId == null || chapId == null || chap_name == null || chap_content == null) {
    response.sendStatus(400);
  }
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var data = authData.data;
      var check = data.indexOf("admin");
      if (check != -1) {
        pool.query({
          text: 'SELECT * FROM "Chapter" WHERE manga_id = $1 AND chap_id = $2',
          values: [mangaId, chapId]
        }, (error, result) => {
          if (error) {
            response.sendStatus(500);
          } else {
            if (result.rowCount != 0) {
              response.sendStatus(500);
            } else {
              pool.query({
                text: `INSERT INTO "Chapter"(manga_id,chap_id,chap_name,chap_content) VALUES($1,$2,$3,$4)`,
                values: [mangaId, chapId, chap_name, chap_content]
              }, (error, result) => {
                if (error) {
                  response.sendStatus(500);
                }
                response.status(201).send(`Added chapter with id ${chapId} to manga with id: ${mangaId}`);
              });
            }
          }
        })
      } else {
        response.sendStatus(403);
      }
    }
  })
};
//GET all chapters of manga
const getChapters = (request, response) => {
  const mangaId = request.params.id;
  console.log(mangaId);
  pool.query({
    text: `SELECT chap_id,chap_name,chap_content,time_up FROM "Chapter" WHERE manga_id = $1`,
    values: [mangaId]
  }, (error, results) => {
    if (error) {
      response.status(404);
    }
    response.status(200).json(results.rows);
  });
};
//GET chapter by id
const getChapterById = (request, response) => {
  const mangaId = parseInt(request.query.manga);
  const chapId = parseInt(request.query.chapter);
  pool.query({
    text: `SELECT * FROM "Chapter" WHERE manga_id = $1 AND chap_id = $2`,
    values: [mangaId, chapId]
  }, (error, results) => {
    if (error) {
      response.sendStatus(404);
    }
    console.log(results.rows);
    response.status(200).json(results.rows);
  });
};
//PUT update chapter information
const updateChapter = (request, response) => {
  const manga = parseInt(request.query.manga);
  const chap = parseInt(request.query.chapter);
  const {
    mangaId,
    chapId,
    chap_name,
    chap_content,
    time
  } = request.body;
  if (mangaId == null | chapId == null | chap_name == null | chap_content == null) {
    response.status(400).send('Missing information');
  }
  //verify token
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var data = authData.data;
      var check = data.indexOf("admin");
      if (check != -1) {
        pool.query({
          text: 'UPDATE "Chapter" SET manga_id = $1, chap_id = $2, chap_name = $3, chap_content = $4 WHERE manga_id = $5 AND chap_id = $6',
          values: [mangaId, chapId, chap_name, chap_content, manga, chap]
        }, (error, result) => {
          if (error) {
            response.status(500).send('Sever error')
          } else {
            response.status(200).send(`Chapter updated`);
          }
        });
      } else {
        response.sendStatus(403);
      }
    }
  })
};
//DELETE chapter
const deleteChapter = (request, response) => {
  const manga = parseInt(request.query.manga);
  const chap = parseFloat(request.query.chapter);
  //verify token
  jwt.verify(request.token, secret, (err, authData) => {
    if (err) {
      response.sendStatus(401);
    } else {
      var data = authData.data;
      var check = data.indexOf("admin");
      if (check != -1) {
        pool.query({
          text: 'DELETE FROM "Chapter" WHERE manga_id = $1 AND chap_id = $2',
          values: [manga, chap]
        }, (error, result) => {
          if (error) {
            response.status(500).send('Sever error')
          } else {
            response.status(200).send(`Chaper deleted with ID: ${chap}`);
          }
        });
      } else {
        response.sendStatus(403);
      }
    }
  })
};
//GET Comments
const getComment = (request, response) => {
  const mangaId = parseInt(request.query.manga);
  const chapId = parseInt(request.query.chapter);
  pool.query({
    text: 'SELECT user_id,content,time_up FROM "Comment" WHERE manga_id = $1 AND chap_id = $2',
    values: [mangaId, chapId]
  }, (error, result) => {
    if (error) {
      response.sendStatus(404);
    } else {
      response.status(200).json(result.rows);
    }
  });
};
//POST add comment
const addComment = (request, response) => {
  const mangaId = parseInt(request.params.mangaid);
  // const chapId = parseInt(request.query.chapter);
  const {
    user_name,
    chap_id,
    content,
    time
  } = request.body;
  if (user_name == null | chap_id == null | content == null) {
    response.sendStatus(400);
  } else {
    //verify user
    jwt.verify(request.token, secret, (err, authData) => {
      if (err) {
        response.sendStatus(401);
      } else {
        pool.query({
          text: 'INSERT INTO "Comment"(user_name,manga_id,chap_id,content) VALUES($1,$2,$3,$4)',
          values: [user_name,mangaId, chap_id, content]
        }, (error, result) => {
          if (error) {
            // response.status(500).send('Sever error')
            throw error;
          } else {
            response.status(200).send(`Comment added`);
          }
        });
      }
    })
  }
};
//GET genre
const getGenre = (request, response) => {
  const mangaId = request.params.id;
  console.log(mangaId);
  pool.query({
    text: `SELECT DISTINCT gen_name FROM "Genre" `,
  }, (error, results) => {
    if (error) {
      response.status(404);
    }
    response.status(200).json(results.rows);
  });
};
//POST Sign up
function validUser(user) {
  const validUsername = typeof user.username == 'string' && user.username.trim() != ' ';
  const validPassword = typeof user.password == 'string' && user.username.trim() != ' ' && user.password.trim().length >= 8;

  return validUsername & validPassword;
}
//POST signup
const signUp = (req, res) => {
  var user = req.body;
  if (validUser(user)) {
    pool.query({
      text: 'SELECT user_name FROM "User" WHERE user_name = $1',
      values: [user.username]
    }, (error, results) => {
      if (results.rowCount == 0) {
        pool.query({
          text: `INSERT INTO "User"(user_name,pass) VALUES($1,$2)`,
          values: [user.username, user.password]
        }, (error, result) => {
          if (error) {
            throw error;
          }
          res.status(201).send(`User added `);
        });
      } else {
        //if the username is already in the database
        res.status(400).json({
          message: 'Username had been used'
        });
      }
    });
  } else {
    res.status(400).json({
      message: 'Invalid username or password!'
    });
  }
};
//POST login
const logIn = (req, res) => {
  var user = req.body;
  if (validUser(user)) {
    pool.query({
      text: 'SELECT user_id FROM "User" WHERE user_name = $1 AND pass = $2',
      values: [user.username, user.password]
    }, (error, results) => {
      //if the username is  in the database
      if (results.rowCount != 0) {
        let id = results.rows[0].user_id;
        //if user is admin
        pool.query({
          text: 'SELECT * FROM "Admin" WHERE admin_id = $1',
          values: [id]
        }, (error, results) => {
          if (results.rowCount != 0) {
            res.send(createToken(user.username + " is admin"))
          } else {
            res.send(createToken(user.username))
          }
        });
      } else {
        //if the username is already in the database
        res.status(400).json({
          message: 'Invalid username or password'
        });
      }
    });
  } else {
    res.status(400).json({
      message: 'Invalid username or password!'
    });
  }
};


//Exports
module.exports = {
  validUser,
  signUp,
  logIn,
  createToken,
  verifyToken,
  getManga,
  getMangaById,
  getMangaByName,
  getMangaByGenre,
  getFavoriteManga,
  deleteManga,
  updateManga,
  addManga,
  addChapter,
  getChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  addRating,
  addFavorite,
  getComment,
  addComment,
  getGenre,
};
