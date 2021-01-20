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

    async getPlaylists(user_id, totalPlaylists, url) {
        console.log(`Getting playlists for ${user_id}`);
        totalPlaylists = totalPlaylists ? totalPlaylists : [];
        url = url ? url : `${this.base}/users/${user_id}/playlists?limit=${50}`;
        try {
            let playlistData = await axios.get(url, {headers: this.authHeader}).then(res => res.data);
            totalPlaylists = [...totalPlaylists, ...playlistData.items];
            if (playlistData.next != null) {
                console.log('getting more');
                return this.getPlaylists(user_id, totalPlaylists, playlistData.next);
            } else {
                console.log('returning all playlists');
                return totalPlaylists;
            }
        } catch (err) {
            console.error(err);
        }
    }

    async getPlaylistItems(playlist_id, market, totalItems=[], offset=0) {
        console.log(`Getting playlist items for ${playlist_id} - offset: ${offset} - total: ${totalItems.length}`);
        const limit = 100;
        let url = `${this.base}/playlists/${playlist_id}/tracks?market=${market}&limit=${limit}&offset=${offset}&fields=items(added_at,track(uri))`;
        try {
            let playlistItems = await axios.get(url, {headers: this.authHeader}).then(res => res.data.items);
            playlistItems = playlistItems.map(({added_at, track: {uri}}) => ({added_at: added_at, track_uri: uri}))
            totalItems = [...totalItems, ...playlistItems];
            if (playlistItems.length !== 0) {
                return this.getPlaylistItems(playlist_id, market, totalItems, offset+limit);
            } else {
                return totalItems;
            }
        } catch (err) {
            console.error(err);
        }
    }

    // async getPlaylistImage(image_url) {
    //     try {
    //         let image = await axios.get(image_url, {responseType: 'arraybuffer'});
    //         console.log(image.data.length);
    //         let imgBase64String = Buffer.from(image.data).toString('base64');
    //         console.log(imgBase64String.length);
    //         let utf8String = Buffer.from(image.data).toString('utf8');
    //         console.log(utf8String.length);
    //         return imgBase64String;
    //     } catch(err) {
    //         console.error(err);
    //     }
    // }

    async createPlaylist(user_id, name, desc, isPublic, isCollaborative) {
        //check if user_id from generated file matches the current user
    }

    async uploadPlaylistImage(playlist_id, image) {
        //IMAGE IS Base64 ENCODED STRING!
    }

}

module.exports = SpotifyAPI;