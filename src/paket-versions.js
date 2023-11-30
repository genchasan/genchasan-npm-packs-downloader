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

async function getPackageVersions(packageName, packageVersion, deepTree = false) {
    try {
        let vers = [{ "name" : packageName, "version" : packageVersion, url : undefined}];

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

        return reduceVersions(vers);

    } catch (error) {
        console.error(`Paket bilgileri alınamadı (${packageName}@${packageVersion}):`, error.message);
        throw error;
    }
}

module.exports = {
    getPackageVersions,
    arePacketsEqual,
    reduceVersions
};
