const axios = require('axios');
const fs = require('fs');

async function downloadFile(url, destination) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream', // Bu, yanıtın bir akış olduğunu belirtir
    });

    // Dosyayı oluştur ve akışı dosyaya yaz
    response.data.pipe(fs.createWriteStream(destination));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

// Kullanım örneği
/*
const fileUrl = 'https://example.com/path/to/file.txt';
const destinationPath = 'path/to/save/file.txt';

downloadFile(fileUrl, destinationPath)
    .then(() => {
        console.log('Dosya başarıyla indirildi.');
    })
    .catch((error) => {
        console.error('Dosya indirilirken hata oluştu:', error.message);
    });
*/


module.exports = {
    downloadFile
};