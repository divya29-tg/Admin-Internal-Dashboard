import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Grid, LinearProgress, Chip } from '@mui/material';
import { Public as PublicIcon, Android as PhoneAndroidIcon, Apple as AppleIcon } from '@mui/icons-material';

const COUNTRY_NAMES = {
  IN: 'India',
  US: 'United States',
  AR: 'Argentina',
  NG: 'Nigeria',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  BR: 'Brazil',
  Unknown: 'Unclassified / Other',
};

const CountryList = ({ byCountry = {}, color = '#3b82f6' }) => {
  const { sortedEntries, total } = useMemo(() => {
    const entries = Object.entries(byCountry);
    const sum = entries.reduce((acc, [, val]) => acc + (val || 0), 0);
    entries.sort((a, b) => b[1] - a[1]);
    return { sortedEntries: entries, total: sum };
  }, [byCountry]);

  if (sortedEntries.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: '#64748b', py: 2, textAlign: 'center' }}>
        No country breakdown data available
      </Typography>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1.5}
      mt={1}
      sx={{
        maxHeight: 280,
        overflowY: 'auto',
        pr: 1,
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.4)',
        },
      }}
    >
      {sortedEntries.map(([code, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const countryLabel = COUNTRY_NAMES[code] || code;

        return (
          <Box key={code}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={code}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                  }}
                />
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                  {countryLabel}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                {count.toLocaleString()} ({pct}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const GeographicBreakdown = ({ combinedMonthly, androidMonthly, iosMonthly, isLoading }) => {
  const combinedCountries = combinedMonthly?.byCountry || {};
  const androidCountries = androidMonthly?.byCountry || {};
  const iosCountries = iosMonthly?.byCountry || {};

  return (
    <Box mb={4}>
      <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PublicIcon sx={{ color: '#3b82f6' }} /> Geographic Distribution (By Country)
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
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
                  Combined Downloads
                </Typography>
                <PublicIcon sx={{ color: '#3b82f6' }} />
              </Box>
              <CountryList byCountry={combinedCountries} color="#3b82f6" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
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
                  Android Downloads
                </Typography>
                <PhoneAndroidIcon sx={{ color: '#818cf8' }} />
              </Box>
              <CountryList byCountry={androidCountries} color="#818cf8" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
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
                  iOS Downloads
                </Typography>
                <AppleIcon sx={{ color: '#f43f5e' }} />
              </Box>
              <CountryList byCountry={iosCountries} color="#f43f5e" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeographicBreakdown;
