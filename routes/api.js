const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const axios = require('axios');
const spotifyApiWrapper = require('../modules/spotifyApiWrapper.js');

const scopes = 'playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative ugc-image-upload user-read-email user-read-private';
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
                            `state=${state}&`+
                            `show_dialog=true`;
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
        
        const authString = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
       
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
        res.cookie('accessToken', tokenData.access_token, {maxAge: 900000, httpOnly: true});
        res.redirect('/home');
    }
}))

router.get('/export', asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const spotifyAPI = new spotifyApiWrapper(accessToken);
    let exportObj = {
        user_id: '',
        playlists: [],
    }
    const user = await spotifyAPI.getUser();
    exportObj.user_id = user.id;
    console.log(user);
    const playlists = await spotifyAPI.getPlaylists(user.id).catch(err => console.log(err));

    // let playlist = playlists[0];
    // console.log(playlist);
    // let tracks = await spotifyAPI.getPlaylistItems(playlist.id, user.country);
    // res.send(JSON.stringify(tracks));
    // let img = await spotifyAPI.getPlaylistImage(playlist.images[0].url);
    // res.send(img);
    
    for (let i=0; i<playlists.length; i++) {
        exportObj.playlists.push({
            collaborative: playlists[i].collaborative,
            description: playlists[i].description,
            id: playlists[i].id,
            name: playlists[i].name,
            public: playlists[i].public,
            tracks: await spotifyAPI.getPlaylistItems(playlists[i].id, user.country)
        })
    }

    res.send(JSON.stringify(exportObj));
}))

router.post('/import', asyncHandler(async (req, res, next) => {
    console.log('File uploaded');
    console.log(Object.keys(req));
    console.log(req.body);

}))

module.exports = router;