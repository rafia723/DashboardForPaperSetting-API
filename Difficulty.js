const express = require("express");
const { sql, pool } = require("./database");

const difficultyRouter = express.Router();

difficultyRouter.post("/postDifficulty", (req, res) => {
    const { easy, medium, hard } = req.body;
  
    if (easy == null || medium == null || hard == null) {
      return res.status(400).json({
        error: "Please provide values for easy, medium, and hard difficulties"
      });
    }
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting a connection from the pool:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      connection.beginTransaction((err) => {
        if (err) {
          console.error("Error starting the transaction:", err);
          connection.release();
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const queries = [
          {
            query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'easy'",
            value: easy
          },
          {
            query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'medium'",
            value: medium
          },
          {
            query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'hard'",
            value: hard
          }
        ];
  
        let queryIndex = 0;
  
        const executeQuery = () => {
          if (queryIndex < queries.length) {
            const currentQuery = queries[queryIndex];
            connection.query(currentQuery.query, [currentQuery.value], (err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error(`Error executing the query for ${currentQuery.query}:`, err);
                  connection.release();
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }
              queryIndex++;
              executeQuery();
            });
          } else {
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Error committing the transaction:", err);
                  connection.release();
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }
              connection.release();
              res.status(200).json({ message: "Difficulty levels updated successfully" });
            });
          }
        };
  
        executeQuery();
      });
    });
  });

  difficultyRouter.get("/getDifficulty", (req, res) => {  
    const getQuery = "SELECT * FROM difficulty";
    pool.query(getQuery, (err, result) => {
      if (err) {
        console.error("Error retrieving courses:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });

module.exports = difficultyRouter;