var router   = require('express').Router();
var fetch    = require('./fetch.js');
var request  = require('request');
var cheerio = require('cheerio');

router.use('/fetch',fetch);

module.exports = router;