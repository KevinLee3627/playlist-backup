const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const spotifyApiWrapper = require('../modules/spotifyApiWrapper.js')

router.get('/', asyncHandler(async (req, res, next) => {
    const renderOptions = {
        title: 'playlist backup'
    }
    res.render('home', renderOptions);
}))
module.exports = router;