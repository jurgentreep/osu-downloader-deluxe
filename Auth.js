const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
    'username': process.env.OSU_USERNAME,
    'password': process.env.OSU_PASSWORD
});

const options = {
    hostname: 'osu.ppy.sh',
    port: 443,
    path: '/session',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

module.exports = class Auth {
    login(next) {
        const req = https.request(options, (res) => {
            // We only need the headers so there's not need to wait for the response data
            if (next) {
                next(res.headers['set-cookie'].join('; '));
            }
        });

        req.on('error', (e) => {
            console.error(e);
        });

        req.write(postData);

        req.end();
    }
};