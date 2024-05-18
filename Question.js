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
        fs.unlinkSync(imagePath);
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


module.exports = questionRouter;