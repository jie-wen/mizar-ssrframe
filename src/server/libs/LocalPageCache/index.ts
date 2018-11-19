
export default class LocalPageCache {
    public static set(key, value) {
        if (LocalPageCache.cache.size < LocalPageCache.maxCacheNumber) {
            // 缓存未达到上限，存入缓存
            LocalPageCache.cache.set(key, value);
        }
    }

    public static get(key) {
        return LocalPageCache.cache.get(key);
    }
    private static cache = new Map();
    private static maxCacheNumber = 100;
}
