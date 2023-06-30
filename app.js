const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initialiseDbAndServer();
//GET all movies
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
        SELECT
        *
        FROM
        movie
        ORDER BY
        movie_id;`;
  const moviesArray = await db.all(getMovieQuery);
  response.send(moviesArray);
});
//API-2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addBookQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Added Successfully");
});
//API-3
//Get Book API
app.get("/movies/:movieId", async (response, request) => {
  const { movieId } = request.params;
  const getOneMovieQuery = `
        SELECT 
        * 
        FROM 
        movie
        WHERE
        movie_id = ${movieId};
    `;
  const movie = await db.get(getOneMovieQuery);
  response.send(movie);
});
//API-4
app.put("/movies/:movieId", async (response, request) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateBookQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;
  await db.run(updateBookQuery);
  response.send("Movie Details Updated");
});
//Delete Book API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE 
    FROM 
    book
    WHERE
    book_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//API-6 GET ALL DIRECTORS
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT
        *
        FROM
        movie
        ORDER BY
        director_id;`;
  const directorsArray = await db.all(getDirectorQuery);
  response.send(directorsArray);
});
//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const getAllDirectorsQuery = `
        SELECT
        *
        FROM
        movie
        ORDER BY
        director_id;`;
  const directorsArray = await db.all(getAllDirectorsQuery);
  response.send(directorsArray);
});
module.exports = app.js;
