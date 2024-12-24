const DB_NAME = 'AppLauncherDB';
const DB_VERSION = 1;
const STORES = {
  APPS: 'apps',
  SETTINGS: 'settings',
  CACHE: 'cache'
};

class CacheService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.APPS)) {
          const appsStore = db.createObjectStore(STORES.APPS, { keyPath: 'id' });
          appsStore.createIndex('category', 'category', { unique: false });
          appsStore.createIndex('offlineCapable', 'offlineCapable', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async cacheApp(app) {
    const tx = this.db.transaction(STORES.APPS, 'readwrite');
    const store = tx.objectStore(STORES.APPS);
    
    // Add offline capability flag
    const appWithOffline = {
      ...app,
      offlineCapable: app.offlineCapable || false,
      lastUpdated: new Date().toISOString()
    };
    
    await store.put(appWithOffline);
    return appWithOffline;
  }

  async getCachedApp(id) {
    const tx = this.db.transaction(STORES.APPS, 'readonly');
    const store = tx.objectStore(STORES.APPS);
    return await store.get(id);
  }

  async getCachedApps() {
    const tx = this.db.transaction(STORES.APPS, 'readonly');
    const store = tx.objectStore(STORES.APPS);
    return await store.getAll();
  }

  async getOfflineApps() {
    const tx = this.db.transaction(STORES.APPS, 'readonly');
    const store = tx.objectStore(STORES.APPS);
    const index = store.index('offlineCapable');
    return await index.getAll(true);
  }

  async cacheResponse(url, response) {
    const tx = this.db.transaction(STORES.CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CACHE);
    
    const cache = {
      url,
      data: await response.clone().json(),
      timestamp: new Date().getTime()
    };
    
    await store.put(cache);
  }

  async getCachedResponse(url) {
    const tx = this.db.transaction(STORES.CACHE, 'readonly');
    const store = tx.objectStore(STORES.CACHE);
    return await store.get(url);
  }

  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days by default
    const tx = this.db.transaction(STORES.CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CACHE);
    const index = store.index('timestamp');
    const cutoff = new Date().getTime() - maxAge;
    
    const range = IDBKeyRange.upperBound(cutoff);
    const oldEntries = await index.getAllKeys(range);
    
    for (const key of oldEntries) {
      await store.delete(key);
    }
  }

  async saveSettings(settings) {
    const tx = this.db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    await store.put({ key: 'userSettings', value: settings });
  }

  async getSettings() {
    const tx = this.db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const result = await store.get('userSettings');
    return result ? result.value : null;
  }

  async cacheUsageData(usageData) {
    try {
      const store = await this.getStore(STORES.CACHE, 'readwrite');
      await store.put({
        url: `usage-${usageData.sessionId}`,
        data: usageData,
        timestamp: new Date().getTime()
      });
      return true;
    } catch (error) {
      console.error('Error caching usage data:', error);
      return false;
    }
  }

  async getStore(storeName, mode = 'readonly') {
    if (!this.db) {
      await this.initDB();
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }
}

export const cacheService = new CacheService();
