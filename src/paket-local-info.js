const fs = require('fs');
const path = require('path');

function getPaketList(packageFileName) {
    try {
        const packagePath = path.resolve(packageFileName);
        const packageJson = fs.readFileSync(packagePath, 'utf8');
        const pack = JSON.parse(packageJson);

        const dependencies = pack.dependencies || {};
        const devDependencies = pack.devDependencies || {};

        return [...Object.entries(dependencies), ...Object.entries(devDependencies)].map(function (val) {
            return { name: val[0], version: val[1] };
        });
    } catch (error) {
        console.error(`Error reading or parsing ${packageFileName}:`, error.message);
        return [];
    }

}

module.exports = {
    getPaketList
};