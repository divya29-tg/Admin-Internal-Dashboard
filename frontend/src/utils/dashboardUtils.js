export const buildDateRangeParams = (filterType) => ({ filterType });

export const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getIosDateRangeForFilter = (filterType) => {
  const now = new Date();
  const to = getTodayDate();
  let daysBack = 30;

  if (filterType === 'yesterday') daysBack = 1;
  else if (filterType === '7d') daysBack = 7;
  else if (filterType === '30d') daysBack = 30;
  else if (filterType === '90d') daysBack = 90;

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack);
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');
  const from = `${year}-${month}-${day}`;

  return { from, to };
};

export const getMonthRangeForFilter = (filterType) => {
  const now = new Date();
  const to = getCurrentMonth();

  if (filterType === '90d') {
    // 3 calendar months: 2 months back to current month (e.g. 05, 06, 07 for month 7)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const from = `${year}-${month}`;
    return { from, to };
  }

  if (filterType === '30d') {
    // Current month for 30d default (e.g. 2026-07)
    return { from: to, to };
  }

  if (filterType === '7d' || filterType === 'yesterday') {
    return { from: to, to };
  }

  return { from: to, to };
};

export const formatActiveUsersSubtitle = (asOf) =>
  asOf ? `As of ${new Date(asOf).toLocaleString()}` : 'Total Users Registered';

// The base /active-users endpoint's totalUsers can lag; the history
// endpoint's most recent daily snapshot is the more current source.
export const getLatestTotalUsers = (activeUsersHistory) => activeUsersHistory?.daily?.[0]?.totalUsers ?? null;
