const express = require("express");
const { sql, pool } = require("./database");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const questionRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer upload middleware to handle multiple files
const uploads = multer({ storage: storage }).array('q_images', 10); // 'q_images' is the field name, 10 is the max number of files


// // Define storage for uploaded images
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'Images'); // Specify the destination folder
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// // Initialize multer upload middleware
 const upload = multer({ storage: storage }).single('q_image');

questionRouter.post("/addQuestion", upload, (req, res) => {
    let q_imageUrl = null;
    let insertedQId = null; // Variable to store the inserted q_id
    if (req.file) {
        const imagePath = 'Images/' + req.file.filename;
        q_imageUrl = imagePath;
    }
    const { q_text, q_marks, q_difficulty, q_status, p_id, f_id , c_id, s_id} = req.body;

    const similarityCheckQuery = `
        SELECT q.q_id, q.q_text, sq.sq_id, sq.sq_text
        FROM question q 
        JOIN paper p ON q.p_id = p.p_id 
        LEFT JOIN subquestion sq ON sq.q_id = q.q_id 
        WHERE (q.q_text LIKE ? OR sq.sq_text LIKE ?)
        AND p.c_id = ?
        LIMIT 1
    `;

    pool.query(similarityCheckQuery, [`%${q_text}%`,`%${q_text}%`, c_id], (similarityErr, similarityResult) => {
        if (similarityErr) {
            console.error("Error checking for similar questions:", similarityErr);
            return res.status(500).json({ error: "Error checking for similar questions" });
        }

        if (similarityResult.length > 0) {
            if (q_imageUrl) {
                fs.unlinkSync(q_imageUrl);
            }
            // Similar question found
            return res.status(409).json({ message: "Similar question already exist", similarQuestion: similarityResult[0] });
            
        }
        
    const insertQuery = "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty, q_status, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    pool.query(insertQuery, [q_text, q_imageUrl, q_marks, q_difficulty, q_status, p_id, f_id], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            // If there's an error, delete the uploaded file
            if (q_imageUrl) {
                fs.unlinkSync(q_imageUrl);
            }
            return res.status(500).json({ error: "Post Request Error" });
        }
        // Get the newly inserted q_id
        insertedQId = result.insertId;
        res.status(200).json({ message: "Question inserted successfully", q_id: insertedQId });
    });
});
});

