import https from 'https';
import querystring from 'querystring';
import { IncomingHttpHeaders } from 'http';
import { CookieJar, Cookie } from 'tough-cookie';

export default class Auth {
    cookieJar: CookieJar;

    constructor() {
        this.cookieJar = new CookieJar();
    }

    // Only for debugging purposes
    // The chat page is one of the few pages that sends a 401 instead of redirecting you to another page
    // We can use this to determine if we succesfully logged in
    goToChat() {
        return new Promise((resolve, reject) => {
            https.request({
                hostname: 'osu.ppy.sh',
                port: 443,
                path: '/community/chat',
                method: 'GET',
                headers: {
                    cookie: this.cookieJar.getCookieStringSync('https://osu.ppy.sh/cummunity/chat'),
                }
            }, (res) => {
                if (res.statusCode === 200) {
                    this.setCookieHeader(res.headers, 'https://osu.ppy.sh/cummunity/chat');

                    resolve();
                } else {
                    reject('Going to chatpage failed');
                }
            })
                .on('error', reject)
                .end();
        });
    }

    setCookieHeader(headers: IncomingHttpHeaders, currentUrl: string) {
        if (!headers['set-cookie']) {
            throw new Error('No cookie header');
        }

        headers['set-cookie'].forEach(cookieHeader => {
            const cookie = Cookie.parse(cookieHeader);
            if (cookie) {
                try {
                    this.cookieJar.setCookieSync(cookie, currentUrl);
                } catch (e) {
                    // Not all cookies are valid
                    // Invalid cookies can safely be ingnored
                    // console.log(cookie);
                    // console.error(e);
                }
            }
        });
    }

    login(): Promise<void> {
        return new Promise((resolve, reject) => {
            const postData = querystring.stringify({
                username: process.env.OSU_USERNAME,
                password: process.env.OSU_PASSWORD
                // the real website also sends a _token but this isn't actually required to log in
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

                this.setCookieHeader(res.headers, 'https://osu.ppy.sh/session');

                resolve()
            });

            req.write(postData);
            req.on('error', reject);
            req.end();
        })
    };
};
