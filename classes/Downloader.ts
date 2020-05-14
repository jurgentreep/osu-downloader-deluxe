import https from 'https';
import fs from 'fs';
import sanitizeFilename from 'sanitize-filename';
import path from 'path';
import Config from './Config';
import { URL } from 'url';
import { IncomingHttpHeaders } from 'http';
import Auth from './Auth';

export default class Downloader {
    auth: Auth;
    config: Config;
    osuDirectory: string;
    startTime: number;

    constructor(auth: Auth) {
        this.auth = auth;
        this.config = new Config();
        this.startTime = new Date().valueOf();

        if (process.env.OSU_DIRECTORY) {
            this.osuDirectory = process.env.OSU_DIRECTORY;
        } else {
            throw new Error('OSU_DIRECTORY env variable not set');
        }
    }

    get(beatmapSetIds: string[]): Promise<string | void> {
        console.info('Starting downloads');

        return beatmapSetIds.reduce<Promise<string | void>>((promise, beatmapSetId) => {
            return promise.then(() => this.getBeatmapSet(beatmapSetId));
        }, Promise.resolve());
    }

    getBeatmapSet(beatmapSetId: string) {
        return this.getDownloadUrl(beatmapSetId)
            .then(downloadUrl => this.download(downloadUrl))
            .catch(error => {
                if (error === 'We reached the download limit :(') {
                    const currentTime = new Date().valueOf();
                    const difference = currentTime - this.startTime;
                    const remainder = (60 * 60 * 1000) - difference;

                    console.log('We reached the download limit :(');
                    console.log(`Waiting for ${remainder} milliseconds (${Math.round(remainder / (60 * 1000))} minutes)`);
                    console.log(`Quit the program at any time using Ctrl + C`);

                    return new Promise<string | void>((resolve) => {
                        setTimeout(() => {
                            this.startTime = new Date().valueOf();
                            resolve(this.getBeatmapSet(beatmapSetId));
                        }, remainder);
                    });
                } else {
                    this.addIgnoreList(beatmapSetId, error);
                }
            });
    }

    getDownloadUrl(beatmapSetId: string): Promise<URL> {
        return new Promise((resolve, reject) => {
            const request = https.request({
                hostname: 'osu.ppy.sh',
                port: 443,
                path: `/beatmapsets/${beatmapSetId}/download`,
                method: 'GET',
                headers: {
                    cookie: this.auth.cookieJar.getCookieStringSync(`https://osu.ppy.sh/beatmapsets/${beatmapSetId}/download`),
                    // will redirect to beatmap detail page if referer header is missing
                    // it actually doesn't matter what the referer is as long as it's present
                    referer: `https://osu.ppy.sh/beatmapsets/${beatmapSetId}`
                }
            }, res => {
                // We only need the headers so there's not need to wait for the response data
                if (res.headers.location) {
                    const downloadUrl = new URL(res.headers.location);
                    resolve(downloadUrl);
                } else if (res.statusCode === 403) {
                    // Looks like the download limit is 200 per hour for non support users
                    reject('We reached the download limit :(');
                } else {
                    reject('No download url in location header');
                }
            });

            request
                .on('error', reject)
                .end();
        });
    }

    download(downloadUrl: URL): Promise<string> {
        return new Promise((resolve, reject) => {
            https.request({
                hostname: downloadUrl.host,
                port: 443,
                path: downloadUrl.pathname + downloadUrl.search,
                method: 'GET',
                headers: {
                    cookie: this.auth.cookieJar.getCookieStringSync(downloadUrl.pathname + downloadUrl.search)
                }
            }, res => {
                if (res.statusCode === 200) {
                    const filename = this.getFilename(res.headers);
                    const downloadPath = path.join(this.osuDirectory, `/Downloads/${filename}`);
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

    getFilename(headers: IncomingHttpHeaders) {
        if (!headers['content-disposition']) {
            throw new Error('Content disposition header not set');
        }

        const matches = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i
            .exec(headers['content-disposition']);

        if (!matches) {
            throw new Error('Could not extract filename from header');
        } else {
            const filename = matches[2];

            /**
             * The header doesn't always return a valid filename
             * Example: 114137 P*Light - TRIGGER*HAPPY (Extend Ver.).osz
             * which contains the * character
             */
            return sanitizeFilename(filename);
        }
    }

    // TODO: make sure we know what kind of error it is
    addIgnoreList(beatmapSetId: string, error: any) {
        console.error(`Failed downloading beatmap with id ${beatmapSetId}`);
        console.error(error);
        this.config.storeFailedBeatmapId(beatmapSetId);
    }
};