questionRouter.post("/addQuestionWithMultipleImages", uploads, (req, res) => {
    let q_imageUrls = []; // Array to store the URLs of the uploaded images

    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const imagePath = 'Images/' + file.filename;
            q_imageUrls.push(imagePath);
        });
    }

    const { q_text, q_marks, q_difficulty, q_status, p_id, f_id, c_id, s_id } = req.body;

    const similarityCheckQuery = `
        SELECT q.q_id, q.q_text, sq.sq_id, sq.sq_text
        FROM question q 
        JOIN paper p ON q.p_id = p.p_id 
        LEFT JOIN subquestion sq ON sq.q_id = q.q_id 
        WHERE (q.q_text LIKE ? OR sq.sq_text LIKE ?)
        AND p.c_id = ?
        LIMIT 1
    `;

    pool.query(similarityCheckQuery, [`%${q_text}%`,`%${q_text}%`, c_id], (similarityErr, similarityResult) => {
        if (similarityErr) {
            console.error("Error checking for similar questions:", similarityErr);
            return res.status(500).json({ error: "Error checking for similar questions" });
        }

        if (similarityResult.length > 0) {
            if (q_imageUrls.length > 0) {
                q_imageUrls.forEach(url => {
                    fs.unlinkSync(url);
                });
            }
            // Similar question found
            return res.status(409).json({ message: "Similar question already exists", similarQuestion: similarityResult[0] });
        }

        const insertQuestionQuery = "INSERT INTO Question (q_text, q_marks, q_difficulty, q_status, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?)";
        
        pool.query(insertQuestionQuery, [q_text, q_marks, q_difficulty, q_status, p_id, f_id], (err, result) => {
            if (err) {
                console.error("Error inserting question data:", err);
                // If there's an error, delete the uploaded files
                if (q_imageUrls.length > 0) {
                    q_imageUrls.forEach(url => {
                        fs.unlinkSync(url);
                    });
                }
                return res.status(500).json({ error: "Post Request Error" });
            }

            // Get the newly inserted q_id
            const insertedQId = result.insertId;

            // Insert image URLs into the QuestionImage table
            if (q_imageUrls.length > 0) {
                const insertImageQuery = "INSERT INTO QuestionImage (q_id, image_url) VALUES ?";
                const imageValues = q_imageUrls.map(url => [insertedQId, url]);

                pool.query(insertImageQuery, [imageValues], (imageErr, imageResult) => {
                    if (imageErr) {
                        console.error("Error inserting image data:", imageErr);
                        // If there's an error, delete the uploaded files and the question
                        if (q_imageUrls.length > 0) {
                            q_imageUrls.forEach(url => {
                                fs.unlinkSync(url);
                            });
                        }
                        pool.query("DELETE FROM Question WHERE q_id = ?", [insertedQId], () => {
                            return res.status(500).json({ error: "Post Request Error" });
                        });
                    } else {
                        res.status(200).json({ message: "Question and images inserted successfully", q_id: insertedQId });
                    }
                });
            } else {
                res.status(200).json({ message: "Question inserted successfully", q_id: insertedQId });
            }
        });
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


questionRouter.get("/getQuestionWithMultipleImages/:p_id", (req, res) => {
    const paperId = req.params.p_id;
    const getQuery = `
        SELECT q.q_id, q.q_text, q.q_marks, q.q_difficulty, q.q_status, q.p_id, q.f_id,
               qi.image_url
        FROM Question q
        LEFT JOIN QuestionImage qi ON q.q_id = qi.q_id
        WHERE q.p_id = ?
    `;
    
    pool.query(getQuery, [paperId], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        const baseUrl = getBaseUrl(req);

        // Group images by question ID
        const questionsMap = {};
        results.forEach(row => {
            if (!questionsMap[row.q_id]) {
                questionsMap[row.q_id] = {
                    q_id: row.q_id,
                    q_text: row.q_text,
                    q_marks: row.q_marks,
                    q_difficulty: row.q_difficulty,
                    q_status: row.q_status,
                    p_id: row.p_id,
                    f_id: row.f_id,
                    q_images: []
                };
            }
            if (row.image_url) {
                questionsMap[row.q_id].q_images.push(baseUrl + row.image_url);
            }
        });

        // Convert the map back to an array
        const questionsWithImages = Object.values(questionsMap);

        res.json(questionsWithImages);
    });
});

questionRouter.get("/getQuestionbyQID/:q_id", (req, res) => {
    const q_id = req.params.q_id;
    const getQuery = `
        SELECT * FROM Question WHERE q_id=?
    `;
    
    pool.query(getQuery, [q_id], (err, results) => {
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

questionRouter.get("/getQuestionByQIDWithMultipleImages/:q_id", (req, res) => {
    const qId = req.params.q_id;
    const getQuery = `
        SELECT q.q_id, q.q_text, q.q_marks, q.q_difficulty, q.q_status, q.p_id, q.f_id,
               qi.image_url
        FROM Question q
        LEFT JOIN QuestionImage qi ON q.q_id = qi.q_id
        WHERE q.q_id = ?
    `;
    
    pool.query(getQuery, [qId], (err, results) => {
        if (err) {
            console.error("Error retrieving questions:", err);
            return res.status(500).send("Get Request Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Data not found for the given ID" });
        }

        const baseUrl = getBaseUrl(req);

        // Group images by question ID
        const questionsMap = {};
        results.forEach(row => {
            if (!questionsMap[row.q_id]) {
                questionsMap[row.q_id] = {
                    q_id: row.q_id,
                    q_text: row.q_text,
                    q_marks: row.q_marks,
                    q_difficulty: row.q_difficulty,
                    q_status: row.q_status,
                    p_id: row.p_id,
                    f_id: row.f_id,
                    q_images: []
                };
            }
            if (row.image_url) {
                questionsMap[row.q_id].q_images.push(baseUrl + row.image_url);
            }
        });

        // Convert the map back to an array
        const questionsWithImages = Object.values(questionsMap);

        res.json(questionsWithImages);
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


  
  questionRouter.put("/editQuestionText/:q_id", (req, res) => {    
    const qId = req.params.q_id;
    const { q_text} = req.body;
    

    const updateQuery = "UPDATE Question SET q_text = ? where q_id = ?";
    const updates = [q_text, qId]; 
    pool.query(updateQuery, updates, (err, result) => { 
        if (err) {
            console.error("Error updating question:", err); 
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "question updated successfully" });
    });
});
  
  questionRouter.put("/updateQuestionOfSpecificQid/:q_id", upload, (req, res) => {
    const q_id = req.params.q_id; // Extract the q_id from the request params
    let q_imageUrl = null;

    if (req.file) {
        const imagePath = 'Images/' + req.file.filename;
        q_imageUrl = imagePath;
    }

    const { q_text, q_marks, q_difficulty, q_status, p_id, f_id,c_id} = req.body;

    const similarityCheckQuery = `
   SELECT q.q_id ,q.q_text,sq.sq_id,sq.sq_text
FROM question q 
 JOIN paper p ON q.p_id = p.p_id 
        LEFT JOIN subquestion sq ON sq.q_id = q.q_id 
        WHERE (q.q_text LIKE ? OR sq.sq_text LIKE ?)
        AND p.c_id = ?
   AND q.q_id != ?
	LIMIT 1;
    `;


    pool.query(similarityCheckQuery, [`%${q_text}%`,`%${q_text}%`, c_id,q_id], (similarityErr, similarityResult) => {
        if (similarityErr) {
            console.error("Error during similarity check:", similarityErr);
            return res.status(500).json({ error: "Similarity Check Error" });
        }


        if (similarityResult.length > 0) {
            if (q_imageUrl) {
                fs.unlinkSync(q_imageUrl);
            }
            // Similar question found
            return res.status(409).json({ message: "Similar question already exists", similarQuestion: similarityResult[0] });
        }

    // Create the base query
    let updateQuery = "UPDATE Question SET";
    let updateValues = [];

    // Dynamically build the query based on provided values
    if (q_text !== undefined) {
        updateQuery += " q_text = ?,";
        updateValues.push(q_text);
    }
    if (q_marks !== undefined) {
        updateQuery += " q_marks = ?,";
        updateValues.push(q_marks);
    }
    if (q_difficulty !== undefined) {
        updateQuery += " q_difficulty = ?,";
        updateValues.push(q_difficulty);
    }
    if (q_status !== undefined) {
        updateQuery += " q_status = ?,";
        updateValues.push(q_status);
    }
    // if (t_id !== undefined) {
    //     updateQuery += " t_id = ?,";
    //     updateValues.push(t_id);
    // }
    if (p_id !== undefined) {
        updateQuery += " p_id = ?,";
        updateValues.push(p_id);
    }
    if (f_id !== undefined) {
        updateQuery += " f_id = ?,";
        updateValues.push(f_id);
    }

    // Check if q_image is provided or not
    if (q_imageUrl !== null || req.file === undefined) {
        updateQuery += " q_image = ?,";
        updateValues.push(q_imageUrl);
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
            if (q_imageUrl !== null && req.file) {
                fs.unlinkSync(q_imageUrl);
            }
            return res.status(500).json({ error: "Update Request Error" });
        }
        res.status(200).json({ message: "Question updated successfully", q_id: q_id });
    });
});
});



questionRouter.get("/getQuestionsWithUploadedOrApprovedStatus/:p_id", (req, res) => {
    const paperId = req.params.p_id;
    const getQuery = "SELECT * FROM Question WHERE p_id=? AND (q_status='uploaded' OR q_status='approved');";
    
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