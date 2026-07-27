import React, { useRef } from 'react';
import { Grid, Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  People as UsersIcon,
  TrendingUp as TrendUpIcon,
  CalendarMonth as MonthIcon,
  Fingerprint as DidIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import KPICard from '../common/KPICard.jsx';
import { formatActiveUsersSubtitle, getTodayDate } from '../../utils/dashboardUtils.js';

const DashboardMetricsGrid = ({
  totalDownloads,
  monthlyDownloads,
  totalDids,
  activeUsers,
  isLoading,
  selectedActiveDate,
  onSelectActiveDate,
}) => {
  const dateInputRef = useRef(null);
  const todayStr = getTodayDate();

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (err) {
        console.warn('dateInput showPicker fallback:', err);
        dateInputRef.current.click();
      }
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (onSelectActiveDate) {
      onSelectActiveDate(val);
    }
  };

  return (
    <>
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
            title="Period Downloads"
            value={monthlyDownloads.total}
            subtitle={monthlyDownloads.period ? `Period: ${monthlyDownloads.period}` : 'Selected period'}
            icon={<MonthIcon />}
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

      {/* Section header for Active Users with functional Date Picker button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={0.5}>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.8rem',
          }}
        >
          Active User Metrics
        </Typography>
        <Tooltip
          title={
            selectedActiveDate
              ? `Active Date: ${selectedActiveDate} (Click to change)`
              : 'Select date for Active User metrics'
          }
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <IconButton
              onClick={handleCalendarClick}
              sx={{
                backgroundColor: selectedActiveDate ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedActiveDate ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                gap: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.25)',
                  borderColor: '#3b82f6',
                },
              }}
            >
              <CalendarIcon sx={{ fontSize: 16, color: selectedActiveDate ? '#3b82f6' : '#94a3b8' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: selectedActiveDate ? '#60a5fa' : '#94a3b8' }}>
                {selectedActiveDate || 'Select Date'}
              </Typography>
            </IconButton>
            <input
              type="date"
              ref={dateInputRef}
              max={todayStr}
              value={selectedActiveDate || ''}
              onChange={handleDateChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: 'none',
                visibility: 'hidden',
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      <Grid container spacing={3} mb={4} alignItems="stretch">
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <KPICard
            title="Daily Active Users"
            value={activeUsers.dau}
            subtitle={`Engagement rate: ${activeUsers.dauRate}`}
            icon={<TrendUpIcon />}
            color="#3b82f6"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <KPICard
            title="Weekly Active Users"
            value={activeUsers.wau}
            subtitle={`Engagement rate: ${activeUsers.wauRate}`}
            icon={<TrendUpIcon />}
            color="#818cf8"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <KPICard
            title="Monthly Active Users"
            value={activeUsers.mau}
            subtitle={activeUsers.mauSubtitle || 'Users active in the last 30 days'}
            icon={<TrendUpIcon />}
            color="#10b981"
            loading={isLoading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardMetricsGrid;
