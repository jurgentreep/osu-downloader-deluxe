const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'osu.ppy.sh',
    port: 443,
    path: '/beatmapsets/764602/download',
    method: 'GET',
    headers: {}
};

module.exports = class Downloader {
    constructor(authCookie) {
        this.options = options;
        this.options.headers.cookie = authCookie;
    }

    get() {
        https.request(this.options, res => {
            const downloadUrl = new URL(res.headers.location);
            // this actually makes a reference to the object not a good idea =.="
            const options = this.options;
            options.hostname = downloadUrl.host;
            options.path = downloadUrl.pathname + downloadUrl.search;

            https.request(options, res => {
                const regex = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i
                const filename = regex.exec(res.headers['content-disposition'])[2];
                const path = `./downloads/${filename}`;
                const writeStream = fs.createWriteStream(path);

                res.pipe(writeStream);
            })
                .on('error', (e) => {
                    console.error(e);
                })
                .end();
        })
            .on('error', (e) => {
                console.error(e);
            })
            .end();
    }
};