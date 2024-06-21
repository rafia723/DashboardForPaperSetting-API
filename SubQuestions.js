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
    const { sq_text , q_id} = req.body;
    let sq_imageUrl = null;
    let insertedsQId = null; 
    if (req.file) {
        const imagePath = 'Images/' + req.file.filename;
        sq_imageUrl = imagePath;
    }
        
    const insertQuery = "INSERT INTO SubQuestion (sq_text,sq_image q_id) VALUES (?,?,?)";
    pool.query(insertQuery, [sq_text, sq_imageUrl, q_id], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            // If there's an error, delete the uploaded file
            if (sq_imageUrl) {
                fs.unlinkSync(sq_imageUrl);
            }
            return res.status(500).json({ error: "Post Request Error" });
        }
        
        insertedsQId = result.insertId;
        res.status(200).json({ message: "Sub Question inserted successfully", sq_id: insertedsQId });
    });

});


module.exports = SubQuestionRouter;