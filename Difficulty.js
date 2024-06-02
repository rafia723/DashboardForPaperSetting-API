const express = require("express");
const { sql, pool } = require("./database");

const difficultyRouter = express.Router();

difficultyRouter.post("/postDifficulty", (req, res) => {
  const { easy, medium, hard, numberOfQuestions } = req.body;

  if (numberOfQuestions == null) {
      return res.status(400).json({
          error: "Please provide a value for numberOfQuestions"
      });
  }

  const easyValue = easy || 0;
  const mediumValue = medium || 0;
  const hardValue = hard || 0;

  if (easyValue + mediumValue + hardValue !== numberOfQuestions) {
      return res.status(400).json({
          error: "The sum of easy, medium, and hard should be equal to numberOfQuestions"
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

          const checkExistenceQuery = "SELECT d_id FROM DifficultyOfQuestions WHERE number_of_questions = ?";
          connection.query(checkExistenceQuery, [numberOfQuestions], (err, results) => {
              if (err) {
                  return connection.rollback(() => {
                      console.error("Error checking for existing record:", err);
                      connection.release();
                      res.status(500).json({ error: "Internal Server Error" });
                  });
              }

              if (results.length > 0) {
                  // Record exists, update it
                  const updateQuery = `
                      UPDATE DifficultyOfQuestions
                      SET easy = ?, medium = ?, hard = ?
                      WHERE number_of_questions = ?
                  `;
                  connection.query(updateQuery, [easyValue, mediumValue, hardValue, numberOfQuestions], (err) => {
                      if (err) {
                          return connection.rollback(() => {
                              console.error("Error updating the record:", err);
                              connection.release();
                              res.status(500).json({ error: "Internal Server Error" });
                          });
                      }

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
                  });
              } else {
                  // Record does not exist, insert it
                  const insertQuery = `
                      INSERT INTO DifficultyOfQuestions (easy, medium, hard, number_of_questions)
                      VALUES (?, ?, ?, ?)
                  `;
                  connection.query(insertQuery, [easyValue, mediumValue, hardValue, numberOfQuestions], (err) => {
                      if (err) {
                          return connection.rollback(() => {
                              console.error("Error inserting the record:", err);
                              connection.release();
                              res.status(500).json({ error: "Internal Server Error" });
                          });
                      }

                      connection.commit((err) => {
                          if (err) {
                              return connection.rollback(() => {
                                  console.error("Error committing the transaction:", err);
                                  connection.release();
                                  res.status(500).json({ error: "Internal Server Error" });
                              });
                          }
                          connection.release();
                          res.status(200).json({ message: "Difficulty levels added successfully" });
                      });
                  });
              }
          });
      });
  });
});

difficultyRouter.get("/getDifficulty/:noOfQuestions", (req, res) => {  
  const noOfQuestions = req.params.noOfQuestions; // Corrected the parameter name
  const getQuery = "SELECT * FROM DifficultyOfQuestions WHERE number_of_questions = ?"; // Corrected the column name

  pool.query(getQuery, [noOfQuestions], (err, result) => {
    if (err) {
      console.error("Error retrieving difficulties:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

module.exports = difficultyRouter;