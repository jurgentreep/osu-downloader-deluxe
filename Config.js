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
            });

            console.info('Beatmap ids succesfully written to beatmaps.txt');
            resolve('Beatmap ids succesfully written to beatmaps.txt');
        });
    }

    getBeatmapIds() {
        return new Promise((resolve, reject) => {
            const beatmaps = [];

            readline.createInterface({
                input: fs.createReadStream('beatmaps.txt'),
                crlfDelay: Infinity
            })
                .on('line', line => {
                    line = line.trim();

                    if (line.length > 0) {
                        beatmaps.push(line);
                    }
                })
                .on('close', () => {
                    console.info('Succesfully retrieved beatmaps from beatmaps.txt');
                    resolve(beatmaps);
                });
        });
    }
};
