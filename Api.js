const https = require('https');
const Config = require('./Config');

module.exports = class Api {
    constructor() {
        this.apiKey = process.env.API_KEY;
    }

    getBeatmapIds() {
        return new Promise((resolve, reject) => {
            const config = new Config();

            config.getMappers().then(mappers => {
                const promises = mappers.map(mapper => {
                    return this.getBeatmapIdsFromMapper(mapper)
                        .catch(error => {
                            console.error(error);
                            return new Promise((resolve, reject) => resolve([]));
                        });
                });

                Promise.all(promises).then(results => {
                    resolve([].concat(...results));
                });
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
                    resolve(
                        Array.from(new Set(
                            JSON.parse(rawData)
                                .map(metadata => metadata.beatmapset_id)
                        ))
                    )
                });
            })
                .on('error', reject)
                .end();
        });
    }
};
