import https from 'https';
import querystring from 'querystring';
import { IncomingHttpHeaders } from 'http';
import { CookieJar, Cookie } from 'tough-cookie';

export default class Auth {
    getCookieHeader(headers: IncomingHttpHeaders) {
        if (!headers['set-cookie']) {
            throw new Error('No cookie header');
        }

        const cookieJar = new CookieJar();

        headers['set-cookie'].forEach(cookieHeader => {
            const cookie = Cookie.parse(cookieHeader);
            if (cookie) {
                try {
                    cookieJar.setCookieSync(cookie, 'https://osu.ppy.sh/session');
                } catch (e) {
                    console.log(cookie);
                    console.error(e);
                }
            }
        });

        const cookie = cookieJar.getCookieStringSync('https://osu.ppy.sh/session');

        return cookie;
    }

    login(): Promise<string> {
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
