const https = require('https');
const fs = require('fs');
const sanitizeFilename = require('sanitize-filename');
const path = require('path');

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
            .then(downloadUrl => this.download(downloadUrl))
            .catch(errorId => this.addToIgnoreList(errorId));
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
                const downloadPath = path.join(process.env.OSU_DIRECTORY, `/Downloads/${filename}`);
                const writeStream = fs.createWriteStream(downloadPath);

                writeStream.on('error', reject);

                res.pipe(writeStream);

                res.on('end', () => {
                    console.log(`Succesfully downloaded ${filename}`);
                    resolve(filename)
                });
            })
                .on('error', reject)
                .end();
        });
    }

    getFilename(headers) {
        const filename = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i
            .exec(headers['content-disposition'])[2];

        /**
         * The header doesn't always return a valid filename
         * Example: 114137 P*Light - TRIGGER*HAPPY (Extend Ver.).osz
         * which contains the * character
         */
        return sanitizeFilename(filename);
    }

    addToIgnoreList(errorId) {
        return new Promise((resolve, reject) => {
            // TODO: Creat an ignore list and add the beatmap set id
            resolve(`Failed downloadin beatmap with id ${errorId}`);
        });
    }
};
