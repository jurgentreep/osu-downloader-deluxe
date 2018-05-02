const https = require('https');

module.exports = class Api {
    constructor() {
        this.apiKey = process.env.API_KEY;
    }

    getBeatmapSetIds(username) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'osu.ppy.sh',
                port: 443,
                path: `/api/get_beatmaps?k=${this.apiKey}&u=${username}`,
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
                .on('error', (e) => {
                    reject(e);
                })
                .end();
        });
    }
};
