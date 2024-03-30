const express = require("express");
const { sql, pool } = require("./database");
const paperRouter = express.Router();

paperRouter.get('/getPrintedPapers', async (req, res) => {
  try {
    const query = "SELECT DISTINCT c.c_title, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching printed papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

paperRouter.get('/SearchPrintedPapers', async (req, res) => {
  try {
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
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

paperRouter.get('/getApprovedPapers', async (req, res) => {
  try {
    const query = "SELECT DISTINCT c.c_title,c.c_code, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Approved'";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching approved papers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

paperRouter.get('/SearchApprovedPapers', async (req, res) => {
  try {
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
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = paperRouter;