import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const AnalyticsChart = ({ title, data = [], type, color = '#3b82f6', loading }) => {
  if (loading) {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          p: 1,
        }}
      >
        <CardContent>
          <Skeleton variant="text" width="35%" height={32} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const isBar = type === 'mau';
  const xAxisKey = type === 'dau' ? 'date' : type === 'wau' ? 'week' : 'month';

  // Format date strings for chart labels
  const formatXAxis = (value) => {
    if (!value) return '';
    if (type === 'dau') {
      // Shorten YYYY-MM-DD to MM-DD
      const parts = value.split('-');
      return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
    }
    return value;
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        p: 1,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600, mb: 3 }}>
          {title}
        </Typography>

        <Box height={300} width="100%">
          {data.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                No trend data available for this range
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {isBar ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorGrad-${type}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatXAxis}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#colorGrad-${type})`}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
