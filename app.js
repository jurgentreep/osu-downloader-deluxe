// Bind environtmet variables from .env to process.env
require('dotenv').config();

const Auth = require('./Auth');
const Downloader = require('./Downloader');
const Api = require('./Api');
const Osu = require('./Osu');

const auth = new Auth();

auth.login()
    .then(authCookie => {
        const downloader = new Downloader(authCookie);
        const api = new Api();
        const osu = new Osu();

        Promise.all([
            api.getBeatmapSetIds('RLC'),
            osu.getInstalledBeatmapIds(),
        ])
            .then(results => {
                return new Promise((resolve, reject) => {
                    const filteredIds = results[0].filter(beatmapId => {
                        return results[1].indexOf(beatmapId) < 0;
                    });

                    resolve(filteredIds);
                });
            })
            .then(beatmapSetIds => downloader.get(beatmapSetIds))
            .then(result => {
                console.log(result);
                console.log('yay');
            })
            .catch(e => {
                console.error(e);
            });
    });
