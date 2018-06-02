const readline = require('readline');
const fs = require('fs');

module.exports = class Config {
    getMappers() {
        return new Promise((resolve, reject) => {
            const mappers = [];

            readline.createInterface({
                input: fs.createReadStream('mappers.txt'),
                crlfDelay: Infinity
            })
                .on('line', line => {
                    line = line.trim();

                    if (line.length > 0) {
                        mappers.push(line);
                    }
                })
                .on('close', () => {
                    console.info('Succesfully retrieved mappers from mappers.txt');
                    resolve(mappers);
                });
        });
    }

    storeBeatmapIds(beatmapIds) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream('beatmaps.txt')

            stream.once('open', fd => {
                beatmapIds.forEach(beatmapId => stream.write(`${beatmapId}\n`));
                stream.end();

                console.info('Beatmap ids succesfully written to beatmaps.txt');
                resolve('Beatmap ids succesfully written to beatmaps.txt');
            });
        });
    }

    getBeatmapIds() {
        const promise = this.readIdsFromFile('beatmaps.txt');

        promise.then(() => console.info('Succesfully retrieved beatmap ids from beatmaps.txt'));

        return promise;
    }

    storeFailedBeatmapId(beatmapId) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream('failed_beatmaps.txt', {
                flags: 'a'
            });

            stream.once('open', fd => {
                stream.write(`${beatmapId}\n`);
                stream.end();

                resolve('Succesfully written failed beatmap id to file');
            });
        });
    }

    getFailedBeatmapIds() {
        const promise = this.readIdsFromFile('failed_beatmaps.txt');

        promise.then(() => console.info('Succesfully retrieved failed beatmap ids from failed_beatmaps.txt'));

        return promise;
    }

    readIdsFromFile(path) {
        return new Promise((resolve, reject) => {
            const beatmapIds = [];

            readline.createInterface({
                input: fs.createReadStream(path),
                crlfDelay: Infinity
            })
                .on('line', line => {
                    line = line.trim();

                    if (line.length > 0) {
                        beatmapIds.push(line);
                    }
                })
                .on('close', () => {
                    resolve(beatmapIds);
                });
        });
    }
};
