import readline from 'readline';
import fs from 'fs';

export default class Config {
    getMappers(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const mappers: string[] = [];

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

    storeBeatmapIds(beatmapSetIds: string[]) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream('beatmaps.txt')

            stream.once('open', fd => {
                beatmapSetIds.forEach(beatmapSetId => stream.write(`${beatmapSetId}\n`));
                stream.end();

                console.info('Beatmap ids succesfully written to beatmaps.txt');
                resolve('Beatmap ids succesfully written to beatmaps.txt');
            });
        });
    }

    getBeatmapIds(): Promise<string[]> {
        const promise = this.readIdsFromFile('beatmaps.txt');

        promise.then(() => console.info('Succesfully retrieved beatmap ids from beatmaps.txt'));

        return promise;
    }

    storeFailedBeatmapId(beatmapSetId: string) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream('failed_beatmaps.txt', {
                flags: 'a'
            });

            stream.once('open', fd => {
                stream.write(`${beatmapSetId}\n`);
                stream.end();

                resolve('Succesfully written failed beatmap id to file');
            });
        });
    }

    getFailedBeatmapIds(): Promise<string[]> {
        const promise = this.readIdsFromFile('failed_beatmaps.txt');

        promise.then(() => console.info('Succesfully retrieved failed beatmap ids from failed_beatmaps.txt'));

        return promise;
    }

    readIdsFromFile(path: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const beatmapIds: string[] = [];

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
