require('dotenv').config();
const Auth = require('./Auth');
const Downloader = require('./Downloader');

const auth = new Auth();

auth.login(authCookie => {
    const downloader = new Downloader(authCookie);

    downloader.get();
});