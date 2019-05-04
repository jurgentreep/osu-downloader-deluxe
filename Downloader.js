const https = require('https');
const fs = require('fs');
const sanitizeFilename = require('sanitize-filename');
const path = require('path');
const Config = require('./Config');
const { URL } = require('url');

module.exports = class Downloader {
    constructor(cookieHeader) {
        this.cookieHeader = cookieHeader;
        this.config = new Config();
    }

    get(beatmapSetIds) {
        console.info('Starting downloads');

        return beatmapSetIds.reduce((promise, beatmapSetId) => {
            return promise.then(() => this.getBeatmapSet(beatmapSetId));
        }, Promise.resolve());
    }

    getBeatmapSet(beatmapSetId) {
        return this.getDownloadUrl(beatmapSetId)
            .then(downloadUrl => this.download(downloadUrl))
            .catch(error => this.addIgnoreList(beatmapSetId, error));
    }

    getDownloadUrl(beatmapSetId) {
        return new Promise((resolve, reject) => {
            const request = https.request({
                hostname: 'osu.ppy.sh',
                port: 443,
                path: `/beatmapsets/${beatmapSetId}/download`,
                method: 'GET',
                headers: {
                    cookie: this.cookieHeader
                }
            }, res => {
                // We only need the headers so there's not need to wait for the response data
                if (res.headers.location) {
                    const downloadUrl = new URL(res.headers.location);
                    resolve(downloadUrl);
                } else {
                    reject({
                        message: 'No download url in location header',
                        headers: res.headers,
                        requestHeaders: request.getHeaders()
                    });
                }
            });

            request
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
                    cookie: this.cookieHeader
                }
            }, res => {
                if (res.statusCode === 200) {
                    const filename = this.getFilename(res.headers);
                    const downloadPath = path.join(process.env.OSU_DIRECTORY, `/Downloads/${filename}`);
                    const writeStream = fs.createWriteStream(downloadPath);

                    writeStream.on('error', reject);

                    res.pipe(writeStream);

                    res.on('end', () => {
                        console.info(`Succesfully downloaded ${filename}`);
                        resolve(filename);
                    });
                } else {
                    reject(`The status code is ${res.statusCode} instead of 200`);
                }
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

    addIgnoreList(beatmapSetId, error) {
        console.error(`Failed downloading beatmap with id ${beatmapSetId}`);
        console.error(error);
        this.config.storeFailedBeatmapId(beatmapSetId);
    }
};
