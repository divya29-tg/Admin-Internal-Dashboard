import { createContext, useCallback, useContext, useState } from 'react';
import { internalLoginApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fallback if parsing fails
      }
    }
    return null;
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const performLogin = useCallback(async (username, password) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await internalLoginApi(username, password);
      const authToken = response.data.token;
      const userObj = response.data.user || {
        username: username || 'User',
        email: username ? (username.includes('@') ? username : `${username.toLowerCase()}@synq.com`) : '',
      };
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(authToken);
      setUser(userObj);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Failed to authenticate.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback((username, password) => performLogin(username, password), [performLogin]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, internalLogin: login, logout, authError, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
