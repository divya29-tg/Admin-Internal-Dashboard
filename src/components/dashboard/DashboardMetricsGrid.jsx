import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  People as UsersIcon,
  TrendingUp as TrendUpIcon,
  AccessTime as ClockIcon,
  Fingerprint as DidIcon,
  CheckCircle as ActiveCheckIcon,
  ChevronLeft as LeftArrowIcon,
  ChevronRight as RightArrowIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from 'recharts';
import KPICard from '../common/KPICard.jsx';
import { formatActiveUsersSubtitle, getCurrentMonth, getTodayDate } from '../../utils/dashboardUtils.js';

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (mIdx >= 0 && mIdx < 12) {
        return `${monthNames[mIdx]} ${day}`;
      }
    }
  } catch (err) {
    console.warn('formatDateLabel error:', err);
  }
  return dateStr;
};

const formatFullDateLabel = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (mIdx >= 0 && mIdx < 12) {
        return `${monthNames[mIdx]} ${day}, ${year}`;
      }
    }
  } catch (err) {
    console.warn('formatFullDateLabel error:', err);
  }
  return dateStr;
};

const formatMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  try {
    const parts = monthStr.split('-');
    if (parts.length >= 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return monthNames[mIdx];
      }
    }
  } catch (err) {
    console.warn('formatMonthLabel error:', err);
  }
  return monthStr;
};

const formatFullMonthYearLabel = (monthStr) => {
  if (!monthStr) return '';
  try {
    const parts = monthStr.split('-');
    if (parts.length >= 2) {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return `${monthNames[mIdx]} ${parts[0]}`;
      }
    }
  } catch (err) {
    console.warn('formatFullMonthYearLabel error:', err);
  }
  return monthStr;
};

const isMonday = (dateStr) => {
  if (!dateStr) return false;
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      return d.getUTCDay() === 1;
    }
  } catch (err) {
    console.warn('isMonday error:', err);
  }
  return false;
};

const getMondaysInMonth = (monthStr, maxDateStr) => {
  if (!monthStr) return [];
  const parts = monthStr.split('-');
  if (parts.length < 2) return [];

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return [];

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mondays = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCDay() === 1) {
      const dStr = d.toISOString().split('T')[0];
      if (!maxDateStr || dStr <= maxDateStr) {
        mondays.push(dStr);
      }
    }
  }

  return mondays;
};

const getItemDateStr = (item) => {
  if (!item) return '';
  const rawDate = item.date || item.snapshotDate || item.asOf || item.createdAt || item.timestamp || item.time || '';
  return typeof rawDate === 'string' ? rawDate.split('T')[0] : (rawDate ? String(rawDate) : '');
};

const matchesSnapshotDate = (item, targetDateStr) => {
  if (!item || !targetDateStr) return false;
  return getItemDateStr(item) === targetDateStr;
};

const extractSnapshotCount = (item, primaryKey) => {
  if (!item) return 0;
  if (primaryKey && item[primaryKey] !== undefined && item[primaryKey] !== null) {
    return item[primaryKey];
  }
  return item.activeUsers ?? item.count ?? item.activeCount ?? item.total ?? item.value ?? 0;
};

