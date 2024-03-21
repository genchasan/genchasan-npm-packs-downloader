// getPackagesInfo.js
const cache = require("./cache");
const axios = require('axios');
const {logger} = require('./logger');

// getPackagesInfo.js

async function getPackagesInfo(packageName) {
    try {
        // NPM Registry'den paket bilgilerini al
        logger.info("Reading info : " + `https://registry.npmjs.org/${packageName}`);
        if (cache.has(packageName)) {
            logger.warn("Already read packet info : ", packageName);
            return cache.get(packageName);
        }

        const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
        if (response.status === 200) {
            const packageInfo = response.data;

            let latestVersion = packageInfo['dist-tags'].latest;

            // Paketin tüm versiyonlarına erişim
            const allVersions = Object.entries(packageInfo.versions);

            cache.set(packageName, { latestVersion, allVersions });

            return { latestVersion, allVersions };
        }
        logger.error(`Paket bilgileri alınamadı (${packageName}):`);
    } catch (error) {
        logger.error(`Paket bilgileri alınamadı (${packageName}):`, error.message);
    }
    return { undefined, undefined };
}

module.exports = getPackagesInfo;
