const https = require('https');
const Config = require('./Config');

/**
 * Don't go over 1200 requests per second you'll get an captcha.
 * Luckily this is removed after a while but just keep it in mind.
 */
module.exports = class Api {
    constructor() {
        this.apiKey = process.env.API_KEY;
    }

    getBeatmapIds() {
        return new Promise((resolve, reject) => {
            const config = new Config();

            config.getMappers()
                .then(mappers => {
                    /**
                     * I copied the following piece of code and still don't fully understand
                     * what's going on.
                     *
                     * It creates functions which return promises. Then it reduces the array
                     * of functions and executes each promise. The result of each promise
                     * get's concatonated onto the array.
                     */
                    const promiseSerial = funcs =>
                        funcs.reduce((promise, func) =>
                            promise.then(result => func().then(Array.prototype.concat.bind(result))),
                            Promise.resolve([]))

                    // convert each url to a function that returns a promise
                    const funcs = mappers.map(mapper => () => this.getBeatmapIdsFromMapper(mapper))

                    console.time('Time to collect all beatmap ids')

                    // execute Promises in serial
                    promiseSerial(funcs)
                        .then(results => {
                            console.info(`Retrieved a total of ${results.length} beatmap ids`)
                            console.timeEnd('Time to collect all beatmap ids')

                            resolve(results)
                        })
                        .catch(reject)
                });
        });
    }

    getBeatmapIdsFromMapper(mapper) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'osu.ppy.sh',
                port: 443,
                path: `/api/get_beatmaps?k=${this.apiKey}&u=${encodeURI(mapper)}`,
                method: 'GET',
            };

            let rawData = '';

            https.request(options, res => {
                res.setEncoding('utf8');

                res.on('data', chunk => rawData += chunk);

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(
                            Array.from(new Set(
                                JSON.parse(rawData)
                                    .map(metadata => metadata.beatmapset_id)))
                        )
                    } else {
                        reject(`error while trying to get beatmap ids for ${options.path}`);
                    }
                });
            })
                .on('error', reject)
                .end();
        });
    }
};
