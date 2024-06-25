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


//   SELECT f.*, c.*
// FROM feedback f 
// JOIN paper p ON f.p_id = p.p_id 
// JOIN assigned_course ac ON p.c_id = ac.c_id 
// JOIN course c ON c.c_id = p.c_id
// JOIN session s ON s.s_id = p.s_id
// WHERE ac.f_id = ?
//   AND ac.role = 'senior' 
//   AND f.q_id IS NULL
//   AND p.status = 'commented'
//   AND s.flag = 'active';

  feedbackRouter.get("/getFeedbackOfPaperHeaderOnlySenior/:f_id", (req, res) => {  
    const f_id = req.params.f_id; // Extract c_id from request parameters
    const getQuery = `        SELECT f.*, c.*
FROM feedback f
JOIN paper p ON f.p_id = p.p_id 
JOIN assigned_course ac ON p.c_id = ac.c_id 
JOIN course c ON c.c_id = p.c_id
JOIN session s ON s.s_id = p.s_id
WHERE ac.f_id = ?
  AND ac.role = 'senior' 
  AND f.q_id IS NULL
  AND p.status = 'commented'
  AND s.flag = 'active'
  AND f.f_submitted = (
    SELECT MAX(f_submitted)
    FROM feedback fb
    WHERE fb.p_id = f.p_id
  );
  `
  ;
    pool.query(getQuery,[f_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving :", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });

  feedbackRouter.get("/getFeedbackofQuestionSpecificTeacher/:f_id", (req, res) => {  
    const f_id = req.params.f_id; // Extract c_id from request parameters //query is fetching the latest feedback of same qid and pid
    const getQuery = `SELECT f.*, c.*    
FROM feedback f
JOIN (
    SELECT fb.q_id, fb.p_id, MAX(f_submitted) AS max_f_submitted
    FROM feedback fb
    JOIN paper pp ON fb.p_id = pp.p_id
    JOIN session ss ON pp.s_id = ss.s_id
    WHERE ss.flag = 'active'
    GROUP BY fb.q_id, fb.p_id
) AS latest_feedback ON f.q_id = latest_feedback.q_id 
                      AND f.p_id = latest_feedback.p_id 
                      AND f.f_submitted = latest_feedback.max_f_submitted
JOIN question q ON f.q_id = q.q_id
JOIN paper p ON q.p_id = p.p_id
JOIN course c ON p.c_id = c.c_id
WHERE f.f_id = ?
  AND q.q_status = 'commented';
    `;
    pool.query(getQuery,[f_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving :", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });


// feedbackRouter.post("/addFeedback", (req, res) => {   
//     const { feedback_details, p_id, q_id ,f_id} = req.body;
//     console.log("Data received:", { feedback_details, p_id, q_id ,f_id});
    
//     const insertQuery = "INSERT INTO feedback (feedback_details, p_id, q_id,f_id) VALUES (?, ?, ?,?)";
//     pool.query(insertQuery, [feedback_details, p_id, q_id,f_id], (err) => {
//       if (err) {
//         console.error("Error inserting data:", err);
//         return res.status(500).json({ error: "Post Request Error" });
//       }
//       res.status(200).json({ message: "Feedback inserted successfully" });
//     });
//   });


  feedbackRouter.post("/addFeedback", (req, res) => {
    const { p_id, q_id, feedback_details, f_id } = req.body; // Extract necessary fields from the request body
  
    const insertFeedbackQuery = `
      INSERT INTO feedback (p_id, q_id, feedback_details, f_id) 
      VALUES (?, ?, ?, ?)
    `;
  
    pool.query(insertFeedbackQuery, [p_id, q_id, feedback_details, f_id], (err, result) => {
      if (err) {
        console.error("Error inserting feedback:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

  
      let updateQuery;
      let updateValues;
  
      if (q_id) {
        // If q_id is provided, update the status of the specific question
        updateQuery = `
          UPDATE question 
          SET q_status = 'commented' 
          WHERE q_id = ?
        `;
        updateValues = [q_id];
      } else {
        // If q_id is not provided, update the status of the paper
        updateQuery = `
          UPDATE paper 
          SET status = 'commented' 
          WHERE p_id = ?
        `;
        updateValues = [p_id];
      }
  
      pool.query(updateQuery, updateValues, (err) => {
        if (err) {
          console.error("Error updating status:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
  
        res.status(200).json({ message: "Feedback added and status updated successfully" });
      });
    });
  });


module.exports = feedbackRouter;