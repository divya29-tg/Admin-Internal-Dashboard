import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Rating, Skeleton } from '@mui/material';
import { Apps as AppsIcon, Star as StarIcon, Verified as VerifiedIcon } from '@mui/icons-material';

const PlatformBreakdown = ({ totalDownloadsMeta, iosMonthly, androidRatings, isLoading }) => {


  const byApp = iosMonthly?.byApp || {};
  const appEntries = Object.entries(byApp);

  const iosBreakdown = totalDownloadsMeta?.iosBreakdown || {};
  const yearlyList = iosBreakdown.yearly || [];

  const ratingAvg = androidRatings?.overallAvg || 0;
  const ratingTotal = androidRatings?.totalRatings || 0;

  // Hidden in UI per user request, code retained
  const HIDE_IN_UI = true;
  if (HIDE_IN_UI) return null;

  return (
    <Box mb={4}>
      <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AppsIcon sx={{ color: '#10b981' }} /> Ratings & Ground Truth
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Android Store Ratings */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card
            sx={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                  Android Ratings
                </Typography>
                <StarIcon sx={{ color: '#f59e0b' }} />
              </Box>

              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} py={2}>
                <Typography variant="h2" sx={{ color: '#f8fafc', fontWeight: 800, mb: 1 }}>
                  {ratingAvg.toFixed(1)}
                </Typography>
                <Rating value={ratingAvg} precision={0.1} readOnly sx={{ mb: 1.5, color: '#f59e0b' }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Based on {ratingTotal.toLocaleString()} registered ratings
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ground Truth Historical Breakdown */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card
            sx={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                  iOS Ground Truth Meta
                </Typography>
                <VerifiedIcon sx={{ color: '#10b981' }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Yearly Total:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                    {(iosBreakdown.yearlyTotal || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Monthly Total:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                    {(iosBreakdown.monthlyTotal || 0).toLocaleString()}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mt: 1, textTransform: 'uppercase' }}>
                  Yearly Distribution
                </Typography>

                {yearlyList.map((y) => (
                  <Box key={y.year} display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                      Year {y.year}
                    </Typography>
                    <Chip label={`${y.total} dl`} size="small" sx={{ backgroundColor: '#10b98122', color: '#10b981', fontWeight: 700 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformBreakdown;
