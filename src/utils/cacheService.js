/**
 * LocalStorage Caching Utility Service
 *
 * Provides a robust caching mechanism with:
 * - Deterministic cache key generation (endpoint + query parameters / date ranges / filters)
 * - Safe JSON serialization & parsing with corrupted entry recovery
 * - Deep equality comparison (isDataChanged) to avoid unnecessary localStorage writes & state updates
 * - In-flight API request deduplication to prevent duplicate network calls
 * - QuotaExceededError handling with automatic cache pruning
 * - Stale-While-Revalidate (SWR) execution support
 */

const CACHE_PREFIX = 'dashboard_cache:';

/**
 * Deep equality check between two values (primitives, objects, arrays, dates, null/undefined).
 * Returns true if the values are structurally identical.
 */
export const deepEqual = (a, b) => {
  if (a === b) return true;

  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') {
    return a === b;
  }

  // Handle Date instances
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(b)) return false;

  // Handle Objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i += 1) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};

/**
 * Compares oldData and newData using deep comparison.
 *
 * @param {any} oldData - Existing cached or state data
 * @param {any} newData - Fresh API response or updated data
 * @returns {boolean} True if data has changed, false if identical
 */
export const isDataChanged = (oldData, newData) => {
  return !deepEqual(oldData, newData);
};

/**
 * Generates a unique, deterministic cache key based on the API endpoint and parameters.
 * Sorts query parameters, date ranges, and filters alphabetically so object key order doesn't alter the cache key.
 *
 * @param {string} endpoint - API endpoint or identifier
 * @param {Object} [params={}] - Parameters, filters, query parameters, date ranges
 * @returns {string} Unique cache key string
 */
export const generateCacheKey = (endpoint, params = {}) => {
  if (!endpoint) return `${CACHE_PREFIX}unknown`;

  const cleanParams = {};
  if (params && typeof params === 'object') {
    Object.keys(params)
      .sort()
      .forEach((key) => {
        const val = params[key];
        if (val !== undefined && val !== null) {
          cleanParams[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
        }
      });
  }

  const queryString = new URLSearchParams(cleanParams).toString();
  const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;

  return `${CACHE_PREFIX}${fullPath}`;
};

/**
 * Retrieves cached data from LocalStorage for a given cache key.
 * Automatically recovers from corrupted JSON entries by clearing the broken key and returning null.
 *
 * @param {string} key - Cache key
 * @returns {any|null} Cached data object or null if missing/corrupted
 */
export const getCache = (key) => {
  if (!key) return null;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    // Unpackage metadata wrapper if present
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
      return parsed.data;
    }
    return parsed;
  } catch (error) {
    console.warn(`[Cache Warning] Corrupted cache for key "${key}". Clearing key.`, error);
    clearCache(key);
    return null;
  }
};

/**
 * Convenience helper to get cached API response directly from endpoint and params.
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} [params={}] - Query parameters
 * @returns {any|null} Cached data or null
 */
export const getCachedApiResponse = (endpoint, params = {}) => {
  const key = generateCacheKey(endpoint, params);
  return getCache(key);
};

/**
 * Prunes the oldest 50% of dashboard cache entries when LocalStorage quota is exceeded.
 */
const pruneOldCache = () => {
  try {
    const entries = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(k));
          entries.push({ key: k, timestamp: item?.timestamp || 0 });
        } catch {
          entries.push({ key: k, timestamp: 0 });
        }
      }
    }
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemoveCount = Math.ceil(entries.length / 2);
    for (let i = 0; i < toRemoveCount; i += 1) {
      if (entries[i]) {
        localStorage.removeItem(entries[i].key);
      }
    }
  } catch (error) {
    console.warn('[Cache Warning] Failed to prune old cache entries', error);
  }
};

/**
 * Saves data to LocalStorage under the specified cache key.
 * Includes timestamp metadata and handles QuotaExceededError via cache pruning.
 *
 * @param {string} key - Cache key
 * @param {any} data - Data payload to cache
 * @returns {boolean} True if successfully stored, false otherwise
 */
