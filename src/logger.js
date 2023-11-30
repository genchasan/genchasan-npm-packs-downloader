const LEVEL = {
    HATA: 1,
    UYARI: 2,
    BILGI: 3,
    DEBUG: 4
};

class Logger {
    constructor() {
        if (!Logger.instance) {
            this.logSeviyesi = LEVEL.BILGI;
            Logger.instance = this;
        }

        return Logger.instance;
    }

    info(...mesajlar) {
        this.log(LEVEL.BILGI, mesajlar);
    }

    warn(...mesajlar) {
        this.log(LEVEL.UYARI, mesajlar);
    }

    error(...mesajlar) {
        this.log(LEVEL.HATA, mesajlar);
    }

    log(seviye, ...mesajlar) {
        if (seviye <= this.logSeviyesi) {
            console.log(...mesajlar);
        }
    }

    setLevel(level = LEVEL.BILGI) {
        this.logSeviyesi = level;
    }
}

const logger = new Logger();
Object.freeze(logger);

module.exports = {
    logger,
    LEVEL
};
