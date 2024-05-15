const express = require("express");
const { sql, pool } = require("./database");
const multer = require('multer');
const questionRouter = express.Router();

// questionRouter.post("/addQuestion", (req, res) => {   
//     const { q_text, q_image, q_marks,q_difficulty,q_status,t_id,p_id,f_id } = req.body;
//     // SQL query to insert a new course
//     const insertQuery = "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty,q_status,t_id,p_id,f_id) VALUES (?, ?, ?, ?,?,?,?,?)";
//     pool.query(insertQuery, [q_text, q_image, q_marks,q_difficulty,q_status,t_id,p_id,f_id], (err) => {
//       if (err) {
//         console.error("Error inserting data:", err);
//         return res.status(500).json({ error: "Post Request Error" });
//       }
//       console.log("Question inserted successfully");
//       res.status(200).json({ message: "Question inserted successfully" });
//     });
//   });


const upload = multer().single('q_image'); // 'q_image' is the name of the file field in the form

questionRouter.post("/addQuestion", upload, (req, res) => {   
    const { q_text, q_marks, q_difficulty, q_status, t_id, p_id, f_id } = req.body;
    const q_image = req.file.buffer; // Access the image buffer

    // SQL query to insert a new question
    const insertQuery = "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty, q_status, t_id, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    pool.query(insertQuery, [q_text, q_image, q_marks, q_difficulty, q_status, t_id, p_id, f_id], (err) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Post Request Error" });
        }
        console.log("Question inserted successfully");
        res.status(200).json({ message: "Question inserted successfully" });
    });
});


  questionRouter.get("/getQuestion/:p_id", (req, res) => { 
    const paperId = req.params.p_id; 
    const getQuery = "SELECT * FROM Question WHERE p_id=?";
    
    pool.query(getQuery, [paperId], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        // Process results to convert BLOB data to Base64
        const processedResults = results.map(question => {
            if (question.q_image) {
                question.q_image = question.q_image.toString('base64');
            }
            return question;
        });

        res.json(processedResults);
    });
});
  

module.exports = questionRouter;