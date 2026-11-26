import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sc_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sc_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => { setUser(res.data.data); localStorage.setItem('sc_user', JSON.stringify(res.data.data)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { token: jwt, user: userData } = res.data.data;
    localStorage.setItem('sc_token', jwt);
    localStorage.setItem('sc_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { token: jwt, user: userData } = res.data.data;
    localStorage.setItem('sc_token', jwt);
    localStorage.setItem('sc_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.getMe();
    setUser(res.data.data);
    localStorage.setItem('sc_user', JSON.stringify(res.data.data));
  }, []);

  const isClient = user?.role === 'ROLE_CLIENT';
  const isFreelancer = user?.role === 'ROLE_FREELANCER';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isClient, isFreelancer, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
