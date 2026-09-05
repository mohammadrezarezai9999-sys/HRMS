import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await api.get('me/');
      setUser(data);
    } catch (error) {
      console.error('Load user error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access')) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('token/', {
        username,
        password,
      });

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      await loadUser();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);