const fs = require('fs');
const path = require('path');

module.exports = class Osu {
    /**
     * Note: reading the directory and extracting the beatmap set id's from
     * the directories within it is a naive way of doing it since the
     * directories can be named anything. If you want to be thorough you
     * should read the beatmap set id's from the `.osu` file
     *
     * This way is way faster and easier though
     */
    getInstalledBeatmapIds() {
        return new Promise((resolve, reject) => {
            const songsDirectory = path.join(process.env.OSU_DIRECTORY, '/Songs');

            fs.readdir(songsDirectory, (error, files) => {
                if (error) {
                    reject(error);
                }

                const beatmapIds = files.map(file => {
                    const match = /^(\d+)/.exec(file);

                    if (match) {
                        return match[0];
                    } else {
                        return null;
                    }
                })
                    .filter(beatmapId => beatmapId !== null);

                resolve(beatmapIds);
            });
        });
    }
};
