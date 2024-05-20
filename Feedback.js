const express = require("express");
const { pool } = require("./database");

const feedbackRouter = express.Router();

feedbackRouter.get("/getFeedback", (req, res) => {  
    const getQuery = "SELECT * FROM feedback";
    pool.query(getQuery, (err, result) => {
      if (err) {
        console.error("Error retrieving feedback:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });


feedbackRouter.post("/addFeedback", (req, res) => {   
    const { feedback_details, p_id, q_id } = req.body;
    console.log("Data received:", { feedback_details, p_id, q_id });
    
    const insertQuery = "INSERT INTO feedback (feedback_details, p_id, q_id) VALUES (?, ?, ?)";
    pool.query(insertQuery, [feedback_details, p_id, q_id], (err) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Feedback inserted successfully" });
    });
  });



module.exports = feedbackRouter;