const CustomChartTooltip = ({ active, payload, activeConfig }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const color = activeConfig?.color || '#3b82f6';
    const title = activeConfig?.title || 'Active Users';
    const dateLabel = dataPoint.fullDateLabel || dataPoint.displayDate || dataPoint.date;

    return (
      <Box
        sx={{
          backgroundColor: '#0f172a',
          border: `1px solid ${color}66`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>
          {dateLabel}
        </Typography>
        <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
          {title}:{' '}
          <span style={{ color }}>
            {Number(payload[0].value).toLocaleString()}
          </span>
        </Typography>
        {dataPoint.totalUsers && (
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
            Total Registered Users: {Number(dataPoint.totalUsers).toLocaleString()}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

const DashboardMetricsGrid = ({
  totalDownloads,
  monthlyDownloads,
  totalDids,
  activeUsers,
  activeUsersHistory,
  isLoading,
}) => {
  const [selectedMetric, setSelectedMetric] = useState('dau'); // 'dau' | 'wau' | 'mau'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { availableMonths, availableYears } = useMemo(() => {
    const monthsSet = new Set();
    const yearsSet = new Set();

    const curMonth = getCurrentMonth();
    const curYear = String(new Date().getFullYear());

    monthsSet.add(curMonth);
    yearsSet.add(curYear);

    const processItem = (item) => {
      const dStr = getItemDateStr(item);
      if (dStr && dStr.length >= 7) {
        const yr = dStr.slice(0, 4);
        const mn = dStr.slice(0, 7);
        if (mn <= curMonth) monthsSet.add(mn);
        if (yr <= curYear) yearsSet.add(yr);
      }
    };

    (activeUsersHistory?.daily || []).forEach(processItem);
    (activeUsersHistory?.weekly || []).forEach(processItem);
    (activeUsersHistory?.monthly || []).forEach(processItem);

    const monthsArr = Array.from(monthsSet)
      .sort()
      .reverse()
      .map((mn) => ({
        value: mn,
        label: formatFullMonthYearLabel(mn),
      }));

    const yearsArr = Array.from(yearsSet).sort().reverse();

    return { availableMonths: monthsArr, availableYears: yearsArr };
  }, [activeUsersHistory]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0].value);
    }
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableMonths, availableYears, selectedMonth, selectedYear]);

  const metricConfigs = {
    dau: {
      id: 'dau',
      title: 'Daily Active Users',
      shortTitle: 'DAU',
      value: activeUsers.dau,
      subtitle: `Engagement rate: ${activeUsers.dauRate}`,
      color: '#3b82f6',
      icon: <TrendUpIcon />,
    },
    wau: {
      id: 'wau',
      title: 'Weekly Active Users',
      shortTitle: 'WAU',
      value: activeUsers.wau,
      subtitle: `Engagement rate: ${activeUsers.wauRate}`,
      color: '#818cf8',
      icon: <TrendUpIcon />,
    },
    mau: {
      id: 'mau',
      title: 'Monthly Active Users',
      shortTitle: 'MAU',
      value: activeUsers.mau,
      subtitle: activeUsers.mauSubtitle || 'Users active in the last 30 days',
      color: '#10b981',
      icon: <TrendUpIcon />,
    },
  };

  const activeConfig = metricConfigs[selectedMetric] || metricConfigs.dau;

  const chartData = useMemo(() => {
    const todayStr = getTodayDate();
    const curMonthStr = getCurrentMonth();
    const curYearStr = String(new Date().getFullYear());

    if (selectedMetric === 'dau') {
      const targetMonth = selectedMonth || curMonthStr;
      const rawList = activeUsersHistory?.daily || [];
      if (!Array.isArray(rawList) || rawList.length === 0) return [];

      const items = rawList.filter((item) => {
        const dStr = getItemDateStr(item);
        return dStr && dStr.startsWith(targetMonth) && dStr <= todayStr;
      });

      items.sort((a, b) => getItemDateStr(a).localeCompare(getItemDateStr(b)));

      return items.map((item) => {
        const dStr = getItemDateStr(item);
        const val = extractSnapshotCount(item, 'dau');
        return {
          date: dStr,
          displayDate: formatDateLabel(dStr),
          fullDateLabel: formatFullDateLabel(dStr),
          count: Number(val) || 0,
          totalUsers: item.totalUsers,
        };
      });
    }

    if (selectedMetric === 'wau') {
      const targetMonth = selectedMonth || curMonthStr;
      const weeklyList = activeUsersHistory?.weekly || [];
      const dailyList = activeUsersHistory?.daily || [];

      const mondays = getMondaysInMonth(targetMonth, todayStr);
      const result = [];

      mondays.forEach((mondayStr) => {
        let snap = (weeklyList || []).find((item) => matchesSnapshotDate(item, mondayStr));
        if (!snap) {
          snap = (dailyList || []).find((item) => matchesSnapshotDate(item, mondayStr) && isMonday(getItemDateStr(item)));
        }

        if (snap) {
          const val = extractSnapshotCount(snap, 'wau');
          result.push({
            date: mondayStr,
            displayDate: formatDateLabel(mondayStr),
            fullDateLabel: formatFullDateLabel(mondayStr),
            count: Number(val) || 0,
            totalUsers: snap.totalUsers,
          });
        }
      });

      result.sort((a, b) => a.date.localeCompare(b.date));
      return result;
    }

    if (selectedMetric === 'mau') {
      const targetYear = selectedYear || curYearStr;
      const monthlyList = activeUsersHistory?.monthly || [];
      const dailyList = activeUsersHistory?.daily || [];

      const monthMap = new Map();

      (monthlyList || []).forEach((item) => {
        const dStr = getItemDateStr(item);
        if (dStr && dStr.startsWith(targetYear) && dStr.slice(0, 7) <= curMonthStr) {
          const mKey = dStr.slice(0, 7);
          monthMap.set(mKey, item);
        }
      });

      (dailyList || []).forEach((item) => {
        const dStr = getItemDateStr(item);
        if (dStr && dStr.startsWith(targetYear) && dStr.slice(0, 7) <= curMonthStr) {
          const mKey = dStr.slice(0, 7);
          if (!monthMap.has(mKey)) {
            monthMap.set(mKey, item);
          }
        }
      });

      const sortedMonths = Array.from(monthMap.keys()).sort();

      return sortedMonths.map((mKey) => {
        const item = monthMap.get(mKey);
        const val = extractSnapshotCount(item, 'mau');
        return {
          date: mKey,
          displayDate: formatMonthLabel(mKey),
          fullDateLabel: formatFullMonthYearLabel(mKey),
          count: Number(val) || 0,
          totalUsers: item?.totalUsers,
        };
      });
    }

    return [];
  }, [activeUsersHistory, selectedMetric, selectedMonth, selectedYear]);

  // ResizeObserver for viewport width measurement
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(elem);
    setContainerWidth(elem.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Compute minimum required width based on observation count
  const { chartWidth, isOverflowing } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { chartWidth: '100%', isOverflowing: false };
    }

    const minPointSpacing = selectedMetric === 'dau' ? 50 : selectedMetric === 'wau' ? 90 : 70;
    const requiredWidth = chartData.length * minPointSpacing;
    const hasOverflow = containerWidth > 0 && requiredWidth > containerWidth;

    return {
      chartWidth: hasOverflow ? `${requiredWidth}px` : '100%',
      isOverflowing: hasOverflow,
    };
  }, [chartData, containerWidth, selectedMetric]);

  // Scroll button availability check
  const checkScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el || !isOverflowing) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScrollLeft - 2);
  }, [isOverflowing]);

  // Handle scroll events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    return () => el.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition, chartWidth]);

  // Initial scroll position: automatically scroll to rightmost edge (latest dates)
  useEffect(() => {
    const el = containerRef.current;
    if (el && isOverflowing) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth;
          checkScrollPosition();
        }
      });
    }
  }, [selectedMetric, selectedMonth, selectedYear, chartData.length, isOverflowing, checkScrollPosition]);

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Overview KPI Cards */}
      <Grid container spacing={3} mb={4} alignItems="stretch">
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <KPICard
            title="Total Downloads"
            value={totalDownloads.total}
            subtitle="All-time downloads across all app stores"
            icon={<DownloadIcon />}
            color="#3b82f6"
            androidVal={totalDownloads.android}
            iosVal={totalDownloads.ios}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <KPICard
            title="Session Downloads"
            value={monthlyDownloads.total}
            subtitle={monthlyDownloads.period ? `Date Range: ${monthlyDownloads.period}` : 'Selected period'}
            icon={<ClockIcon />}
            color="#f59e0b"
            androidVal={monthlyDownloads.android}
            iosVal={monthlyDownloads.ios}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <KPICard
            title="Total DIDs"
            value={totalDids}
            subtitle="Registered Nym transaction count"
            icon={<DidIcon />}
            color="#ec4899"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <KPICard
            title="Total Users"
            value={activeUsers.totalUsers}
            subtitle={formatActiveUsersSubtitle(activeUsers.asOf)}
            icon={<UsersIcon />}
            color="#10b981"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Section Header for Active Users with Dynamic Period Selector */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={0.5}>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.85rem',
          }}
        >
          Active User Metrics
        </Typography>

        <FormControl size="small">
          <Select
            value={
              selectedMetric === 'mau'
                ? selectedYear || availableYears[0] || ''
                : selectedMonth || availableMonths[0]?.value || ''
            }
            onChange={(e) => {
              const val = e.target.value;
              if (selectedMetric === 'mau') {
                setSelectedYear(val);
              } else {
                setSelectedMonth(val);
              }
            }}
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 2,
              color: '#60a5fa',
              fontWeight: 600,
              fontSize: '0.85rem',
              height: 36,
              '& .MuiSelect-select': {
                py: 0.75,
                px: 1.5,
              },
              '& .MuiSvgIcon-root': {
                color: '#60a5fa',
              },
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.22)',
                borderColor: '#3b82f6',
              },
              '& fieldset': { border: 'none' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  color: '#f8fafc',
                  '& .MuiMenuItem-root': {
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      fontWeight: 700,
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.4)',
                      },
                    },
                  },
                },
              },
            }}
          >
            {selectedMetric === 'mau'
              ? availableYears.map((yr) => (
                  <MenuItem key={yr} value={yr}>
                    {yr}
                  </MenuItem>
                ))
              : availableMonths.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
          </Select>
        </FormControl>
      </Box>

      {/* Two-Column Layout: Left Vertically Stacked Metric Cards, Right Interactive Chart */}
      <Grid container spacing={3} mb={4} alignItems="stretch">
        {/* Left Column: Stacked Metric Cards (~30% width) */}
        <Grid item xs={12} md={4} lg={3}>
          <Box display="flex" flexDirection="column" gap={2} height="100%" justifyContent="space-between">
            {Object.values(metricConfigs).map((cfg) => {
              const isSelected = selectedMetric === cfg.id;

              return (
                <Card
                  key={cfg.id}
                  onClick={() => setSelectedMetric(cfg.id)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: isSelected
                      ? `linear-gradient(135deg, ${cfg.color}1c 0%, rgba(30, 41, 59, 0.7) 100%)`
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: isSelected ? `1.5px solid ${cfg.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 3.5,
                    boxShadow: isSelected
                      ? `0 0 20px ${cfg.color}33, 0 8px 32px 0 rgba(0, 0, 0, 0.3)`
                      : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: isSelected ? cfg.color : 'rgba(255, 255, 255, 0.2)',
                      boxShadow: `0 6px 24px ${cfg.color}22`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, pb: '16px !important' }}>
                    {/* Card Title & Icon */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {cfg.title}
                      </Typography>

                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 2,
                          backgroundColor: isSelected ? `${cfg.color}25` : 'rgba(255, 255, 255, 0.04)',
                          color: cfg.color,
                          border: isSelected ? `1px solid ${cfg.color}55` : '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {isSelected ? <ActiveCheckIcon sx={{ fontSize: 16 }} /> : cfg.icon}
                      </Box>
                    </Box>

                    {/* Value & Subtitle */}
                    {isLoading ? (
                      <>
                        <Skeleton variant="text" width="50%" height={32} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
                      </>
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 800, mb: 0.25, fontSize: '1.75rem' }}>
                          {Number(cfg.value || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isSelected ? '#e2e8f0' : '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                          {cfg.subtitle}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* Right Column: Interactive Chart Beside Cards (~70% width) */}
        <Grid item xs={12} md={8} lg={9} sx={{ display: 'flex' }}>
          <Card
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${activeConfig.color}33`,
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              p: 1,
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: activeConfig.color,
                      boxShadow: `0 0 10px ${activeConfig.color}`,
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                    {activeConfig.title} Trend
                  </Typography>
                </Box>

                {/* Left / Right Scroll Navigation Arrows when chart overflows */}
                {isOverflowing && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MuiTooltip title="View older data">
                      <span>
                        <IconButton
                          onClick={handleScrollLeft}
                          disabled={!canScrollLeft}
                          aria-label="View older data"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f8fafc',
                            p: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.25)',
                              borderColor: '#3b82f6',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.3,
                              color: '#64748b',
                              borderColor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          <LeftArrowIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </MuiTooltip>
                    <MuiTooltip title="View newer data">
                      <span>
                        <IconButton
                          onClick={handleScrollRight}
                          disabled={!canScrollRight}
                          aria-label="View newer data"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f8fafc',
                            p: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.25)',
                              borderColor: '#3b82f6',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.3,
                              color: '#64748b',
                              borderColor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          <RightArrowIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </MuiTooltip>
                  </Box>
                )}
              </Box>

              <Box
                ref={containerRef}
                flexGrow={1}
                minHeight={280}
                width="100%"
                sx={{
                  overflowX: isOverflowing ? 'auto' : 'hidden',
                  position: 'relative',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(59, 130, 246, 0.4) rgba(15, 23, 42, 0.5)',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(59, 130, 246, 0.3)',
                    borderRadius: 3,
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.5)',
                    },
                  },
                }}
              >
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}
                  />
                ) : chartData.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No historical trend data available for {activeConfig.title}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: chartWidth, height: '100%', minHeight: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`activeUsersGrad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                        <XAxis
                          dataKey="displayDate"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                          interval={isOverflowing ? 0 : 'preserveStartEnd'}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<CustomChartTooltip activeConfig={activeConfig} />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={activeConfig.color}
                          strokeWidth={3}
                          dot={{ r: 4, fill: activeConfig.color, stroke: '#0f172a', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: activeConfig.color, stroke: '#ffffff', strokeWidth: 2 }}
                          fillOpacity={1}
                          fill={`url(#activeUsersGrad-${selectedMetric})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardMetricsGrid;
