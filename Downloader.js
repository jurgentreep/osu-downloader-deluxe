const https = require('https');
const fs = require('fs');
const sanitizeFilename = require('sanitize-filename');

module.exports = class Downloader {
    constructor(authCookie) {
        this.authCookie = authCookie;
    }

    get(beatmapSetIds) {
        return beatmapSetIds.reduce((promise, beatmapSetId) => {
            return promise.then(() => this.getBeatmapSet(beatmapSetId));
        }, Promise.resolve());
    }

    getBeatmapSet(beatmapSetId) {
        return this.getDownloadUrl(beatmapSetId)
            .then(downloadUrl => this.download(downloadUrl));
    }

    getDownloadUrl(beatmapSetId) {
        return new Promise((resolve, reject) => {
            https.request({
                hostname: 'osu.ppy.sh',
                port: 443,
                path: `/beatmapsets/${beatmapSetId}/download`,
                method: 'GET',
                headers: {
                    cookie: this.authCookie
                }
            }, res => {
                if (res.headers.location) {
                    // We only need the headers so there's not need to wait for the response data
                    resolve(new URL(res.headers.location));
                } else {
                    // TODO: handle the reject that's started here because we should be able to
                    // continue to the next one
                    // Maybe catch() higher up the chain?
                    reject(beatmapSetId);
                }
            })
                .on('error', reject)
                .end();
        });
    }

    download(downloadUrl) {
        return new Promise((resolve, reject) => {
            https.request({
                hostname: downloadUrl.host,
                port: 443,
                path: downloadUrl.pathname + downloadUrl.search,
                method: 'GET',
                headers: {
                    cookie: this.authCookie
                }
            }, res => {
                const filename = this.getFilename(res.headers);
                const path = `./downloads/${filename}`;
                const writeStream = fs.createWriteStream(path);

                writeStream.on('error', error => reject(error));

                res.pipe(writeStream);

                res.on('end', () => resolve(filename));
            })
                .on('error', error => reject(error))
                .end();
        });
    }

    getFilename(headers) {
        let filename = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i
            .exec(headers['content-disposition'])[2];

        /**
         * The header doesn't always return a valid filename
         * Example: 114137 P*Light - TRIGGER*HAPPY (Extend Ver.).osz
         * which contains the * character
         */
        return sanitizeFilename(filename);
    }
};
