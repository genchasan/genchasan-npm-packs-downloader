// cache.js

class Cache {
    constructor() {
        if (!Cache.instance) {
            this.cache = {};
            Cache.instance = this;
        }

        return Cache.instance;
    }

    set(key, value) {
        this.cache[key] = value;
    }

    get(key) {
        return this.cache[key];
    }

    remove(key) {
        delete this.cache[key];
    }

    clear() {
        this.cache = {};
    }

    has(key) {
        return key in this.cache;
    }
}

const instance = new Cache();

Object.freeze(instance);

module.exports = instance;
