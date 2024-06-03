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
  

  QuestionTopicRouter.put("/updateTopicQuestionMapping", (req, res) => {
    const { q_id, topicIds } = req.body;
  
    const deleteQuery = "DELETE FROM QuestionTopic WHERE q_id = ?";
    const insertQuery = "INSERT INTO QuestionTopic (t_id, q_id) VALUES (?, ?)";
  
    // Delete existing entries for the given q_id
    executeQuery(deleteQuery, [q_id], (deleteError, deleteResults) => {
        if (deleteError) {
            console.error("Error:", deleteError);
            return res.status(500).json({ error: "Delete Request Error" });
        }
        
        // Execute insert queries for each topic
        let insertionErrors = [];
        topicIds.forEach(topic => {
            executeQuery(insertQuery, [topic, q_id], (insertError, insertResults) => {
                if (insertError) {
                    console.error("Error:", insertError);
                    insertionErrors.push(insertError);
                }
            });
        });

        if (insertionErrors.length > 0) {
            return res.status(500).json({ error: "Insertion Errors", details: insertionErrors });
        }

        res.status(200).json({ message: "Topics updated for question successfully" });
    });
});

// Function to execute a SQL query
function executeQuery(query, values, callback) {
    pool.query(query, values, callback);
}

module.exports = QuestionTopicRouter;