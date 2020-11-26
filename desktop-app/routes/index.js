const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("index route");
  res.render('index', { title: 'Express App' });
});

module.exports = router;
