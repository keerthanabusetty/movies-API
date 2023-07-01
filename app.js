const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let dbObject = null;

const initializeDbAndServer = async () => {
  try {
    dbObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movieId,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDetailsToPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//GET all movies
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
        SELECT
        movie_name
        FROM
        movie;`;
  const moviesArray = await dbObject.all(getMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//API-2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}');`;
  await dbObject.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API-3
//Get Book API
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getOneMovieQuery = `
        SELECT 
        * 
        FROM 
        movie
        WHERE
        movie_id = ${movieId};
    `;
  const movie = await dbObject.get(getOneMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API-4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;
  await dbObject.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//Delete Book API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE 
    FROM 
    movie
    WHERE
    movie_id = ${movieId};`;
  await dbObject.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6 GET ALL DIRECTORS
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT
        *
        FROM
        director;`;
  const directorsArray = await dbObject.all(getDirectorQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDetailsToPascalCase(eachDirector)
    )
  );
});
//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllDirectorsQuery = `
        SELECT
        movie_name
        FROM
        movie
        WHERE
        director_id = ${directorId}
        ;`;
  const directorsArray = await dbObject.all(getAllDirectorsQuery);

  response.send(
    directorsArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
