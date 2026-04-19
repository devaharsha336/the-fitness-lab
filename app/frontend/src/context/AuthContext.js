import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// In-memory token storage - not accessible via DOM/XSS unlike localStorage
let _accessToken = null;

export function getAccessToken() {
  return _accessToken;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (!_accessToken) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${_accessToken}` },
      });
      setUser(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Auth check failed:', error.message);
      }
      _accessToken = null;
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    _accessToken = data.token;
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${_accessToken}` },
      });
    } catch (error) {
      console.error('Logout error:', error.message);
    }
    _accessToken = null;
    setUser(false);
  }, []);

  const contextValue = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
