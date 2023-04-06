const fs = require('fs');

function readFile(path, callback) {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, data);
        }
    });
}

function writeVideoFile(path, videoData, callback) {
    fs.writeFile(path, videoData, 'binary', callback);
}

module.exports = { readFile, writeVideoFile };