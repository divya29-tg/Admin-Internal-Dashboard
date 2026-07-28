import axios from 'axios';
import { buildDateRangeParams } from '../utils/dashboardUtils.js';
import { executeCachedApi } from '../utils/cacheService.js';
import { ACTIVE_USERS_ENDPOINT, DL_TRACKER_BASE_URL, TOTAL_DIDS_ENDPOINT } from '../config/apiConfig.js';

const API_TIMEOUT_MS = 25000;

// All-time "ground truth" download totals (not scoped to any date filter).
export const fetchCombinedTotals = async (options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/combined/stats/total`;
  return executeCachedApi(
    endpoint,
    {},
    async () => {
      const response = await axios.get(endpoint, { timeout: API_TIMEOUT_MS });

      return {
        total: response.data.totalDownloads ?? 0,
        android: response.data.androidDownloads ?? 0,
        ios: response.data.iosDownloads ?? 0,
        meta: response.data._meta || {},
        raw: response.data,
      };
    },
    options
  ).catch((error) => {
    console.warn('[Combined Totals API Warning]', error?.message || error);
    return { total: 0, android: 0, ios: 0, meta: {}, raw: {} };
  });
};

// Combined downloads for a single calendar month (YYYY-MM).
export const fetchCombinedMonthlyDownloads = async (month, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/combined/downloads`;
  const params = { month };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return {
        total: response.data.combinedTotal ?? response.data.totalDownloads ?? response.data.total ?? 0,
        android: response.data.androidTotal ?? response.data.androidDownloads ?? response.data.android ?? 0,
        ios: response.data.iosTotal ?? response.data.iosDownloads ?? response.data.ios ?? 0,
        period: response.data.period || month,
        byCountry: response.data.byCountry || {},
        androidDetails: response.data.android || {},
        iosDetails: response.data.ios || {},
        raw: response.data,
      };
    },
    options
  ).catch((error) => {
    console.warn('[Combined Monthly API Warning]', error?.message || error);
    throw error;
  });
};

// Combined downloads for a month range (from=YYYY-MM&to=YYYY-MM).
export const fetchCombinedDownloadsRange = async (from, to, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/combined/downloads/range`;
  const params = { from, to };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      const data = response.data || {};

      if (data.error) {
        throw new Error(data.error);
      }

      const androidData = data.android || {};
      const iosData = data.ios || {};

      // Aggregate Android byCountry across all months in range
      const androidByCountry = {};
      (androidData.months || []).forEach((m) => {
        Object.entries(m.byCountry || {}).forEach(([country, count]) => {
          androidByCountry[country] = (androidByCountry[country] || 0) + (count || 0);
        });
      });

      // Aggregate iOS byCountry across all days in range
      const iosByCountry = {};
      (iosData.days || []).forEach((d) => {
        Object.entries(d.byCountry || {}).forEach(([country, count]) => {
          iosByCountry[country] = (iosByCountry[country] || 0) + (count || 0);
        });
      });

      // Combined byCountry
      const byCountry = { ...androidByCountry };
      Object.entries(iosByCountry).forEach(([country, count]) => {
        byCountry[country] = (byCountry[country] || 0) + (count || 0);
      });

      const androidTotal = data.androidTotal ?? androidData.grandTotal ?? 0;
      const iosTotal = data.iosTotal ?? iosData.grandTotal ?? 0;
      const combinedTotal = data.combinedTotal ?? (androidTotal + iosTotal);

      return {
        total: combinedTotal,
        android: androidTotal,
        ios: iosTotal,
        period: data.period || `${from} to ${to}`,
        byCountry,
        androidDetails: {
          total: androidTotal,
          byCountry: androidByCountry,
          months: androidData.months || [],
          package: androidData.package,
        },
        iosDetails: {
          total: iosTotal,
          byCountry: iosByCountry,
          days: iosData.days || [],
          from: iosData.from,
          to: iosData.to,
        },
        raw: data,
      };
    },
    options
  ).catch((error) => {
    console.warn('[Combined Range API Warning]', error?.message || error);
    throw error;
  });
};

// iOS specific endpoints
export const fetchIosDownloadsDaily = async (date, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/ios/downloads/daily`;
  const params = { date };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[iOS Daily API Warning]', error?.message || error);
    return { total: 0, byCountry: {}, byDate: {}, byApp: {} };
  });
};

