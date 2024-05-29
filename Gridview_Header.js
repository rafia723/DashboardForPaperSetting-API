const express = require("express");
const { pool } = require("./database");

const gridviewHeaderRouter = express.Router();

gridviewHeaderRouter.get('/getGridViewHeader', async (req, res) => {
 
    const query = "SELECT * from grid_view_headers";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching header :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });



module.exports = gridviewHeaderRouter;