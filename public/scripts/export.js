function getPlaylistData(e) {
    axios.get('/api/export')
        .then(res => res.data)
        .then(data => {
            console.log(data);
            console.log(data.length);
        }).catch(err => console.log(err))
}

const exportButton = document.querySelector('button.button-export');
exportButton.addEventListener('click', getPlaylistData, false);