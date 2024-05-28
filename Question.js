const express = require("express");
const { sql, pool } = require("./database");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const questionRouter = express.Router();



// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage }).single('q_image');

questionRouter.post("/addQuestion", upload, (req, res) => {
   let q_imageUrl=null;
    if (req.file) {
        const imagePath = 'Images/'+req.file.filename; // Assuming req.file.filename contains the filename
     q_imageUrl =imagePath;
    }
    const {q_text,q_marks, q_difficulty, q_status, t_id, p_id, f_id } = req.body;

const insertQuery = "INSERT INTO Question ( q_text,q_image, q_marks, q_difficulty, q_status, t_id, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
pool.query(insertQuery, [q_text,q_imageUrl, q_marks, q_difficulty, q_status, t_id, p_id, f_id], (err) => {
    if (err) {
        console.error("Error inserting data:", err);
        // If there's an error, delete the uploaded file
        if(imagePath){
            fs.unlinkSync(imagePath);
        }
        return res.status(500).json({ error: "Post Request Error" });
    }
    res.status(200).json({ message: "Question inserted successfully" });
});
});

const getBaseUrl = (req) => {
    return req.protocol + '://' + req.get('host') + '/';
};

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

        const baseUrl = getBaseUrl(req);
        const questionsWithFullImageUrl = results.map(question => {
            if (question.q_image) {
                question.q_image = baseUrl + question.q_image;
            }
            return question;
        });

        res.json(questionsWithFullImageUrl);
    });
});

// EDIT STATUS endpoint
questionRouter.put("/editQuestionStatusFromPendingToUploaded/:q_id", (req, res) => {       //For submission
    const qId = req.params.q_id;
    
    // SQL query to fetch the current status of the question
    const getSingleRecordQuery = "SELECT q_status FROM question WHERE q_id = ?";
    pool.query(getSingleRecordQuery, [qId], (fetchError, fetchResult) => {
      if (fetchError) {
        console.error("Error fetching question status:", fetchError);
        return res.status(500).json({ error: "Error fetching question status" });
      }
      if (fetchResult.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }
  
      const currentStatus = fetchResult[0].q_status;
      const newStatus = (currentStatus === "pending") ? "uploaded" : "pending";
      
      // SQL query to update the status of the question
      const updateStatusQuery = "UPDATE question SET q_status = ? WHERE q_id = ?";
      pool.query(updateStatusQuery, [newStatus, qId], (updateError) => {
        if (updateError) {
          console.error("Error updating question status:", updateError);
          return res.status(500).json({ error: "Error updating question status" });
        }
        res.status(200).json({ message: "Question status updated successfully", newStatus });
      });
    });
  });


  questionRouter.put("/editQuestionStatusToApprovedOrRejected/:q_id", (req, res) => {
    const qId = req.params.q_id;
    const newStatus = req.body.newStatus;
  
    if (!newStatus) {
      return res.status(400).json({ error: "New status not provided" });
    }
  
    const validStatuses = ['approved', 'rejected', 'uploaded'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }
  
    // SQL query to update the status of the question
    const updateStatusQuery = "UPDATE question SET q_status = ? WHERE q_id = ?";
    pool.query(updateStatusQuery, [newStatus, qId], (updateError) => {
      if (updateError) {
        console.error("Error updating question status:", updateError);
        return res.status(500).json({ error: "Error updating question status" });
      }
      res.status(200).json({ message: "Question status updated successfully", newStatus });
    });
  });
  

  



// questionRouter.get("/getQuestion/:p_id", (req, res) => {
//     const paperId = req.params.p_id;
//     const getQuery = "SELECT * FROM Question WHERE p_id=?";
    
//     pool.query(getQuery, [paperId], (err, results) => {
//         if (err) {
//             console.error("Error retrieving questions:", err);
//             return res.status(500).send("Get Request Error");
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: "Data not found for the given ID" });
//         }

//         // Create new objects with the desired properties
//         const processedResults = results.map(question => {
//             const processedQuestion = {
//                 q_id: question.q_id,
//                 q_text: question.q_text,
//                 q_image: question.q_image,
//                 q_marks: question.q_marks,
//                 q_difficulty: question.q_difficulty,
//                 q_status: question.q_status,
//                 t_id: question.t_id,
//                 p_id: question.p_id,
//                 f_id: question.f_id
//             };
//             return processedQuestion;
//         });

//         res.json(processedResults);
//     });
// });


questionRouter.get("/getQuestionsWithUploadedStatus/:p_id", (req, res) => {
    const paperId = req.params.p_id;
    const getQuery = "SELECT * FROM Question WHERE p_id=? and q_status='uploaded'";
    
    pool.query(getQuery, [paperId], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        const baseUrl = getBaseUrl(req);
        const questionsWithFullImageUrl = results.map(question => {
            if (question.q_image) {
                question.q_image = baseUrl + question.q_image;
            }
            return question;
        });

        res.json(questionsWithFullImageUrl);
    });
});



questionRouter.get("/getQuestionsWithPendingStatus/:p_id", (req, res) => {
    const paperId = req.params.p_id;
    const getQuery = "SELECT * FROM Question WHERE p_id=? and q_status='pending'";
    
    pool.query(getQuery, [paperId], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        const baseUrl = getBaseUrl(req);
        const questionsWithFullImageUrl = results.map(question => {
            if (question.q_image) {
                question.q_image = baseUrl + question.q_image;
            }
            return question;
        });

        res.json(questionsWithFullImageUrl);
    });
});

questionRouter.put("/editQuestionStatusToUploaded/:q_id", (req, res) => {     //Additional Questions screen
    const qId = req.params.q_id;

    const updateQuery = "UPDATE question SET q_status = 'uploaded' where q_id=?";

    pool.query(updateQuery, [qId], (err) => { 
        if (err) {
            console.error("Error updating question:", err); 
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "question status updated successfully" });
    });
});
module.exports = questionRouter;