import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Skeleton,
} from '@mui/material';
import { TableView as TableViewIcon } from '@mui/icons-material';

const HistoricalBreakdownTable = ({ androidMonthly, iosRange, totalDownloadsMeta, isLoading }) => {
  const [activeTab, setActiveTab] = useState(0);



  // Tab 0: Android Daily Breakdown
  const androidByDate = androidMonthly?.byDate || {};
  const androidDailyRows = Object.entries(androidByDate).sort((a, b) => b[0].localeCompare(a[0]));

  // Tab 1: iOS Range Days Breakdown
  const iosDays = iosRange?.days || [];

  // Tab 2: iOS Ground Truth Monthly History
  const iosMonthlyHistory = totalDownloadsMeta?.iosBreakdown?.monthly || [];

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        mb: 4,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableViewIcon sx={{ color: '#3b82f6' }} /> Historical Download Activity Logs
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                color: '#94a3b8',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 0.5,
                minHeight: 36,
              },
              '& .Mui-selected': {
                color: '#3b82f6 !important',
              },
            }}
          >
            <Tab label="Android Daily Logs" />
            <Tab label="iOS Range Daily Logs" />
            <Tab label="iOS Ground Truth Monthly" />
          </Tabs>
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none', maxHeight: 380 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' } }}>
                {activeTab === 0 && (
                  <>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Android Downloads</TableCell>
                    <TableCell align="center">Package</TableCell>
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">iOS Downloads</TableCell>
                    <TableCell>Countries</TableCell>
                    <TableCell>App Bundles</TableCell>
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">iOS Downloads</TableCell>
                    <TableCell align="center">Found Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Tab 0: Android Daily Logs */}
              {activeTab === 0 && (
                androidDailyRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: '#64748b', py: 3 }}>
                      No Android daily log records found
                    </TableCell>
                  </TableRow>
                ) : (
                  androidDailyRows.map(([dateStr, count]) => (
                    <TableRow key={dateStr} sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#e2e8f0' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{dateStr}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#818cf8' }}>
                        {count.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={androidMonthly?.package || 'com.trustgrid.journeys'} size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}

              {/* Tab 1: iOS Range Daily Logs */}
              {activeTab === 1 && (
                iosDays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#64748b', py: 3 }}>
                      No iOS range daily log records found
                    </TableCell>
                  </TableRow>
                ) : (
                  iosDays.map((day) => {
                    const countryList = Object.entries(day.byCountry || {}).map(([c, count]) => `${c}: ${count}`).join(', ');
                    const appList = Object.entries(day.byApp || {}).map(([app, count]) => `${app}: ${count}`).join(', ');

                    return (
                      <TableRow key={day.date} sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#e2e8f0' } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{day.date}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={day.found !== false ? 'Found' : 'Not Found'}
                            size="small"
                            sx={{
                              backgroundColor: day.found !== false ? '#10b98122' : 'rgba(255, 255, 255, 0.05)',
                              color: day.found !== false ? '#10b981' : '#64748b',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#f43f5e' }}>
                          {(day.total || 0).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{countryList || '-'}</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>{appList || '-'}</TableCell>
                      </TableRow>
                    );
                  })
                )
              )}

              {/* Tab 2: iOS Ground Truth Monthly */}
              {activeTab === 2 && (
                iosMonthlyHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: '#64748b', py: 3 }}>
                      No iOS monthly ground truth records found
                    </TableCell>
                  </TableRow>
                ) : (
                  iosMonthlyHistory.map((m) => (
                    <TableRow key={m.month} sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#e2e8f0' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{m.month}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>
                        {(m.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={m.found ? 'Verified' : 'Unverified'}
                          size="small"
                          sx={{
                            backgroundColor: m.found ? '#10b98122' : 'rgba(255, 255, 255, 0.05)',
                            color: m.found ? '#10b981' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default HistoricalBreakdownTable;
