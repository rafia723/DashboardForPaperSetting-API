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


  CloRouter.get("/getFeedbackOfPaperHeaderOnlySenior/:f_id", (req, res) => {  
    const f_id = req.params.f_id; // Extract c_id from request parameters
    const getQuery = `SELECT f.*  
    FROM feedback f 
    JOIN paper p ON f.p_id = p.p_id 
    JOIN assigned_course ac ON p.c_id = ac.c_id 
    WHERE ac.f_id = ? AND ac.role = 'senior';`;
    pool.query(getQuery,[f_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving :", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });


feedbackRouter.post("/addFeedback", (req, res) => {   
    const { feedback_details, p_id, q_id ,f_id} = req.body;
    console.log("Data received:", { feedback_details, p_id, q_id ,f_id});
    
    const insertQuery = "INSERT INTO feedback (feedback_details, p_id, q_id,f_id) VALUES (?, ?, ?,?)";
    pool.query(insertQuery, [feedback_details, p_id, q_id,f_id], (err) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Feedback inserted successfully" });
    });
  });



module.exports = feedbackRouter;