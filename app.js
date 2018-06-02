// Bind environtmet variables from .env to process.env
require('dotenv').config();

const Auth = require('./Auth');
const Downloader = require('./Downloader');
const Api = require('./Api');
const Osu = require('./Osu');
const Config = require('./Config');

function init() {
    Promise.all([
        initDownloader(),
        getBeatmapIds(),
    ])
        .then(([downloader, beatmapIds]) => {
            if (beatmapIds.length > 0) {
                return downloader.get(beatmapIds);
            } else {
                return Promise.resolve('No beatmaps to download');
            }
        })
        .then(console.info)
        .catch(console.error);
}

init();

function getBeatmapIds() {
    const api = new Api();
    const osu = new Osu();
    const config = new Config();

    return Promise.all([
        api.getNewBeatmapIds(),
        osu.getInstalledBeatmapIds(),
        config.getFailedBeatmapIds()
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

function filterIds([newBeatmapIds, installedBeatmapIds, failedBeatmapIds]) {
    return Promise.resolve(
        newBeatmapIds.filter(beatmapId =>
            installedBeatmapIds.indexOf(beatmapId) < 0
            && failedBeatmapIds.indexOf(beatmapId) < 0));
}