export const setCache = (key, data) => {
  if (!key || data === undefined) return false;
  try {
    const wrapper = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(wrapper));
    return true;
  } catch (error) {
    console.error(`[Cache Error] Failed to set cache for key "${key}".`, error);
    // Handle QuotaExceededError
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      pruneOldCache();
      try {
        const wrapper = { data, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(wrapper));
        return true;
      } catch (retryError) {
        console.error('[Cache Error] Retry setCache failed after pruning.', retryError);
      }
    }
    return false;
  }
};

/**
 * Clears a specific cache entry by key, or all dashboard cache entries if key is omitted or "*".
 *
 * @param {string} [key] - Cache key to remove or "*" for all dashboard entries
 */
export const clearCache = (key) => {
  try {
    if (!key || key === '*') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[Cache Warning] Failed to clear cache for key "${key}".`, error);
  }
};

/**
 * Map tracking in-flight API request promises to deduplicate duplicate parallel requests.
 */
const inFlightRequestsMap = new Map();

/**
 * Executes an API fetch request wrapped with LocalStorage caching and deduplication.
 *
 * Workflow:
 * 1. Generate unique cache key based on endpoint and params.
 * 2. Check for cached data. If found and onCacheHit callback provided, invoke immediately.
 * 3. Deduplicate in-flight requests for identical keys.
 * 4. Execute fetcherFn background request.
 * 5. Deep compare fresh response with cached data via isDataChanged.
 * 6. Update LocalStorage ONLY if fresh data differs from cached data.
 * 7. Invoke onDataChanged callback if data has changed.
 * 8. Return fresh data or cached data as fallback on network error.
 *
 * @param {string} endpoint - API endpoint URL / path
 * @param {Object} [params={}] - Query parameters, filters, date range
 * @param {Function} fetcherFn - Async function performing network call
 * @param {Object} [options={}] - Options: { onCacheHit, onDataChanged, forceRefresh }
 * @returns {Promise<any>} Response data
 */
export const executeCachedApi = async (endpoint, params = {}, fetcherFn, options = {}) => {
  const cacheKey = generateCacheKey(endpoint, params);
  const cachedData = getCache(cacheKey);

  // 1. Immediately invoke onCacheHit callback if cache exists
  if (cachedData !== null && typeof options.onCacheHit === 'function') {
    try {
      options.onCacheHit(cachedData);
    } catch (err) {
      console.warn(`[Cache Callback Warning] onCacheHit threw error for key "${cacheKey}":`, err);
    }
  }

  // 2. Deduplicate duplicate in-flight requests for the exact same endpoint + params
  if (inFlightRequestsMap.has(cacheKey)) {
    try {
      return await inFlightRequestsMap.get(cacheKey);
    } catch (inFlightErr) {
      if (cachedData !== null) return cachedData;
      throw inFlightErr;
    }
  }

  // 3. Create network promise
  const fetchPromise = (async () => {
    try {
      const freshData = await fetcherFn();

      if (freshData !== undefined && freshData !== null) {
        if (cachedData === null) {
          // First fetch for this key: set cache
          setCache(cacheKey, freshData);
          if (typeof options.onDataChanged === 'function') {
            options.onDataChanged(freshData);
          }
        } else if (isDataChanged(cachedData, freshData)) {
          // Fresh response differs: overwrite local storage & notify caller
          setCache(cacheKey, freshData);
          if (typeof options.onDataChanged === 'function') {
            options.onDataChanged(freshData);
          }
        } else {
          // Response is identical: DO NOT overwrite local storage
        }
      }

      return freshData;
    } catch (error) {
      console.warn(`[API Network Error] Fetch for "${cacheKey}" failed. Using cached fallback if present.`, error);
      if (cachedData !== null) {
        return cachedData;
      }
      throw error;
    } finally {
      inFlightRequestsMap.delete(cacheKey);
    }
  })();

  inFlightRequestsMap.set(cacheKey, fetchPromise);
  return fetchPromise;
};
