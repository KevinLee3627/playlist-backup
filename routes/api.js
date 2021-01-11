const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const axios = require('axios');
const spotifyApiWrapper = require('../modules/spotifyApiWrapper.js')

const scopes = 'playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative user-read-email user-read-private';
const stateKey = 'spotify_auth_state';


router.get('/login', (req, res, next) => {
    //Generate a state and store it locally (in a cookie)
    const state = crypto.randomBytes(32).toString('base64');
    res.cookie(stateKey, state, {maxAge: 3600000});

    const authorization_url = "https://accounts.spotify.com/authorize?"+
                            `client_id=${process.env.CLIENT_ID}&`+
                            `response_type=code&`+
                            `redirect_uri=${process.env.REDIRECT_URI}&`+
                            `scope=${encodeURIComponent(scopes)}&`+
                            `state=${state}`;
    res.redirect(authorization_url)
})

router.get('/callback', asyncHandler(async (req, res, next) => {
    //The state generated previously is sent to the spotify auth server
    //When the server replies with the authorization code, it will also send the state back
    //If the locally stored state and the received state match, everything is kosher
    if(req.cookies[stateKey] !== req.query.state) {
        res.redirect('/');
    } else {
        res.clearCookie(stateKey);
        let authString = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
       
        const tokenPromise = axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {Authorization: `Basic ${authString}`},
            params: {
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: process.env.REDIRECT_URI
            }
        });

        const tokenData = await tokenPromise.then(res => res.data);
        const accessToken = tokenData.access_token;
        const spotifyAPI = new spotifyApiWrapper(accessToken);
        let user = await spotifyAPI.getUser();
        let playlists = await spotifyAPI.getPlaylists(user.id, []);
        console.log(playlists);


    }

    if (req.query.error) {res.send('you clicked cancel')}
    else if (req.query.code) {res.send('you clicked log in')}
    else res.send('If you see this, I messed up.')
}))

module.exports = router;