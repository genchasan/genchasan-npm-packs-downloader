
const fs = require('fs');
const { getPackageVersions, reduceVersions } = require('./paket-versions');
const { getPaketList } = require('./paket-local-info');
const { readPackageLockFile } = require('./package-lock-info');
const { downloadFile } = require('./download-file');
const { logger } = require('./logger');

function getFileName(url) {
    // URL'nin pathname özelliğini al
    let pathname = new URL(url).pathname;

    // Son '/' karakterinden sonraki kısmı alarak dosya adını çıkart
    return pathname.substring(pathname.lastIndexOf('/') + 1);
}

function filterVersions(allVersions = []) {
    allVersions.sort((p1, p2) => {
        if (p1.name !== p2.name) {
            return p1.name.localeCompare(p2.name);
        }
        return p1.version.localeCompare(p2.version);
    });

    let vers = reduceVersions(allVersions);
    let rules = ["-dev.", "next", "-test.", "-nightly-", "-candidate", "experimental", "-pre", "beta", "file:", "fetch", "rc", "canary", "git", "-alpha", "0.0.0-"];
    let filteredVers = vers.filter((value) => {
        if (value.url == undefined) return false;
        return !rules.some((r) => {
            return value.version.includes(r);
        });
    });

    return filteredVers;
}

function parseMultiplePackageStrings(packageStrings) {
    const packages = packageStrings.split(' ');
    return packages.map(packageString => {
        const atIndex = packageString.lastIndexOf('@');
        const name = packageString.substring(0, atIndex);
        const version = packageString.substring(atIndex + 1);
        return { name, version };
    });
}

async function findDependenciesByPackages(packages='-pack-name-@0.0.0', deepTree = false, maxLevel = 1) {
    let packageStrings = parseMultiplePackageStrings(packages);
    let allVersions = [];
    for (const packageString of packageStrings) {
        const versions = await getPackageVersions(packageString.name, packageString.version, deepTree, maxLevel);

        versions.forEach(function (value) {
            allVersions.push(value);
        });
    }

    return filterVersions(allVersions);
}

async function findDependencies(fileName='package.json', deepTree = false, maxLevel = 1) {
    try {
        if( !fs.existsSync(fileName)) throw new Error(fileName + ' dosyası bulunamadı.');

        const paketler = getPaketList(fs.realpathSync(fileName));

        let allVersions = [];
        for (const p of paketler) {
            let versionlar = await getPackageVersions(p.name, p.version, deepTree, maxLevel);

            versionlar.forEach(function (value) {
                allVersions.push(value);
            });
        }

        return filterVersions(allVersions);
    } catch (error) {
        logger.error(error)
        throw new Error(error);
    }
}

function readPackFileList(listFile) {
    if (!fs.existsSync(listFile)) throw new Error(listFile + ' dosya bulunamadı');
    const data = fs.readFileSync(listFile, 'utf8');

    const satirlar = data.split('\n');

    return Object.values(satirlar)
        .filter(s => s.trim().length > 0 && s.split(',').length >= 3)
        .map(e => {
        const paket = e.split(',');
        if (paket.length === 3)
            return {name: paket[0].trim(), version: paket[1].trim(), url: paket[2].trim()};
        else return {name: "-", version: "-", url: "-"};
    });
}

function extractDirName(packName) {
    const dirPattern = /@.*\//;
    let match = packName.match(dirPattern);
    if (match) {
        return match[0].slice(1, -1);
    }
    return './';
}

function downloadPacks(packs = []) {
    for (const value of packs) {
        let dirname = extractDirName(value.name);

        let filename = 'modules/' + dirname;

        if (!dirname.includes('./')) fs.mkdirSync(filename, {recursive:true});

        filename = filename + '/' + getFileName(value.url);
        if (fs.existsSync(filename)) {
            logger.info(filename + " dosyası zaten mevcut");
        } else {
            try {
                downloadFile(value.url, filename).then(() => {
                    logger.info(filename + " dosyası indirildi...")
                });
            } catch (e) {
                logger.error(e.message);
            }
        }
    }
}
async function downloadPackageFilesByPackages(packages='-pack-name-@0.0.0', deepTree = false,
                                              maxLevel = 1) {
    if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

    findDependenciesByPackages(packages, deepTree, maxLevel).then(async (packs) => {
        downloadPacks(packs);
    }).catch((error) => {
        logger.error(error);
        throw new Error(error);
    });
}

async function downloadPackageFilesByFile(listFile = 'paket-listesi.txt') {
    let packs = readPackFileList(listFile);

    if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

    downloadPacks(packs);
}

async function downloadPackageFiles(packFile = 'package.json', deepTree = false,
                                    maxLevel = 1) {
    let packs = await findDependencies(packFile, deepTree, maxLevel);

    if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

    downloadPacks(packs);
}

function writePacksToFile(packs, fileName) {
    if (fs.existsSync(fileName)) {
        fs.rmSync(fileName);
        logger.info('Dosya zaten var, üzerine yazmak için silindi');
    }

    for (const value of packs) {
        fs.appendFile(fileName, value.name + ', ' + value.version + ', ' + value.url + '\n', 'utf-8', (err) => {
            if (err) {
                logger.error('Dosyaya yazma hatası:', err);
            }
        });
    }
}

async function writePackDependencies(packFile = 'package.json', fileName = 'paket-listesi.txt',
                                     deepTree = false, maxLevel = 1) {
    const packs = await findDependencies(packFile, deepTree, maxLevel);

    writePacksToFile(packs, fileName);
}

async function writePackDependenciesByPackages(packages='-pack-name-@0.0.0', fileName = 'paket-listesi.txt', deepTree = false, maxLevel = 1) {
    const packs = await findDependenciesByPackages(packages, deepTree, maxLevel);

    writePacksToFile(packs, fileName);
}

async function downloadPackageFilesFromLockFile(fileName = 'package-lock.json') {
    try {
        if (!fs.existsSync(fileName)) throw new Error(fileName + ' dosyası bulunamadı.');

        if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

        const resolvedPacks = await readPackageLockFile(fileName);
        const packs = reduceVersions(resolvedPacks);

        downloadPacks(packs);
    } catch (error) {
        logger.error(error)
        throw new Error(error);
    }
}

async function testDownloadFile() {
    let url = "https://registry.npmjs.org/yup/-/yup-0.20.0.tgz";
    let filename = './modules/' + getFileName(url);

    if (fs.existsSync(filename)) {
        logger.info(filename + " dosyası zaten mevcut");
    } else {
        await downloadFile(url, filename);
        logger.info(filename + " dosyası indirildi...")
    }
}

//writePackDependencies("../package.json");
//findDependencies('../package.json');
//downloadPackageFiles('aa', false, '../paket-listesi.txt');
//loadDependencies("../package-lock.json");

module.exports = {
    findDependencies,
    writePackDependencies,
    downloadPackageFiles,
    downloadPackageFilesFromLockFile,
    findDependenciesByPackages,
    downloadPackageFilesByPackages,
    downloadPackageFilesByFile,
    writePackDependenciesByPackages
}