// Bind environtmet variables from .env to process.env
require('dotenv').config();

const Auth = require('./Auth');
const Downloader = require('./Downloader');
const Api = require('./Api');
const Osu = require('./Osu');

function init() {
    Promise.all([
        initDownloader(),
        getBeatmapIds(),
    ])
        .then(([downloader, beatmapIds]) => downloader.get(beatmapIds))
        .then(result => console.info('final then', result))
        .catch(error => console.error('final catch', error));
}

init();

function getBeatmapIds() {
    const api = new Api();
    const osu = new Osu();

    return Promise.all([
        api.getBeatmapIds(),
        osu.getBeatmapIds(),
    ])
        .then(results => filterIds(results));
}

function initDownloader() {
    const auth = new Auth();

    return new Promise((resolve, reject) => {
        auth.login()
            .then(authCookie =>
                resolve(new Downloader(authCookie)))
            .catch(reject);
    });
}

function filterIds([newBeatmapIds, installedBeatmapIds]) {
    return Promise.resolve(
        newBeatmapIds.filter(beatmapId =>
            installedBeatmapIds.indexOf(beatmapId) < 0));
}
