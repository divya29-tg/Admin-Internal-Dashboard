import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mock the auth context hook ---
import { useAuth } from '@/context/AuthContext.jsx';
vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

// --- Mock the dashboard data hook ---
import { useDashboardData } from '@/hooks/useDashboardData.js';
vi.mock('@/hooks/useDashboardData.js', () => ({
  useDashboardData: vi.fn(),
}));

// --- Mock child components so this is a true unit test of DashboardPage's
//     wiring/composition logic, not the children's internals. Each mock
//     renders a simple, queryable stand-in and echoes the props it received
//     via data-* attributes / text so assertions can inspect them. ---
vi.mock('@/components/layout/DashboardHeader.jsx', () => ({
  default: vi.fn(({ user, onLogout }) => (
    <div data-testid="dashboard-header">
      <span data-testid="header-user">{user ? user.name : 'no-user'}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  )),
}));

vi.mock('@/components/dashboard/DashboardMetricsGrid.jsx', () => ({
  default: vi.fn((props) => (
    <div
      data-testid="metrics-grid"
      data-total-downloads={JSON.stringify(props.totalDownloads)}
      data-monthly-downloads={JSON.stringify(props.monthlyDownloads)}
      data-total-dids={JSON.stringify(props.totalDids)}
      data-active-users={JSON.stringify(props.activeUsers)}
      data-is-loading={String(props.isLoading)}
    />
  )),
}));

vi.mock('@/components/dashboard/GeographicBreakdown.jsx', () => ({
  default: vi.fn((props) => (
    <div
      data-testid="geographic-breakdown"
      data-combined-monthly={JSON.stringify(props.combinedMonthly)}
      data-android-monthly={JSON.stringify(props.androidMonthly)}
      data-ios-monthly={JSON.stringify(props.iosMonthly)}
      data-is-loading={String(props.isLoading)}
    />
  )),
}));

vi.mock('@/components/dashboard/PlatformBreakdown.jsx', () => ({
  default: vi.fn((props) => (
    <div
      data-testid="platform-breakdown"
      data-total-downloads-meta={JSON.stringify(props.totalDownloadsMeta)}
      data-ios-monthly={JSON.stringify(props.iosMonthly)}
      data-android-ratings={JSON.stringify(props.androidRatings)}
      data-is-loading={String(props.isLoading)}
    />
  )),
}));

vi.mock('@/components/common/DateFilter.jsx', () => ({
  default: vi.fn(({ filterType, setFilterType }) => (
    <div data-testid="date-filter">
      <span data-testid="filter-type">{filterType}</span>
      <button onClick={() => setFilterType('week')}>Set Week</button>
    </div>
  )),
}));

// Import after mocks are registered
import DashboardPage from './DashboardPage.jsx';

// --- Shared fixtures ---
const mockUser = { name: 'Jane Doe', email: 'jane@example.com' };
const mockLogout = vi.fn();
const mockSetFilterType = vi.fn();

const baseDashboardData = {
  totalDownloads: { value: 12000, meta: { source: 'combined' } },
  monthlyDownloads: { value: 800 },
  totalDids: { value: 340 },
  activeUsers: { value: 210 },
  iosMonthly: { value: 500 },
  androidMonthly: { value: 300 },
  androidRatings: { average: 4.5, count: 120 },
  filterType: 'month',
  setFilterType: mockSetFilterType,
  isLoading: false,
  isFilterLoading: false,
  isRefreshing: false,
};

function setupMocks(overrides = {}) {
  useAuth.mockReturnValue({
    token: 'test-token',
    user: mockUser,
    logout: mockLogout,
  });
  useDashboardData.mockReturnValue({ ...baseDashboardData, ...overrides });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupMocks();
});

