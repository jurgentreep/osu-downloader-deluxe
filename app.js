// Bind environtmet variables from .env to process.env
require('dotenv').config();

const Auth = require('./Auth');
const Downloader = require('./Downloader');
const Api = require('./Api');

const auth = new Auth();

auth.login()
    .then(authCookie => {
        const downloader = new Downloader(authCookie);

        const api = new Api();

        api.getBeatmapSetIds('RLC')
            .then(beatmapSetIds => downloader.get(beatmapSetIds))
            .then(result => {
                console.log(result);
                console.log('yay');
            })
            .catch(e => {
                console.error(e);
            });
    });
