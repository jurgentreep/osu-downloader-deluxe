// Bind environment variables from .env to process.env
require('dotenv').config();

import Auth from './classes/Auth';
import Downloader from './classes/Downloader';
import Api from './classes/Api';
import Osu from './classes/Osu';
import Config from './classes/Config';
import Setup from './classes/Setup';

function init() {
    const setup = new Setup();

    setup.checkRequiredFiles()
        .then(() => Promise.all([
            initDownloader(),
            getBeatmapIds(),
        ]))
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

function initDownloader(): Promise<Downloader> {
    const auth = new Auth();

    return new Promise((resolve, reject) => {
        auth.login()
            .then(cookieHeader =>
                resolve(new Downloader(cookieHeader)))
            .catch(reject);
    });
}

function filterIds([newBeatmapIds, installedBeatmapIds, failedBeatmapIds]: [string[], string[], string[]]) {
    return Promise.resolve(
        newBeatmapIds.filter(beatmapId =>
            installedBeatmapIds.indexOf(beatmapId) < 0
            && failedBeatmapIds.indexOf(beatmapId) < 0));
}
