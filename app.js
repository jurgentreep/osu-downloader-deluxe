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
            .then(results => filterIds(results))
            .then(beatmapSetIds => downloader.get(beatmapSetIds))
            .then(console.log)
            .catch(console.error);
    });

function filterIds([newBeatmapIds, installedBeatmapIds]) {
    return new Promise((resolve, reject) => {
        const filteredIds = newBeatmapIds.filter(beatmapId => {
            return installedBeatmapIds.indexOf(beatmapId) < 0;
        });

        resolve(filteredIds);
    });
}