export const fetchIosDownloadsMonthly = async (month, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/ios/downloads/monthly`;
  const params = { month };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[iOS Monthly API Warning]', error?.message || error);
    return { total: 0, byCountry: {}, byDate: {}, byApp: {} };
  });
};

export const fetchIosDownloadsRange = async (from, to, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/ios/downloads/range`;
  const params = { from, to };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[iOS Range API Warning]', error?.message || error);
    return { grandTotal: 0, days: [] };
  });
};

// Android specific endpoints
export const fetchAndroidDownloadsMonthly = async (month, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/android/downloads`;
  const params = { month };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[Android Monthly API Warning]', error?.message || error);
    return { total: 0, byCountry: {}, byDate: {} };
  });
};

export const fetchAndroidDownloadsRange = async (from, to, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/android/downloads/range`;
  const params = { from, to };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[Android Range API Warning]', error?.message || error);
    return { grandTotal: 0, months: [] };
  });
};

export const fetchAndroidRatings = async (month, options = {}) => {
  const endpoint = `${DL_TRACKER_BASE_URL}/android/ratings`;
  const params = { month };
  return executeCachedApi(
    endpoint,
    params,
    async () => {
      const response = await axios.get(endpoint, { params, timeout: API_TIMEOUT_MS });
      return response.data;
    },
    options
  ).catch((error) => {
    console.warn('[Android Ratings API Warning]', error?.message || error);
    return { overallAvg: 0, totalRatings: 0, byCountry: {} };
  });
};

export const fetchActiveUsers = async (options = {}) => {
  const endpoint = ACTIVE_USERS_ENDPOINT;
  return executeCachedApi(
    endpoint,
    {},
    async () => {
      const response = await axios.get(endpoint, { timeout: API_TIMEOUT_MS });

      if (!response.data?.success) {
        return { dau: 0, wau: 0, mau: 0, totalUsers: 0, dauRate: '0%', wauRate: '0%', asOf: null };
      }

      return response.data.data;
    },
    options
  ).catch((error) => {
    console.warn('[Active Users API Warning]', error?.message || error);
    return { dau: 0, wau: 0, mau: 0, totalUsers: 0, dauRate: '0%', wauRate: '0%', asOf: null };
  });
};

// Daily snapshots of rolling active-user counts. `range` selects which
// rolling window each snapshot represents: 'daily' (DAU), 'weekly' (WAU), or
// 'monthly' (MAU).
export const fetchActiveUsersHistory = async (range, params = {}, options = {}) => {
  const endpoint = `${ACTIVE_USERS_ENDPOINT}/history`;
  const queryParams = { range, ...params };
  return executeCachedApi(
    endpoint,
    queryParams,
    async () => {
      const response = await axios.get(endpoint, {
        params: queryParams,
        timeout: API_TIMEOUT_MS,
      });

      if (!response.data?.success) {
        return [];
      }

      return response.data.data;
    },
    options
  ).catch((error) => {
    console.warn('[Active Users History API Warning]', error?.message || error);
    return [];
  });
};

export const fetchTotalDids = async (options = {}) => {
  const endpoint = TOTAL_DIDS_ENDPOINT;
  return executeCachedApi(
    endpoint,
    {},
    async () => {
      const response = await axios.get(endpoint, { timeout: API_TIMEOUT_MS });
      return response.data?.txCount ?? 0;
    },
    options
  ).catch((error) => {
    console.warn('[Total DIDs API Warning]', error?.message || error);
    return 0;
  });
};
