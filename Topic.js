const express = require("express");
const { pool } = require("./database");

const TopicRouter = express.Router();


TopicRouter.get("/getTopic/:c_id", (req, res) => {  
  const c_id = req.params.c_id; // Extract c_id from request parameters
  const getQuery = "SELECT * FROM Topic WHERE c_id = ?";
  pool.query(getQuery,[c_id] ,(err, result) => {
    if (err) {
      console.error("Error retrieving topics", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

TopicRouter.post("/addTopic", async (req, res) => {
    const { t_name,c_id } = req.body;
    console.log("Data received:", { t_name, c_id });
    const insertTopicQuery = "INSERT INTO Topic (t_name, c_id) VALUES (?, ?)";
    const inserts = [t_name, c_id];
    pool.query(insertTopicQuery, inserts, (error,result) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      // Return the ID of the newly inserted topic
      const topicId = result.insertId; // This contains the ID
      res.status(200).json({ message: "Topic inserted successfully" ,topicId});
    });
  });

  TopicRouter.put("/editTopic/:t_id", (req, res) => {    
    const tId = req.params.t_id;
    const { t_name,c_id } = req.body;
    // SQL query to update a course
    const updateQuery = "UPDATE Topic SET t_name = ?, c_id = ? where t_id = ?";
    const updates = [t_name, c_id, tId]; 
    pool.query(updateQuery, updates, (err, result) => { 
        if (err) {
            console.error("Error updating topic:", err); 
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "topic updated successfully" });
    });
});


  TopicRouter.delete("/deleteTopic/:t_id", (req, res) => {  //required only when inserting both the topic and CLO mappings together
    const topicId = req.params.t_id; 
    if (!/^\d+$/.test(topicId)) {
      return res.status(400).json({ error: "Invalid topicid ID" });
    }
    const deleteTopicQuery = "DELETE FROM Topic WHERE t_id = ?";
    pool.query(deleteTopicQuery, [topicId], (error, result) => {
      if (error) {
        console.error("Error deleting topic:", error);
        return res.status(500).json({ error: "Delete Request Error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "topic not found" });
      }
      res.status(200).json({ message: "Topic deleted successfully" });
    });
  });


module.exports = TopicRouter;