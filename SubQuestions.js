const express = require("express");
const { pool } = require("./database");
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const SubQuestionRouter = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('sq_image');

SubQuestionRouter.post("/addSubQuestion", upload, (req, res) => {
    const { sq_text, q_id, c_id, s_id } = req.body;
    let sq_imageUrl = null;
    let insertedsQId = null;

    if (req.file) {
        const imagePath = 'Images/' + req.file.filename;
        sq_imageUrl = imagePath;
    }

    const similarityCheckQuery = `
         SELECT q.q_id, q.q_text, sq.sq_id, sq.sq_text
        FROM question q 
        JOIN paper p ON q.p_id = p.p_id 
        LEFT JOIN subquestion sq ON sq.q_id = q.q_id 
        WHERE (q.q_text LIKE ? OR sq.sq_text LIKE ?)
        AND p.c_id = ?
        AND p.s_id = ?
        LIMIT 1
    `;

    pool.query(similarityCheckQuery, [`%${sq_text}%`, `%${sq_text}%`, c_id, s_id], (similarityErr, similarityResult) => {
        if (similarityErr) {
            console.error("Error checking for similar questions:", similarityErr);
            return res.status(500).json({ error: "Error checking for similar questions" });
        }
        if (similarityResult.length > 0) {
            if (sq_imageUrl) {
                fs.unlinkSync(sq_imageUrl);
            }
            // Similar question found
            return res.status(409).json({ message: "Similar question already exists", similarQuestion: similarityResult[0] });
        }

        const insertQuery = "INSERT INTO SubQuestion (sq_text, sq_image, q_id) VALUES (?, ?, ?)";
        pool.query(insertQuery, [sq_text, sq_imageUrl, q_id], (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                // If there's an error, delete the uploaded file
                if (sq_imageUrl) {
                    fs.unlinkSync(sq_imageUrl);
                }
                return res.status(500).json({ error: "Error inserting subquestion" });
            }

            insertedsQId = result.insertId;
            res.status(200).json({ message: "Subquestion inserted successfully", sq_id: insertedsQId });
        });

    });
});

const getBaseUrl = (req) => {
    return req.protocol + '://' + req.get('host') + '/';
};

SubQuestionRouter.get("/getSubQuestionbyQID/:q_id", (req, res) => {
    const q_id = req.params.q_id;
    const getQuery = "SELECT * FROM SubQuestion WHERE q_id=?";

    pool.query(getQuery, [q_id], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        const baseUrl = getBaseUrl(req);
        const subquestionsWithFullImageUrl = results.map(subquestion => {
            if (subquestion.sq_image) {
                subquestion.sq_image = baseUrl + subquestion.sq_image;
            }
            return subquestion;
        });

        res.json(subquestionsWithFullImageUrl);
    });
});


  
  SubQuestionRouter.put("/updateSubQuestionOfSpecificQid/:sq_id", upload, (req, res) => {
    const sq_id = req.params.sq_id; // Extract the q_id from the request params
    let sq_imageUrl = null;

    if (req.file) {
        const imagePath = 'Images/' + req.file.filename;
        sq_imageUrl = imagePath;
    }

    const { sq_text,c_id,s_id} = req.body;

    const similarityCheckQuery = `
    SELECT q.q_id ,q.q_text,sq.sq_id,sq.sq_text
FROM question q 
 JOIN paper p ON q.p_id = p.p_id 
        LEFT JOIN subquestion sq ON sq.q_id = q.q_id 
        WHERE (q.q_text LIKE ? OR sq.sq_text LIKE ?)
        AND p.c_id = ?
        AND p.s_id = ?
   AND sq.sq_id != ?
	LIMIT 1;
    `;


    pool.query(similarityCheckQuery, [`%${sq_text}%`,`%${sq_text}%`, c_id, s_id,sq_id], (similarityErr, similarityResult) => {
        if (similarityErr) {
            console.error("Error during similarity check:", similarityErr);
            return res.status(500).json({ error: "Similarity Check Error" });
        }


        if (similarityResult.length > 0) {
            if (sq_imageUrl) {
                fs.unlinkSync(q_imageUrl);
            }
            // Similar question found
            return res.status(409).json({ message: "Similar question already exists", similarQuestion: similarityResult[0] });
        }


    // Create the base query
    let updateQuery = "UPDATE subQuestion SET";
    let updateValues = [];

    // Dynamically build the query based on provided values
    if (sq_text !== undefined) {
        updateQuery += " sq_text = ?,";
        updateValues.push(sq_text);
    }
    // Check if q_image is provided or not
    if (sq_imageUrl !== null || req.file === undefined) {
        updateQuery += " sq_image = ?,";
        updateValues.push(sq_imageUrl);
    }

    // Remove the last comma from the query and add the WHERE clause
    updateQuery = updateQuery.slice(0, -1);
    updateQuery += " WHERE q_id = ?";
    updateValues.push(q_id);

    // Execute the update query
    pool.query(updateQuery, updateValues, (err, result) => {
        if (err) {
            console.error("Error updating data:", err);
            // If there's an error, delete the uploaded file
            if (sq_imageUrl !== null && req.file) {
                fs.unlinkSync(sq_imageUrl);
            }
            return res.status(500).json({ error: "Update Request Error" });
        }
        res.status(200).json({ message: "subQuestion updated successfully", q_id: q_id });
    });
});
});

module.exports = SubQuestionRouter;