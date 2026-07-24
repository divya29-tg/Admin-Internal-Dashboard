import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchActiveUsers,
  fetchActiveUsersHistory,
  fetchAndroidRatings,
  fetchCombinedDownloadsRange,
  fetchCombinedMonthlyDownloads,
  fetchCombinedTotals,
  fetchTotalDids,
} from '../api/dashboardApi.js';
import { getCurrentMonth, getLatestTotalUsers, getMonthRangeForFilter } from '../utils/dashboardUtils.js';
import { getPageVisibility, onVisibilityChange } from '../utils/pageVisibility.js';
import { DEFAULT_FILTER_TYPE, POLL_INTERVAL_MS } from '../constants/dashboard.constants.js';

export const useDashboardData = (token) => {
  const [filterType, setFilterType] = useState(DEFAULT_FILTER_TYPE);
  const [totalDownloads, setTotalDownloads] = useState({ total: 0, android: 0, ios: 0 });
  const [monthlyDownloads, setMonthlyDownloads] = useState({ total: 0, android: 0, ios: 0, period: null });
  const [totalDids, setTotalDids] = useState(0);
  const [activeUsersBase, setActiveUsersBase] = useState({
    dau: 0,
    wau: 0,
    mau: 0,
    totalUsers: 0,
    dauRate: '0%',
    wauRate: '0%',
    asOf: null,
  });
  const [activeUsersHistory, setActiveUsersHistory] = useState({ daily: [], weekly: [], monthly: [] });
  const [iosMonthly, setIosMonthly] = useState(null);
  const [androidMonthly, setAndroidMonthly] = useState(null);
  const [androidRatings, setAndroidRatings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(getPageVisibility());
  const prevVisibilityRef = useRef(getPageVisibility());

  // Total users comes from the history endpoint's latest snapshot when
  // available (more current); everything else comes from the base endpoint.
  const activeUsers = useMemo(() => {
    const latestTotalUsers = getLatestTotalUsers(activeUsersHistory);
    return {
      ...activeUsersBase,
      totalUsers: latestTotalUsers ?? activeUsersBase.totalUsers,
    };
  }, [activeUsersBase, activeUsersHistory]);

  const fetchTotalDownloadsStats = useCallback(async () => {
    try {
      setTotalDownloads(await fetchCombinedTotals());
    } catch (error) {
      console.error('[Total Downloads Fetch Error]', error);
    }
  }, []);

  const fetchTotalDidsStats = useCallback(async () => {
    try {
      setTotalDids(await fetchTotalDids());
    } catch (error) {
      console.error('[Total DIDs Fetch Error]', error);
    }
  }, []);

  const fetchMonthlyDownloadsStats = useCallback(async () => {
    try {
      const { from, to } = getMonthRangeForFilter(filterType);
      const targetMonth = getCurrentMonth();

      const [combinedData, androidRatingsRes] = await Promise.allSettled([
        from === to ? fetchCombinedMonthlyDownloads(from) : fetchCombinedDownloadsRange(from, to),
        fetchAndroidRatings(targetMonth),
      ]);

      if (combinedData.status === 'fulfilled') {
        const val = combinedData.value;
        setMonthlyDownloads(val);
        if (val.iosDetails && Object.keys(val.iosDetails).length > 0) {
          setIosMonthly(val.iosDetails);
        }
        if (val.androidDetails && Object.keys(val.androidDetails).length > 0) {
          setAndroidMonthly(val.androidDetails);
        }
      }

      if (androidRatingsRes.status === 'fulfilled') setAndroidRatings(androidRatingsRes.value);
    } catch (error) {
      console.error('[Combined Downloads Fetch Error]', error);
    }
  }, [filterType]);

  const fetchActiveUserStats = useCallback(async () => {
    try {
      setActiveUsersBase(await fetchActiveUsers());
    } catch (error) {
      console.error('[Active Users Fetch Error]', error);
    }
  }, []);

  const fetchActiveUsersHistoryStats = useCallback(async () => {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        fetchActiveUsersHistory('daily'),
        fetchActiveUsersHistory('weekly'),
        fetchActiveUsersHistory('monthly'),
      ]);
      setActiveUsersHistory({ daily, weekly, monthly });
    } catch (error) {
      console.error('[Active Users History Fetch Error]', error);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchTotalDownloadsStats(),
        fetchTotalDidsStats(),
        fetchMonthlyDownloadsStats(),
        fetchActiveUserStats(),
        fetchActiveUsersHistoryStats(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    fetchTotalDownloadsStats,
    fetchTotalDidsStats,
    fetchMonthlyDownloadsStats,
    fetchActiveUserStats,
    fetchActiveUsersHistoryStats,
  ]);

  const hasFetchedInitialRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  // Initial load on mount (guaranteed single execution)
  useEffect(() => {
    if (!token || hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.allSettled([
          fetchTotalDownloadsStats(),
          fetchTotalDidsStats(),
          fetchMonthlyDownloadsStats(),
          fetchActiveUserStats(),
          fetchActiveUsersHistoryStats(),
        ]);
      } catch (error) {
        console.error('[Load Initial Data Error]', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, fetchTotalDownloadsStats, fetchTotalDidsStats, fetchMonthlyDownloadsStats, fetchActiveUserStats, fetchActiveUsersHistoryStats]);

  // Handle filter changes (only re-fetch date-dependent stats when filterType changes)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setIsFilterLoading(true);
    fetchMonthlyDownloadsStats().finally(() => {
      setIsFilterLoading(false);
    });
  }, [filterType, fetchMonthlyDownloadsStats]);

  useEffect(() => {
    const handleVisibility = () => {
      const visible = getPageVisibility();
      setIsPageVisible(visible);

      if (!prevVisibilityRef.current && visible) {
        refreshDashboard();
      }
      prevVisibilityRef.current = visible;
    };

    const removeVisibilityListener = onVisibilityChange(handleVisibility);
    return removeVisibilityListener;
  }, [refreshDashboard]);

  useEffect(() => {
    if (!isPageVisible || !token) return undefined;

    const interval = setInterval(() => {
      fetchTotalDownloadsStats();
      fetchTotalDidsStats();
      fetchMonthlyDownloadsStats();
      fetchActiveUserStats();
      fetchActiveUsersHistoryStats();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchTotalDownloadsStats, fetchTotalDidsStats, fetchMonthlyDownloadsStats, fetchActiveUserStats, fetchActiveUsersHistoryStats, isPageVisible, token]);

  return {
    totalDownloads,
    monthlyDownloads,
    totalDids,
    activeUsers,
    activeUsersHistory,
    iosMonthly,
    androidMonthly,
    androidRatings,
    filterType,
    setFilterType,
    isLoading,
    isFilterLoading,
    isRefreshing,
    refreshDashboard,
  };
};
