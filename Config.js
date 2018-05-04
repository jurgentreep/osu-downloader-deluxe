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
                .on('close', () => resolve(mappers));
        });
    }
};
