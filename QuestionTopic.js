const express = require("express");
const { pool } = require("./database");

const QuestionTopicRouter = express.Router();

QuestionTopicRouter.post("/addTopicQuestion", async (req, res) => {
    const { q_id, topicIds } = req.body;
  
    const insertQuery = "INSERT INTO QuestionTopic (t_id, q_id) VALUES (?, ?)";
  
    // Construct an array of arrays, each containing [topic id, q_id]
    const inserts = topicIds.map(topic => [topic, q_id]);
  
    try {
      // Execute all insert queries
      for (const values of inserts) {
        pool.query(insertQuery, values);
      }
      res.status(200).json({ message: "Topics added to question successfully" });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Post Request Error" });
    }
  });

  QuestionTopicRouter.get("/getTopicMappedWithQuestion/:q_id", (req, res) => {  
    const q_id = req.params.q_id; 
    const getQuery = "SELECT t_id FROM questiontopic WHERE q_id = ?";
    pool.query(getQuery,[q_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving topic mapped with question", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });
  

  QuestionTopicRouter.post("/updateTopicQuestionMapping", async (req, res) => {
    const { q_id, topicIds } = req.body;
  
    const deleteQuery = "DELETE FROM QuestionTopic WHERE q_id = ?";
    const insertQuery = "INSERT INTO QuestionTopic (t_id, q_id) VALUES (?, ?)";
  
    // Construct an array of arrays, each containing [topic id, q_id]
    const inserts = topicIds.map(topic => [topic, q_id]);
  
    let connection; // Declare connection variable
  
    try {
      connection =  pool.getConnection(); // Get a connection from the pool
       connection.beginTransaction(); // Begin transaction
  
      // Delete existing entries for the given q_id
       connection.query(deleteQuery, [q_id]);
  
      // Execute all insert queries
      for (const values of inserts) {
         connection.query(insertQuery, values);
      }
  
      await connection.commit(); // Commit the transaction
      res.status(200).json({ message: "Topics updated for question successfully" });
    } catch (error) {
      console.error("Error:", error);
      if (connection) {
        try {
           connection.rollback(); // Rollback the transaction in case of an error
        } catch (rollbackError) {
          console.error("Rollback Error:", rollbackError);
        }
      }
      res.status(500).json({ error: "Update Request Error" });
    } finally {
      if (connection) {
        connection.release(); // Release the connection back to the pool
      }
    }
});
module.exports = QuestionTopicRouter;