const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;

module.exports = class Setup {

    checkRequiredFiles() {
        return Promise.all([
            this.envFileExists(),
            this.mappersFileExists(),
            this.failedBeatmapsFileExists()
        ]);
    }

    envFileExists() {
        return new Promise((resolve, reject) => {
            fs.copyFile('.env.example', '.env', COPYFILE_EXCL, error => {
                if (error) {
                    resolve('.env file already exists.');
                } else {
                    console.info(`.env file didn't exist yet and has been created. Please fill out the information.`);
                    // We reject the promise because if the .env file didn't exist before we know the information hasn't been filled out yet.
                    return reject(`.env file doesn't exist.`);
                }
            });
        });
    }

    mappersFileExists() {
        return new Promise((resolve, reject) => {
            fs.copyFile('mappers.txt.example', 'mappers.txt', COPYFILE_EXCL, error => {
                if (error) {
                    resolve('mappers.txt file already exists.');
                } else {
                    console.info(`mappers.txt file didn't exist yet and has been created. Please add the id's or names from your mappers. It's recommended to use id's because they can't change but both are possible.`);
                    return resolve(`mappers.txt file doesn't exist.`);
                }
            });
        });
    }

    failedBeatmapsFileExists() {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream('failed_beatmaps.txt', {
                flags: 'a'
            });
            writeStream.end();
            resolve(`failed_beatmaps.txt file has been created if it didn't exist yet.`);
        });
    }

}
