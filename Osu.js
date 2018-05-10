const fs = require('fs');
const path = require('path');

module.exports = class Osu {
    /**
     * Note: reading the directory and extracting the beatmap set id's from
     * the directories within it is a naive way of doing it since the
     * directories can be named anything. If you want to be thorough you
     * should read the beatmap set id's from the `.osu` file.
     *
     * I've decided to do it this way because it's easier and faster.
     */
    getBeatmapIds() {
        return new Promise((reject, resolve) => {
            const promises = this.getDirectories().map(directory => {
                return this.readDirectory(directory)
                    .then(directoryContents => this.extractIds(directoryContents));
            });

            Promise.all(promises)
                .then(beatmapIdArrays => {
                    console.log('Succesfully retrieved beatmap ids from osu installation');
                    resolve([].concat(...beatmapIdArrays));
                })
                .catch(reject);
        });
    }

    getDirectories() {
        return [
            '/Songs',
            '/Downloads'
        ].map(directoryName =>
            path.join(process.env.OSU_DIRECTORY, directoryName));
    }

    readDirectory(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (error, files) => {
                if (error) {
                    reject(error);
                }

                resolve(files);
            });
        });
    }

    extractIds(files) {
        const beatmapIds = files.map(file => {
            const match = /^(\d+)/.exec(file);

            // Maybe return 0 intead of null so the elements kinds stays PACKED_SMI_ELEMENTS
            // and is thus faster to process although I like the clarity of null.
            // Besides I'm using a regex function above which is way more expensive xD
            return match ? match[0] : null;
        })
            .filter(beatmapId => beatmapId !== null);

        return Promise.resolve(beatmapIds);
    }
};
