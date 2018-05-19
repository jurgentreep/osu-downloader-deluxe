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
                    return this.getBeatmapIdsFromMapper(mapper);
                });

                Promise.all(promises).then(results => {
                    console.info('Succesfully retrieved beatmap id\'s for the list of mappers');
                    resolve([].concat(...results));
                })
                    .catch(console.error);
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
                if (res.statusCode === 200) {
                    res.setEncoding('utf8');

                    res.on('data', chunk => rawData += chunk);

                    res.on('end', () => {
                        console.log(rawData);
                        resolve(
                            Array.from(new Set(
                                JSON.parse(rawData)
                                    .map(metadata => metadata.beatmapset_id)
                            ))
                        )
                    });
                } else {
                    reject(options.path);
                }
            })
                .on('error', reject)
                .end();
        });
    }
};
