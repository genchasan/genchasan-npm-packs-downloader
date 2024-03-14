const cache = require("./cache");

// getPackageVersions.js
const getPackagesInfo = require('./paket-info');

function arePacketsEqual(obj1, obj2) {
    return obj1.name === obj2.name && obj1.version === obj2.version;
}

function reduceVersions(versions) {
    let ret = [];
    versions.forEach(function (val) {
        if (!ret.some((u) => { return arePacketsEqual(val, u);}))
            ret.push(val);
    });

    return ret;
}

async function getPackageVersions(packageName, packageVersion, deepTree = false, maxLevel = 1) {
    try {
        let vers = [{ "name" : packageName, "version" : packageVersion, url : undefined, level: 0}];

        /*let newVers = */await getPackageVersionRecursive(packageName, deepTree, 0, maxLevel, vers);
        // vers.push(...newVers);

        for ( const [ver, pack] of cache.entries()) {
            for (const [v, p] of Object.values(pack)) {
                vers.push({name: p.name, version: p.version, url: p.dist.tarball, level: 0});
            }
        }
/*
        const allPacks = await getPackagesInfo(packageName); //.then( ()=> { console.info(packageName + " okundu")});

        for ( const [ver, pack] of Object.values(allPacks)) {
            vers.push({name: pack.name, version: pack.version, url : pack.dist.tarball});

            if (deepTree && pack.dependencies != undefined)
                for ( const dep of Object.entries(pack.dependencies)) {
                    let packs = await getPackagesInfo(dep[0]);

                    for ( const [a, p] of Object.values(packs)) {
                        vers.push({name: p.name, version: p.version, url: p.dist.tarball});
                    }
                }
            if (deepTree && pack.devDependencies != undefined)
                for (const dep of Object.entries(pack.devDependencies)) {
                    let packs = await getPackagesInfo(dep[0]);

                    for ( const [a, p] of Object.values(packs)) {
                        vers.push({name: p.name, version: p.version, url: p.dist.tarball});
                    }
                }
        }
*/

        return reduceVersions(vers);

    } catch (error) {
        console.error(`Paket bilgileri alınamadı (${packageName}@${packageVersion}):`, error.message);
        throw error;
    }
}

async function getPackageVersionRecursive(packageName, deepTree = false, level = 0, maxLevel = 1, vers = []) {
    let lokalLevel = level + 1;

    const allPacks = await getPackagesInfo(packageName);

    for (const [ver, pack] of Object.values(allPacks)) {
        //vers.push({name: pack.name, version: pack.version, url: pack.dist.tarball, level: lokalLevel});

        if (lokalLevel > maxLevel) continue; // Daha derine inmeden sonrakine gec

        if (deepTree && pack.dependencies !== undefined)
            for (const dep of Object.entries(pack.dependencies)) {
                await getPackageVersionRecursive(dep[0], deepTree, lokalLevel, maxLevel, vers);
            }
        if (deepTree && pack.devDependencies !== undefined)
            for (const dep of Object.entries(pack.devDependencies)) {
                await getPackageVersionRecursive(dep[0], deepTree, lokalLevel, maxLevel, vers);
            }
        if (deepTree && pack.peerDependencies !== undefined)
            for (const dep of Object.entries(pack.peerDependencies)) {
                await getPackageVersionRecursive(dep[0], deepTree, lokalLevel, maxLevel, vers);
            }
    }
}

module.exports = {
    getPackageVersions,
    arePacketsEqual,
    reduceVersions
};
