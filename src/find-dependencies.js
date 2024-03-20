
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
        //console.log(vers);
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

async function downloadPackageFiles(packFile = 'package.json', deepTree = false,
                                    listFile = undefined, maxLevel = 1) {
    let packs;

    if (listFile === undefined) {
        packs = await findDependencies(packFile, deepTree, maxLevel);
    } else {
        packs = readPackFileList(listFile);
    }

    if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

    for (const value of packs) {
        let dirname = extractDirName(value.name);

        let filename = 'modules/' + dirname;

        if (!dirname.includes('./')) fs.mkdirSync(filename, {recursive:true});

        filename = filename + '/' + getFileName(value.url);
        if (fs.existsSync(filename)) {
            logger.info(filename + " dosyası zaten mevcut");
        } else {
            try {
                await downloadFile(value.url, filename);
                logger.info(filename + " dosyası indirildi...")
            } catch (e) {
                logger.error(e.message);
            }
        }
    }
}

async function writePackDependencies(packFile = 'package.json', fileName = 'paket-listesi.txt',
                                     deepTree = false, maxLevel = 1) {
    const packs = await findDependencies(packFile, deepTree, maxLevel);

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

async function downloadPackageFilesFromLockFile(fileName = 'package-lock.json') {
    try {
        if (!fs.existsSync(fileName)) throw new Error(fileName + ' dosyası bulunamadı.');

        if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');

        const resolvedPacks = await readPackageLockFile(fileName);
        const packs = reduceVersions(resolvedPacks);

        for (const pack of packs) {
            let dirname = extractDirName(pack.name);

            let filename = 'modules/' + dirname;

            if (!dirname.includes('./')) fs.mkdirSync(filename, {recursive: true});

            filename = filename + '/' + getFileName(pack.url);
            if (fs.existsSync(filename)) {
                logger.info(filename + " dosyası zaten mevcut");
            } else {
                try {
                    await downloadFile(pack.url, filename);
                    logger.info(filename + " dosyası indirildi...")
                } catch (e) {
                    logger.error(e.message);
                }
            }
        }
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
    downloadPackageFilesFromLockFile
}