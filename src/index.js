#!/usr/bin/env node

const yargs = require('yargs');
const { downloadPackageFiles, writePackDependencies, findDependencies } = require('./find-dependencies');
const {logger} = require("./logger");
const path = require('path');
const fs = require('fs');

const scriptDirectory = __dirname;
const currentWorkingDirectory = process.cwd();

const listDepsCommand = {
    command: 'list',
    describe: 'List dependencies',
    builder: (yargs) => {
        return yargs.option('file', {
            alias: 'f',
            describe: 'Package *.json dosyası',
            type: 'string',
            demandOption : false
        });
    },
    handler: (argv) => {
        const name = argv.file;
        // Dosyanın okunacağı dizini belirt
        try {
            const fileToRead = path.join(currentWorkingDirectory, name === undefined ? "package.json" : name);

            logger.info(`${fileToRead}! dosyası üzerindeki bağımlılıklar listelenecek...`);

            findDependencies(fileToRead).then((result) => {
                logger.info(result);
            });
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
            demandOption: false
        });
    },
    handler: (argv) => {
        const name = argv.file;
        //path.resolve(name + '');
        // Dosyanın okunacağı dizini belirt
        const fileToRead = path.join(currentWorkingDirectory, name === undefined ? "package.json" : name);

        logger.info(`${name} dosyasındaki paketler ve bağımlılıkları indirilecek...`);
        downloadPackageFiles(fileToRead).then(r => {
            logger.info("Paketler indirildi")
        });
    },
};


const generatePackListCommand = {
    command: 'list-to-file',
    describe: 'Generate package list file.',
    builder: (yargs) => {
        return yargs.option('file', {
            alias: 'f',
            describe: 'Package *.json dosyası',
            type: 'string',
            demandOption: false
        });
    },
    handler: (argv) => {
        const name = argv.file;
        path.resolve(name + '');
        // Dosyanın okunacağı dizini belirt
        const fileToRead = path.join(currentWorkingDirectory, name === undefined ? "package.json" : name);

        logger.info(`${name} dosyasındaki paketler ve bağımlılıkları indirilecek...`);

        writePackDependencies(fileToRead, 'paket-listesi.txt');
    },
};

// Tanımlanan komutları yargs'e ekle
yargs.command(listDepsCommand)
    .command(downloadPacksCommand)
    .command(generatePackListCommand);

// Yargs konfigürasyonu,
const argv = yargs
    .help()
    .argv;

// Kullanıcının girdiği komutu kontrol et
if (argv._.length === 0) {
    console.log('Bilinmeyen komut. Yardım için "--help" kullanın.');
}

