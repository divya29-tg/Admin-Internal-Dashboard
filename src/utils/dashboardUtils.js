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

export const getExactDateRangeForFilter = (filterType) => {
  const now = new Date();
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (filterType === 'yesterday') {
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayStr = formatDate(y);
    return { from: yesterdayStr, to: yesterdayStr };
  }

  const to = formatDate(now);
  let daysBack = 30;
  if (filterType === '7d') daysBack = 7;
  else if (filterType === '30d') daysBack = 30;
  else if (filterType === '90d') daysBack = 90;

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysBack - 1));
  const from = formatDate(startDate);

  return { from, to };
};

export const filterByDateMap = (byDateObj = {}, fromDate, toDate) => {
  const filteredByDate = {};
  let total = 0;

  Object.entries(byDateObj).forEach(([dateStr, count]) => {
    if (dateStr >= fromDate && dateStr <= toDate) {
      filteredByDate[dateStr] = count || 0;
      total += count || 0;
    }
  });

  return { total, filteredByDate };
};

export const getMonthsBetweenDates = (fromDateStr, toDateStr) => {
  const months = [];
  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endLimit) {
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

export const formatActiveUsersSubtitle = (asOf) =>
  asOf ? `As of ${new Date(asOf).toLocaleString()}` : 'Total Users Registered';

// The base /active-users endpoint's totalUsers can lag; the history
// endpoint's most recent daily snapshot is the more current source.
export const getLatestTotalUsers = (activeUsersHistory) => activeUsersHistory?.daily?.[0]?.totalUsers ?? null;

