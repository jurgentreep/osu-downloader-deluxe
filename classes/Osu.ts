import fs from 'fs';
import path from 'path';

export default class Osu {
    osuDirectory: string;

    constructor() {
        if (process.env.OSU_DIRECTORY) {
            this.osuDirectory = process.env.OSU_DIRECTORY;
        } else {
            throw new Error('OSU_DIRECTORY environment variable not set');
        }
    }
    /**
     * Note: reading the directory and extracting the beatmap set id's from
     * the directories within it is a naive way of doing it since the
     * directories can be named anything. If you want to be thorough you
     * should read the beatmap set id's from the `.osu` file.
     *
     * I've decided to do it this way because it's easier and faster.
     */
    getInstalledBeatmapIds(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const promises = this.getDirectories().map(directory => {
                return this.readDirectory(directory)
                    .then(directoryContents => this.extractIds(directoryContents))
                    .catch(directory => {
                        console.warn(`${directory} does not exist`);
                        return Promise.resolve([]);
                    });
            });

            Promise.all(promises)
                .then(beatmapIdArrays => {
                    console.log('Succesfully retrieved beatmap ids from osu installation');
                    resolve(([] as string[]).concat(...beatmapIdArrays));
                })
                .catch(reject);
        });
    }

    getDirectories(): string[] {
        return [
            '/Songs',
            '/Downloads',
            '/Songs/Failed'
        ].map(directoryName =>
            path.join(this.osuDirectory, directoryName));
    }

    readDirectory(directory: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (error, files) => {
                if (error) {
                    reject(error);
                }

                resolve(files);
            });
        });
    }

    extractIds(files: string[]): Promise<string[]> {
        const beatMapSetIds = files.reduce<string[]>((acc, file) => {
            const match = /^(\d+)/.exec(file);

            if (match) {
                acc.push(match[0]);
            }

            return acc;
        }, []);

        return Promise.resolve(beatMapSetIds);
    }
};