describe('DashboardPage', () => {
  it('renders without crashing', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('renders the page title and subtitle', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Overview of device signups, installation stats, and user sessions.')
    ).toBeInTheDocument();
  });

  it('calls useDashboardData with the token from useAuth', () => {
    render(<DashboardPage />);
    expect(useDashboardData).toHaveBeenCalledWith('test-token');
  });

  it('renders DashboardHeader with the current user and passes logout handler', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('header-user')).toHaveTextContent('Jane Doe');

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders DateFilter with the current filterType and forwards setFilterType', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    expect(screen.getByTestId('filter-type')).toHaveTextContent('month');

    await user.click(screen.getByRole('button', { name: 'Set Week' }));
    expect(mockSetFilterType).toHaveBeenCalledWith('week');
  });

  describe('loading indicator (LinearProgress)', () => {
    it('is not rendered when isLoading, isFilterLoading, and isRefreshing are all false', () => {
      setupMocks({ isLoading: false, isFilterLoading: false, isRefreshing: false });
      render(<DashboardPage />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('is rendered when isLoading is true', () => {
      setupMocks({ isLoading: true });
      render(<DashboardPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('is rendered when isFilterLoading is true', () => {
      setupMocks({ isFilterLoading: true });
      render(<DashboardPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('is rendered when isRefreshing is true', () => {
      setupMocks({ isRefreshing: true });
      render(<DashboardPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('is rendered when multiple loading flags are true simultaneously', () => {
      setupMocks({ isLoading: true, isFilterLoading: true, isRefreshing: true });
      render(<DashboardPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('DashboardMetricsGrid wiring', () => {
    it('receives totalDownloads, monthlyDownloads, totalDids, activeUsers, and isLoading', () => {
      render(<DashboardPage />);
      const grid = screen.getByTestId('metrics-grid');
      expect(grid).toHaveAttribute(
        'data-total-downloads',
        JSON.stringify(baseDashboardData.totalDownloads)
      );
      expect(grid).toHaveAttribute(
        'data-monthly-downloads',
        JSON.stringify(baseDashboardData.monthlyDownloads)
      );
      expect(grid).toHaveAttribute('data-total-dids', JSON.stringify(baseDashboardData.totalDids));
      expect(grid).toHaveAttribute(
        'data-active-users',
        JSON.stringify(baseDashboardData.activeUsers)
      );
      expect(grid).toHaveAttribute('data-is-loading', 'false');
    });

    it('forwards isLoading=true down to the metrics grid', () => {
      setupMocks({ isLoading: true });
      render(<DashboardPage />);
      expect(screen.getByTestId('metrics-grid')).toHaveAttribute('data-is-loading', 'true');
    });
  });

  describe('GeographicBreakdown wiring', () => {
    it('receives monthlyDownloads as combinedMonthly, plus platform monthly breakdowns and isLoading', () => {
      render(<DashboardPage />);
      const geo = screen.getByTestId('geographic-breakdown');
      expect(geo).toHaveAttribute(
        'data-combined-monthly',
        JSON.stringify(baseDashboardData.monthlyDownloads)
      );
      expect(geo).toHaveAttribute(
        'data-android-monthly',
        JSON.stringify(baseDashboardData.androidMonthly)
      );
      expect(geo).toHaveAttribute('data-ios-monthly', JSON.stringify(baseDashboardData.iosMonthly));
      expect(geo).toHaveAttribute('data-is-loading', 'false');
    });
  });

  describe('PlatformBreakdown wiring', () => {
    it('receives totalDownloads.meta as totalDownloadsMeta, iosMonthly, androidRatings, and isLoading', () => {
      render(<DashboardPage />);
      const platform = screen.getByTestId('platform-breakdown');
      expect(platform).toHaveAttribute(
        'data-total-downloads-meta',
        JSON.stringify(baseDashboardData.totalDownloads.meta)
      );
      expect(platform).toHaveAttribute(
        'data-ios-monthly',
        JSON.stringify(baseDashboardData.iosMonthly)
      );
      expect(platform).toHaveAttribute(
        'data-android-ratings',
        JSON.stringify(baseDashboardData.androidRatings)
      );
      expect(platform).toHaveAttribute('data-is-loading', 'false');
    });

    it('handles a missing totalDownloads.meta gracefully (undefined)', () => {
      setupMocks({ totalDownloads: { value: 12000 } });
      render(<DashboardPage />);
      // JSON.stringify(undefined) -> undefined, so React omits the attribute entirely
      expect(screen.getByTestId('platform-breakdown')).not.toHaveAttribute(
        'data-total-downloads-meta'
      );
    });
  });

  it('renders all major sections together in a single pass', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('date-filter')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
    expect(screen.getByTestId('geographic-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('platform-breakdown')).toBeInTheDocument();
  });

  it('renders gracefully when user is null (e.g. auth still resolving)', () => {
    useAuth.mockReturnValue({ token: null, user: null, logout: mockLogout });
    render(<DashboardPage />);
    expect(screen.getByTestId('header-user')).toHaveTextContent('no-user');
  });
});
