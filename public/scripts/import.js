function validatePlaylistData(files) {
  console.log(files);
  axios.post('/api/import', files[0])
    .then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
}

const importButton = document.querySelector('input.file-import');
importButton.addEventListener('change', validatePlaylistData, false);

function disable(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  console.log('dropped!');
  const files = e.dataTransfer.files;
  validatePlaylistData(files);
}

const dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", disable, false);
dropbox.addEventListener("dragover", disable, false);
dropbox.addEventListener("drop", drop, false);