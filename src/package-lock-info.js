const fs = require('fs');
const path = require('path');

function readPackageLockFile(packageFileName = "package-lock.json") {
    try {
        const packagePath = path.resolve(packageFileName);
        const packageJson = fs.readFileSync(packagePath, 'utf8');
        const packJson = JSON.parse(packageJson);

        const dependencies = packJson.packages || {};

        return [...Object.entries(dependencies)].filter(
            (value) => {
                return value[0].length !== 0;
            }
        ).map(function (val) {
            return { name: trimPrefix(val[0], 'node_modules/'), version: val[1].version, url: val[1].resolved };
        });
    } catch (error) {
        console.error(`Error reading or parsing ${packageFileName}:`, error.message);
        return [];
    }

}

function trimPrefix(name, prefix) {
    const index = name.lastIndexOf(prefix);
    if (index === -1 || prefix === '') return name;
    return name.substring(index + prefix.length);
}

module.exports = {
    readPackageLockFile
};