export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://synq-backend.trustgrid.com'
).replace(/\/$/, '');

export const INTERNAL_LOGIN_ENDPOINT =
  import.meta.env.VITE_INTERNAL_LOGIN_API_URL || `${API_BASE_URL}/api/auth/internal-login`;

export const ACTIVE_USERS_ENDPOINT =
  import.meta.env.VITE_ACTIVE_USERS_API_URL || `${API_BASE_URL}/api/dashboard/active-users`;

export const TOTAL_USERS_ENDPOINT =
  import.meta.env.VITE_TOTAL_USERS_API_URL || `${API_BASE_URL}/api/users/created-after/2025-03-06`;

export const DL_TRACKER_BASE_URL = (
  import.meta.env.VITE_DL_TRACKER_API_URL || 'https://dl-tracker.trustgrid.com'
).replace(/\/$/, '');

export const TOTAL_DIDS_ENDPOINT =
  import.meta.env.VITE_TOTAL_DIDS_API_URL || 'https://publicnodecount.staging.trustgrid.com/api/allcounts/nym-tx-count';
