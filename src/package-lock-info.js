const fs = require('fs');
const path = require('path');
const semver = require('semver');
const getPackagesInfo = require('./paket-info');

async function readPackageLockFile(packageFileName = "package-lock.json") {
    try {
        const packagePath = path.resolve(packageFileName);
        const packageJson = fs.readFileSync(packagePath, 'utf8');
        const packJson = JSON.parse(packageJson);

        const dependencies = packJson.packages || {};

        let findings = [...Object.entries(dependencies)].filter(
            (value) => {
                return value[0].length !== 0;
            }
        ).map(function (val) {
            return { name: trimPrefix(val[0], 'node_modules/'), version: val[1].version, url: val[1].resolved };
        });

        for (const val of [...Object.entries(dependencies)].filter(
            (value) => {
                return value[0].length !== 0;
            }
        )) {
            let deps = val[1].dependencies || {};
            let deps2 = val[1].peerDependencies || {};
            for (const v of [...Object.entries(deps), ...Object.entries(deps2)]) {
                try {
                    let packInfo = await getPackagesInfo(v[0]);

                    const uygunVersiyon = semver.maxSatisfying(Object.entries(packInfo).map(p => p[1][0]), v[1]);

                    if (!uygunVersiyon) {
                        console.error(`Belirtilen versiyon gereksinimini karşılayan bir versiyon bulunamadı: ${v[1]}`);
                    } else {
                        //console.log(`İndirilecek paket versiyonu: ${paketAdi}@${uygunVersiyon}`);
                        let uygunPack = Object.entries(packInfo).find(p => p[1][0] === uygunVersiyon)[1][1];
                        findings.push({ name: trimPrefix(uygunPack.name, 'node_modules/'), version: uygunPack.version, url: uygunPack.dist.tarball });
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }

        return findings;
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