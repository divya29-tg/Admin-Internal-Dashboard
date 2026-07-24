import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Skeleton } from '@mui/material';

const KPICard = ({ title, value, subtitle, icon, color = '#3b82f6', androidVal, iosVal, loading }) => {
  const [animate, setAnimate] = useState(false);

  // Trigger pop animation on value change
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [value, androidVal, iosVal]);



  const { hasSegregation, androidPct, iosPct } = useMemo(() => {
    const hasSeg = androidVal !== undefined && iosVal !== undefined;
    const totalSeg = (androidVal || 0) + (iosVal || 0);
    const aPct = totalSeg > 0 ? Math.round((androidVal / totalSeg) * 100) : 0;
    const iPct = totalSeg > 0 ? Math.round((iosVal / totalSeg) * 100) : 0;
    return { hasSegregation: hasSeg, androidPct: aPct, iosPct: iPct };
  }, [androidVal, iosVal]);

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          border: `1px solid ${color}44`,
          boxShadow: `0 12px 40px 0 ${color}15`,
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 3,
          '&:last-child': { pb: 3 },
        }}
      >
        <Box flexGrow={1} display="flex" flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {title}
            </Typography>
            <Box
              sx={{
                backgroundColor: `${color}15`,
                color: color,
                p: 1,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Box>

          <Typography
            variant="h3"
            className={animate ? 'counter-update' : ''}
            sx={{
              color: '#f8fafc',
              fontWeight: 700,
              mb: 1,
              display: 'inline-block',
            }}
          >
            {Number(value).toLocaleString()}
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: hasSegregation ? 2 : 0 }}>
            {subtitle}
          </Typography>
        </Box>

        {hasSegregation && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600 }}>
                Android: {androidVal.toLocaleString()} ({androidPct}%)
              </Typography>
              <Typography variant="caption" sx={{ color: '#f43f5e', fontWeight: 600 }}>
                iOS: {iosVal.toLocaleString()} ({iosPct}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={androidPct}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#f43f5e',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#818cf8',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
