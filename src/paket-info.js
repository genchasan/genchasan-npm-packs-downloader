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

            // Paketin tüm versiyonlarına erişim
            const allVersions = Object.entries(packageInfo.versions);

            cache.set(packageName, allVersions);

            // En son versiyonu seç (veya başka bir mantıkla)
            // const latestVersion = allVersions[allVersions.length - 1];

            //console.log(`Package Info for ${packageName}@${latestVersion}:`, packageInfo.versions[latestVersion]);
            //return packageInfo.versions[latestVersion];
            return allVersions;
        }
        logger.error(`Paket bilgileri alınamadı (${packageName}):`);
    } catch (error) {
        logger.error(`Paket bilgileri alınamadı (${packageName}):`, error.message);
    }
    return [];
}

module.exports = getPackagesInfo;
