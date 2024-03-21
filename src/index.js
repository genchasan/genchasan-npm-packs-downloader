#!/usr/bin/env node

const yargs = require('yargs');
const { downloadPackageFiles, writePackDependencies, findDependencies,
    downloadPackageFilesFromLockFile, findDependenciesByPackages,
    downloadPackageFilesByPackages, downloadPackageFilesByFile,
    writePackDependenciesByPackages } = require('./find-dependencies');
const {logger} = require("./logger");
const path = require('path');
const fs = require('fs');

const scriptDirectory = __dirname;
const currentWorkingDirectory = process.cwd();

function isFullPath(filePath) {
    return path.isAbsolute(filePath);
}

const listDepsCommand = {
    command: 'list',
    describe: 'List dependencies',
    builder: (yargs) => {
        return yargs.option('file', {
                alias: 'f',
                describe: 'Package .json dosyası',
                type: 'string',
                demandOption : false,
                default: 'package.json'
            })
            .option('packages', {
                alias: 'p',
                describe: 'Paket listesi',
                type: 'string',
                demandOption : false,
            })
            .option('deepCopy', {
                alias: 'd',
                describe: 'Alt bağımlılıkları degerlendir',
                type: 'boolean',
                demandOption : false,
                choices: [ true, false ],
                default : false
            })
            .option('maxLevel', {
                alias: 'm',
                describe: 'Alt bağımlılık basamak sayisi',
                type: 'number',
                demandOption : false,
                default : 1
            });
    },
    handler: (argv) => {
        const name = argv.file;
        const deepCopy = argv.deepCopy;
        const level = argv.maxLevel;
        const packages = argv.packages;

        // Dosyanın okunacağı dizini belirt
        try {
            const fileToRead = isFullPath(name) ? path.parse(name) : path.join(currentWorkingDirectory, name);

            if (packages) {
                logger.info(`${packages}! paketleri üzerindeki bağımlılıklar listelenecek...`);
                findDependenciesByPackages(packages, deepCopy, level).then((result) => {
                    logger.info(result);
                });
            } else {
                logger.info(`${fileToRead}! dosyası üzerindeki bağımlılıklar listelenecek...`);
                findDependencies(fileToRead, deepCopy, level).then((result) => {
                    logger.info(result);
                }).then(()=>{ console.log("Listeleme bitti...")});
            }
            //logger.info(deps);
        } catch (e) {
            logger.error('HATA : ' + e.message);
        }

    },
};

// "goodbye" komutunu tanımla
const downloadPacksCommand = {
    command: 'download',
    describe: 'Download packages and its dependencies',
    builder: (yargs) => {
        return yargs.option('file', {
                alias: 'f',
                describe: 'Package *.json dosyası',
                type: 'string',
                demandOption: false,
                default: 'package.json'
            })
            .option('packages', {
                alias: 'p',
                describe: 'Paket listesi',
                type: 'string',
                demandOption : false,
            })
            .option('listFile', {
                alias: 'l',
                describe: 'Paket listesi dosyasından dowload eder',
                type: 'string',
            })
            .option('deepCopy', {
                alias: 'd',
                describe: 'Alt bağımlılıkları degerlendir',
                type: 'boolean',
                demandOption : false,
                choices: [ true, false ],
                default : false
            })
            .option('maxLevel', {
                alias: 'm',
                describe: 'Alt bağımlılık basamak sayisi',
                type: 'number',
                demandOption : false,
                default : 1
            });
    },
    handler: (argv) => {
        const name = argv.file;
        const listFile = argv.listFile;
        const deepCopy = argv.deepCopy;
        const level = argv.maxLevel;
        const packages = argv.packages;

        // Dosyanın okunacağı dizini belirt
        const fileToRead = isFullPath(name) ? path.parse(name) : path.join(currentWorkingDirectory, name);

        if (packages) {
            logger.info(`${packages} paketleri ve bağımlılıkları indirilecek...`);
            downloadPackageFilesByPackages(packages, deepCopy, level).then(r => {
                logger.info("Paketler indirildi")
            });
        } else if(listFile) {
            logger.info(`${listFile} dosyasındaki paketler ve bağımlılıkları indirilecek...`);
            downloadPackageFilesByFile(listFile).then(r => {
                logger.info("Paketler indirildi")
            });
        } else {
            logger.info(`${fileToRead} dosyasındaki paketler ve bağımlılıkları indirilecek...`);
            downloadPackageFiles(fileToRead, deepCopy, level).then(r => {
                logger.info("Paketler indirildi")
            });
        }
    },
};


const generatePackListCommand = {
    command: 'write-to-file',
    describe: 'Write package list file.',
    builder: (yargs) => {
        return yargs.option('file', {
                alias: 'f',
                describe: 'Package *.json dosyası',
                type: 'string',
                demandOption: false,
                default: 'package.json'
            })
            .option('packages', {
                alias: 'p',
                describe: 'Paket listesi',
                type: 'string',
                demandOption : false,
            })
            .option('deepCopy', {
                alias: 'd',
                describe: 'Alt bağımlılıkları degerlendir',
                type: 'boolean',
                demandOption : false,
                choices: [ true, false ],
                default : false
            })
            .option('maxLevel', {
                alias: 'm',
                describe: 'Alt bağımlılık basamak sayisi',
                type: 'number',
                demandOption : false,
                default : 1
            });
    },
    handler: (argv) => {
        const name = argv.file;
        const deepCopy = argv.deepCopy;
        const level = argv.maxLevel;
        const packages = argv.packages;

        if (packages) {
            logger.info(`${packages} paketleri ve bağımlılıkları dosyaya yazacak...`);
            writePackDependenciesByPackages(packages, 'paket-listesi.txt', deepCopy, level).then(r => {
                logger.info("Paket bağımlılıkları dosyaya yazildi");
            });
        } else {
            // Dosyanın okunacağı dizini belirt
            const fileToRead = isFullPath(name) ? path.parse(name) : path.join(currentWorkingDirectory, name);

            logger.info(`${fileToRead} dosyasındaki paketler ve bağımlılıkları dosyaya yazacak...`);

            writePackDependencies(fileToRead, 'paket-listesi.txt', deepCopy, level).then(r => {
                logger.info("Paket bağımlılıkları dosyaya yazildi");
            });
        }

    },
};

const downloadPacksFromLockFileCommand = {
    command: 'lock-file',
    describe: 'Download packages with package-lock.json file.',
    builder: (yargs) => {
        return yargs.option('file', {
            alias: 'f',
            describe: 'Package-lock.json dosyası',
            type: 'string',
            demandOption: false,
            default: 'package-lock.json'
        });
    },
    handler: (argv) => {
        const name = argv.file;

        // Dosyanın okunacağı dizini belirt
        const fileToRead = isFullPath(name) ? path.parse(name) : path.join(currentWorkingDirectory, name);

        logger.info(`${fileToRead} dosyasındaki paketler ve bağımlılıkları dosyaya yazacak...`);

        downloadPackageFilesFromLockFile(fileToRead).then(r => {
            logger.info("Paketler indirildi");
        });
    },
};


// Tanımlanan komutları yargs'e ekle
yargs.command(listDepsCommand)
    .command(downloadPacksCommand)
    .command(downloadPacksFromLockFileCommand)
    .command(generatePackListCommand);

// Yargs konfigürasyonu,
const argv = yargs
    .help()
    .argv;

// Kullanıcının girdiği komutu kontrol et
if (argv._.length === 0) {
    console.log('Bilinmeyen komut. Yardım için "--help" kullanın.');
}

