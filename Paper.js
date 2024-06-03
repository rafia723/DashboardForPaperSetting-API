const express = require("express");
const { sql, pool } = require("./database");
const paperRouter = express.Router();

paperRouter.get('/getPrintedPapers', async (req, res) => {
    const query = "SELECT DISTINCT c.c_title, p.status,c.c_code FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching printed papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
});

paperRouter.get('/SearchPrintedPapers', async (req, res) => {
    const { courseTitle } = req.query;
    const query = "SELECT DISTINCT c.c_title, p.status,c.c_code FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
    
    if (courseTitle) {
      pool.query(query + " AND (c.c_title LIKE ? OR c.c_code LIKE ?)", [`%${courseTitle}%`, `%${courseTitle}%`], (error, results) => {
        if (error) {
          console.error('Error fetching printed papers:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
      });
    } else {
      return res.status(400).json({ error: 'Missing courseTitle parameter' });
    }
});

paperRouter.get('/getApprovedPapers', async (req, res) => {
 
    const query = "SELECT DISTINCT c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Approved'";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching approved papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
});

paperRouter.get('/SearchApprovedPapers', async (req, res) => {
  
    const { courseTitle } = req.query;
    const query = "SELECT DISTINCT c.c_title, c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Approved'";
    
    if (courseTitle) {
      pool.query(query + " AND (c.c_title LIKE ? OR c.c_code LIKE ?)", [`%${courseTitle}%`, `%${courseTitle}%`], (error, results) => {
        if (error) {
          console.error('Error fetching approved papers:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
      });
    } else {
      return res.status(400).json({ error: 'Missing courseTitle parameter' });
    }
});

// paperRouter.get('/getApprovedAndPrintedPapers', async (req, res) => {
 
//   const query = "SELECT DISTINCT c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Approved' OR p.status='Printed'";
//   pool.query(query, (error, results) => {
//     if (error) {
//       console.error('Error fetching approved or printed papers:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//     res.status(200).json(results);
//   });
// });

// paperRouter.get('/SearchApprovedAndPrintedPapers', async (req, res) => {
//   const { courseTitle } = req.query;

//   // Construct the base SQL query
//   let query = `
//     SELECT DISTINCT c.c_title, c.c_code, p.status 
//     FROM Course c 
//     JOIN Paper p ON c.c_id = p.c_id 
//     WHERE p.status IN ('Approved', 'Printed')
//   `;
  
//   // If courseTitle is provided, add search conditions
//   if (courseTitle) {
//     query += ` AND (c.c_title LIKE '%${courseTitle}%' OR c.c_code LIKE '%${courseTitle}%')`;
//   }
  
//   // Execute the query
//   pool.query(query, (error, results) => {
//     if (error) {
//       console.error('Error fetching approved and printed papers:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//     res.status(200).json(results);
//   });
// });

paperRouter.get('/getUploadedPapers', async (req, res) => {
 
  const query = "SELECT DISTINCT c.c_id,c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Uploaded'";
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching uploaded papers:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
});

paperRouter.get('/SearchUploadedPapers', async (req, res) => {

  const { courseTitle } = req.query;
  const query = "SELECT DISTINCT c.c_title, c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Uploaded'";
  
  if (courseTitle) {
    pool.query(query + " AND (c.c_title LIKE ? OR c.c_code LIKE ?)", [`%${courseTitle}%`, `%${courseTitle}%`], (error, results) => {
      if (error) {
        console.error('Error fetching uploaded papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  } else {
    return res.status(400).json({ error: 'Missing courseTitle parameter' });
  }
});

paperRouter.get('/getUnUploadedPapers', async (req, res) => {
 
  const query = "SELECT DISTINCT c.c_id,c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'pending'";
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching unuploaded papers:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
});

paperRouter.get('/SearchUnUploadedPapers', async (req, res) => {

  const { courseTitle } = req.query;
  const query = "SELECT DISTINCT c.c_title, c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'pending'";
  
  if (courseTitle) {
    pool.query(query + " AND (c.c_title LIKE ? OR c.c_code LIKE ?)", [`%${courseTitle}%`, `%${courseTitle}%`], (error, results) => {
      if (error) {
        console.error('Error fetching unuploaded papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  } else {
    return res.status(400).json({ error: 'Missing courseTitle parameter' });
  }
});



paperRouter.get('/getTeachersNamebyCourseId/:c_id', async (req, res) => {
  
  const  cid  = req.params.c_id;
  const query = "SELECT distinct f_name FROM faculty f JOIN assigned_course ac ON f.f_id=ac.f_id WHERE c_id=?";
  
    pool.query(query , [cid],(err, result) => {
      if (err) {
        console.error("Error retrieving Teachers by course", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });


  paperRouter.get('/getPaperStatusOfCoursesAssignedToFaculty/:f_id', async (req, res) => {
  
    const  fid  = req.params.f_id;
    const query = " SELECT c.c_title,p.`status` FROM course c JOIN  assigned_course ac ON c.c_id=ac.c_id JOIN paper p ON p.c_id=c.c_id WHERE ac.f_id=?";
    
      pool.query(query , [fid],(err, result) => {
        if (err) {
          console.error("Error retrieving", err);
          res.status(500).send("Get Request Error");
          return;
        }
        res.json(result);
      });
    });

  paperRouter.get('/getPaperStatus/:c_id/:s_id', async (req, res) => {   //It provides array of result thats how we can access 1 value
    const cid = req.params.c_id;
    const sid = req.params.s_id;
    const query = "SELECT STATUS FROM paper WHERE c_id=? and s_id=?";
    const values = [cid, sid];
    pool.query(query , values, (err, result) => {
      if (err) {
        console.error("Error retrieving Status", err);
        res.status(500).send("Get Request Error");
        return;
      }
      // Check if there is a result
      if (result.length > 0) {
        // Extract the status value from the first (and only) result
        const status = result[0].STATUS;
        res.json(status);
      } else {
        res.status(404).send("No paper status found for the provided c_id.");
      }
    });
  });

  paperRouter.post("/addPaper", (req, res) => {
    const { degree, exam_date, duration, term,NoOfQuestions, c_id } = req.body;
    const status = "pending";
    const sessionQuery =
      "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
    pool.query(sessionQuery, (err, sessionResult) => {
      if (err) {
        console.error("Error executing the session query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (sessionResult.length === 0) {
        res.status(404).json({ error: "No active session found" });
        return;
      }
      const { s_id, s_name, year } = sessionResult[0];
      const checkTermQuery = "SELECT * FROM Paper WHERE term = ? AND c_id = ? AND s_id = ?";
      pool.query(
        checkTermQuery,
        [term.toLowerCase(), c_id, s_id],
        (err, existingPapers) => {
          if (err) {
            console.error("Error executing the check query:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }
          if (existingPapers.length > 0) {
            res.status(400).json({
              error: `${term} term paper for this course already exists`
            });
            return;
          }
          
          const insertQuery = `
            INSERT INTO Paper (degree, exam_date, duration, term,NoOfQuestions, status, session, year, c_id, s_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
          `;
  
          const values = [
            degree,
            exam_date,
            duration,
            term,
            NoOfQuestions,
            status,
            s_name,
            year,
            c_id,
            s_id
          ];
  
          pool.query(insertQuery, values, (err) => {
            if (err) {
              console.error("Error executing the insert query:", err);
              res.status(500).json({ error: "Internal Server Error" });
              return;
            }
  
            res.status(200).json({ message: "Paper added successfully" });
          });
        }
      );
    });
  });
  

  

  // paperRouter.post("/addPaperHeaderMids", async (req, res) => {   //Commented  ***Running
  //   const { duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id } = req.body;
  //   const status = "uploaded";
  
  //   // Check if the term is 'Mid'
  //   if (term.toLowerCase()!=='mid'|| session.toLowerCase()!=='spring') {
  //     return res.status(400).json({ error: "You can only create spring Mid term exams right now" });
  //   }
  //   // Check if the term Mid and no other mid term is added for the same subject and same session
  //   const checkTermAndSessionQuery = "SELECT * FROM paper WHERE c_id = ? AND s_id = ? AND term = 'Mid' and session='Spring'";
  //   pool.query(checkTermAndSessionQuery, [c_id, s_id], (err, result) => {
  //     if (err) {
  //       console.error("Error checking term and session:", err);
  //       return res.status(500).json({ error: "Internal Server Error" });
  //     }
  //     if (result.length > 0) {
  //       // Term already exists for the same cid and sid
  //       return res.status(409).json({ error: `Term '${term}' and Session '${session}' already exists for this course and session` });
  //     } else {
  //       // No record found for the term, proceed with insertion
  //       insertPaperHeader();
  //     }
  //   });
 
  
  //   // Function to insert paper header
  //   function insertPaperHeader() {
  //     const insertPaperHeaderQuery = "INSERT INTO paper (duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  //     const inserts = [duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id, status];
  //     pool.query(insertPaperHeaderQuery, inserts, (error) => {
  //       if (error) {
  //         console.error("Error inserting data:", error);
  //         return res.status(500).json({ error: "Internal Server Error" });
  //       }
  //       res.status(200).json({ message: "Paper Header inserted successfully" });
  //     });
  //   }
  // });


  // paperRouter.post("/addPaperHeaderMids", async (req, res) => {
  //   const { duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id } = req.body;
  //   const status = "pending";
  
  //   // Check if the term is 'Mid' and session is 'Spring'
  //   if (term.toLowerCase() !== 'mid' || session.toLowerCase() !== 'spring') {
  //     return res.status(400).json({ error: "You can only create spring Mid term exams right now" });
  //   }
  
  //   try {
  //     // Check if the term Mid and no other mid term is added for the same subject and same session
  //     const checkTermAndSessionQuery = "SELECT * FROM paper WHERE c_id = ? AND s_id = ? AND term = 'Mid' and session='Spring'";
  //     const [result] = await pool.promise().query(checkTermAndSessionQuery, [c_id, s_id]);
  
  //     if (result.length > 0) {
  //       // Term already exists for the same cid and sid
  //       return res.status(409).json({ error: `Term '${term}' and Session '${session}' already exists for this course and session` });
  //     }
  
  //     // No record found for the term, proceed with insertion
  //     const insertPaperHeaderQuery = "INSERT INTO paper (duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  //     const inserts = [duration, degree, t_marks, term, year, exam_date, session, NoOfQuestions, c_id, s_id, status];
  //     await pool.promise().query(insertPaperHeaderQuery, inserts);
  
  //     res.status(200).json({ message: "Paper Header inserted successfully" });
  
  //   } catch (error) {
  //     console.error("Error processing request:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // });



  paperRouter.get('/getPaperHeader/:c_id/:s_id', async (req, res) => {
    const cid = req.params.c_id;
    const sid = req.params.s_id;
    const query = "SELECT * FROM paper WHERE c_id=? AND s_id=?;";
    const values = [cid, sid];
    
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error("Error retrieving status:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.status(200).json(result); // Send the result as a JSON response
    });
  });

  

  paperRouter.get('/getPaperHeaderIfTermisMidAndApproved/:c_id/:s_id', async (req, res) => {
    const cid = req.params.c_id;
    const sid = req.params.s_id;
    const query = "SELECT * FROM paper WHERE c_id=? AND s_id=? AND NOT (term='mid' AND status='approved'OR Status='printed');";
    const values = [cid, sid];
    
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error("Error retrieving status:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.status(200).json(result); // Send the result as a JSON response
    });
  });


  paperRouter.put("/editPaperStatusToApproved/:p_id", (req, res) => {    
    const pId = req.params.p_id;

    const updateQuery = ` UPDATE paper p
    SET p.status = 'approved'
    WHERE p.p_id = ?
      AND p.NoOfQuestions = (
          SELECT COUNT(*)
          FROM question q
          WHERE q.p_id = p.p_id
            AND q.q_status = 'approved'
      );`;

    pool.query(updateQuery, [pId], (err) => { 
        if (err) {
            console.error("Error updating paper status:", err); 
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "Paper status updated successfully" });
    });
});


paperRouter.put("/editPaperStatusToUploaded/:p_id", (req, res) => {    
  const pId = req.params.p_id;

  const updateQuery = ` UPDATE paper p
  SET p.status = 'uploaded'
  WHERE p.p_id = ?
    AND p.NoOfQuestions = (
        SELECT COUNT(*)
        FROM question q
        WHERE q.p_id = p.p_id
          AND q.q_status = 'uploaded'
    );`;

  pool.query(updateQuery, [pId], (err) => { 
      if (err) {
          console.error("Error updating paper status:", err); 
          return res.status(500).json({ error: "update Request Error" });
      }
      res.status(200).json({ message: "Paper status updated successfully" });
  });
});








  

module.exports = paperRouter;