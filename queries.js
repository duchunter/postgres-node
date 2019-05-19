//jshint esversion:6
const {
  Pool,
  Client
} = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'WebTruyen',
  password: 'postgres',
  port: '5432'
});
//GET admins
const getAdmins = (request, response) => {
  pool.query({
    text: `SELECT * FROM "Admin" `
  },(error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
//GET single user by id
const getAdminById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text: 'SELECT * FROM "Admin" WHERE admin_id = $1',
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
//DELETE fire admin
const deleteAdmin = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text:'DELETE FROM "Admin" WHERE admin_id = $1',
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Admin deleted with ID: ${id}`);
  });
};
//GET all users
const getUsers = (request, response) => {
  pool.query({
    text: `SELECT * FROM "User" `
  },(error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//GET single user by id
const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text: 'SELECT * FROM "User" WHERE user_id = $1',
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//POST new user
const createUser = (request, response) => {
  const { userId, username, password } = request.body;

  pool.query({
    text: `INSERT INTO "User"(user_id,user_name,pass) VALUES($1,$2,$3)`,
    values: [userId, username, password]
  }, (error, result) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`User added with ID: ${userId}`);
  });
};

//PUT promote user
const promoteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text: `INSERT INTO "Admin"(admin_id) VALUES($1)`,
    values: [id]
  },(error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Promoted user with ID: ${id}`);
    }
  );
};
//DELETE user
const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text:'DELETE FROM "User" WHERE user_id = $1',
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

//GET all Mangas
const getManga = (request, response) => {
  pool.query({
    text: `SELECT * FROM "Manga" `
  },(error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
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
    response.status(200).json(results.rows);
  });
};
//POST new manga
const addManga = (request, response) => {
  const { mangaID, mangaName, description, numOfChap, author } = request.body;

  pool.query({
    text: `INSERT INTO "Manga"(manga_id,manga_name,description,num_of_chap, author) VALUES($1,$2,$3,$4,$5)`,
    values: [mangaID, mangaName, description, numOfChap, author]
  }, (error, result) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Added manga with ID: ${mangaID}`);
  });
};

//POST add new Chapter
const addChapter = (request, response) => {
  const { mangaId, chapId, chap_name, chap_content, time } = request.body;

  pool.query({
    text: `INSERT INTO "Chapter"(manga_id,chap_id,chap_name,chap_content,time_up) VALUES($1,$2,$3,$4,$5)`,
    values: [mangaId, chapId, chap_name, chap_content, time]
  }, (error, result) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Added chapter with id ${chapId} to manga with id: ${mangaId}`);
  });
};
//GET chapter by id
const getChapterById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query({
    text: `SELECT chap_name,chap_content,time_up FROM "Chapter" WHERE chap_id = $1`,
    values: [id]
  }, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//Exports
module.exports = {
  getUsers,
  getUserById,
  createUser,
  promoteUser,
  deleteUser,
  getManga,
  getMangaById,
  addManga,
  addChapter,
  getChapterById,
  getAdmins,
  getAdminById,
  deleteAdmin,
};
