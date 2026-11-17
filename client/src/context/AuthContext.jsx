import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const TOKEN_KEY = 'locallens_token';
const AuthContext = createContext(null);

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((response) => setUser(response.data.data || response.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(endpoint, credentials) {
    try {
      const response = await api.post(endpoint, credentials);
      const payload = response.data.data || response.data;
      localStorage.setItem(TOKEN_KEY, payload.token);
      setUser(payload.user);
      return payload.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function login(credentials) {
    return authenticate('/auth/login', credentials);
  }

  async function register(credentials) {
    return authenticate('/auth/register', credentials);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
