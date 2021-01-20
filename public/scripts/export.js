function getPlaylistData(e) {
    axios.get('/api/export')
        .then(res => res.data)
        .then(data => {
            console.log(data);
            const url = window.URL.createObjectURL(new Blob([JSON.stringify(data)]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'export_object.json');
            document.body.appendChild(link);
            link.click();
        }).catch(err => console.log(err))
}

const exportButton = document.querySelector('button.button-export');
exportButton.addEventListener('click', getPlaylistData, false);