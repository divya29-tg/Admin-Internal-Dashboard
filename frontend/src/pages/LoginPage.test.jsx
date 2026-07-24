import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage.jsx';

// LoginPage is a thin wrapper around LoginForm, so we mock LoginForm to
// isolate the unit under test (LoginPage) from LoginForm's own implementation
// details/dependencies (context providers, API calls, form state, etc.).
vi.mock('@/components/auth/LoginForm.jsx', () => ({
  default: vi.fn(() => <div data-testid="login-form-mock">Mocked LoginForm</div>),
}));

import LoginForm from '@/components/auth/LoginForm.jsx';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-form-mock')).toBeInTheDocument();
  });

  it('renders the LoginForm component', () => {
    render(<LoginPage />);
    expect(LoginForm).toHaveBeenCalled();
  });

  it('renders exactly one instance of LoginForm', () => {
    render(<LoginPage />);
    expect(LoginForm).toHaveBeenCalledTimes(1);
  });

  it('renders LoginForm with no props', () => {
    render(<LoginPage />);
    // LoginPage does not pass any props to LoginForm
    expect(LoginForm).toHaveBeenCalledWith({}, undefined);
  });

  it('does not render any extra sibling content of its own', () => {
    const { container } = render(<LoginPage />);
    // LoginPage's output should be exactly the (mocked) LoginForm element,
    // i.e. a single child node in the container.
    expect(container.childElementCount).toBe(1);
    expect(container.firstChild).toHaveAttribute('data-testid', 'login-form-mock');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<LoginPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
