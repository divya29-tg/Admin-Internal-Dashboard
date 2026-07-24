import { Box, Container, Typography, LinearProgress } from '@mui/material';
import DashboardHeader from '@/components/layout/DashboardHeader.jsx';
import DashboardMetricsGrid from '@/components/dashboard/DashboardMetricsGrid.jsx';
import GeographicBreakdown from '@/components/dashboard/GeographicBreakdown.jsx';
import PlatformBreakdown from '@/components/dashboard/PlatformBreakdown.jsx';
import DateFilter from '@/components/common/DateFilter.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useDashboardData } from '@/hooks/useDashboardData.js';

const DashboardPage = () => {
  const { token, user, logout } = useAuth();
  const {
    totalDownloads,
    monthlyDownloads,
    totalDids,
    activeUsers,
    iosMonthly,
    androidMonthly,
    androidRatings,
    filterType,
    setFilterType,
    isLoading,
    isFilterLoading,
    isRefreshing,
  } = useDashboardData(token);

  const isSyncing = isLoading || isFilterLoading || isRefreshing;

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ position: 'relative' }}>
      {isSyncing && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 3,
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#3b82f6',
            },
          }}
        />
      )}

      <DashboardHeader user={user} onLogout={logout} />

      <Box flexGrow={1} py={4} sx={{ backgroundColor: '#0b0f19' }}>
        <Container maxWidth="xl">
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
            mb={4}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
                Overview of device signups, installation stats, and user sessions.
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center" width={{ xs: '100%', md: 'auto' }}>
              <DateFilter filterType={filterType} setFilterType={setFilterType} />
            </Box>
          </Box>

          <DashboardMetricsGrid
            totalDownloads={totalDownloads}
            monthlyDownloads={monthlyDownloads}
            totalDids={totalDids}
            activeUsers={activeUsers}
            isLoading={isLoading}
          />

          <GeographicBreakdown
            combinedMonthly={monthlyDownloads}
            androidMonthly={androidMonthly}
            iosMonthly={iosMonthly}
            isLoading={isLoading}
          />

          <PlatformBreakdown
            totalDownloadsMeta={totalDownloads.meta}
            iosMonthly={iosMonthly}
            androidRatings={androidRatings}
            isLoading={isLoading}
          />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
