const express = require("express");
const { pool } = require("./database");

const sessionRouter = express.Router();

sessionRouter.get('/getSession', async (req, res) => {
 
    const query = "SELECT * from Session";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching session :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });



module.exports = sessionRouter;