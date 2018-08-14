const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
    username: process.env.OSU_USERNAME,
    password: process.env.OSU_PASSWORD
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
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                console.info('Logged in succesfully');
                // We only need the headers so there's not need to wait for the response data
                resolve(res.headers['set-cookie'].join('; '))
            });

            req.on('error', reject);

            req.write(postData);

            req.end();
        });
    }
};
