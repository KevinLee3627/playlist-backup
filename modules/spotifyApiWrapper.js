const axios = require("axios");

class SpotifyAPI {
    constructor(accessToken) {
        this.base = 'https://api.spotify.com/v1';
        this.accessToken = accessToken;
        this.authHeader = {Authorization: `Bearer ${accessToken}`};
    }

    async getUser() {
        try {
            return await axios.get(`${this.base}/me`, {headers: this.authHeader}).then(res => res.data);
        } catch(err) {
            console.error(err);
        }
    }

    async getPlaylists(user_id, playlists) {
        const limit = 50;
        let url = `${this.base}/users/${user_id}/playlists?limit=${limit}`;

        try {
            return await axios.get(url, {headers: this.authHeader}).then(res => res.data);
        } catch (err) {
            console.error(err);
        }
    }

}

module.exports = SpotifyAPI;