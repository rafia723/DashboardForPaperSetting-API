const express = require("express");
const { sql, pool } = require("./database");
const paperRouter = express.Router();

paperRouter.get('/getPrintedPapers', async (req, res) => {
    const query = "SELECT DISTINCT c.c_title, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
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
    const query = "SELECT DISTINCT c.c_title, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
    
    if (courseTitle) {
      pool.query(query + " AND c.c_title LIKE ?", [`%${courseTitle}%`], (error, results) => {
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

paperRouter.get('/getUploadedPapers', async (req, res) => {
 
  const query = "SELECT DISTINCT c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Uploaded'";
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

  paperRouter.get('/getPaperStatus/:c_id', async (req, res) => {   //It provides array of result thats how we can access 1 value
    const cid = req.params.c_id;
    const query = "SELECT STATUS FROM paper WHERE c_id=?";
      
    pool.query(query , [cid], (err, result) => {
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

  

module.exports = paperRouter;