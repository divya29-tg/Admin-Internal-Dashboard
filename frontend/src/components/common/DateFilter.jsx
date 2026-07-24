import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import { FILTER_TYPES } from '../../constants/dashboard.constants.js';

const DateFilter = ({ filterType, setFilterType }) => {
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
      <ToggleButtonGroup
        value={filterType}
        exclusive
        onChange={handleFilterChange}
        size="small"
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 2.5,
          p: 0.5,
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.75,
            color: '#94a3b8',
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': {
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            },
          },
        }}
      >
        <ToggleButton value={FILTER_TYPES.YESTERDAY}>Yesterday</ToggleButton>
        <ToggleButton value={FILTER_TYPES.LAST_7_DAYS}>Last 7 Days</ToggleButton>
        <ToggleButton value={FILTER_TYPES.LAST_30_DAYS}>Last 30 Days</ToggleButton>
        <ToggleButton value={FILTER_TYPES.LAST_90_DAYS}>Last 90 Days</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default DateFilter;
