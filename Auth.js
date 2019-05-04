const https = require('https');
const querystring = require('querystring');

module.exports = class Auth {
    getCookie(regex, cookieHeader) {
        for (const cookie of cookieHeader) {
            const result = regex.exec(cookie);

            if (result) {
                return result;
            }
        }
    }

    getCookieHeader(headers) {
        const cookieHeader = headers['set-cookie'];
        const cloudflareRegex = /__cfduid=[a-zA-Z0-9]*/;
        const osuRegex = /osu_session=(?!deleted)[a-zA-Z0-9%]*/;

        const cloudflareCookie = this.getCookie(cloudflareRegex, cookieHeader);
        const osuCookie = this.getCookie(osuRegex, cookieHeader);

        return [cloudflareCookie, osuCookie].join('; ');
    }

    login() {
        return new Promise((resolve, reject) => {
            const postData = querystring.stringify({
                username: process.env.OSU_USERNAME,
                password: process.env.OSU_PASSWORD
            });

            const req = https.request({
                hostname: 'osu.ppy.sh',
                port: 443,
                path: '/session',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                console.info('Logged in succesfully');

                const cookieHeader = this.getCookieHeader(res.headers);

                resolve(cookieHeader);
            });

            req.write(postData);
            req.on('error', reject);
            req.end();
        })
    }
};
