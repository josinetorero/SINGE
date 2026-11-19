import React, { createContext, useCallback, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [accountId, setAccountIdState] = useState('anonymous');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('singe_theme:anonymous');
    if (savedTheme) {
      return savedTheme;
    }
    // Verifica preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(`singe_theme:${accountId}`, theme);
  }, [theme, accountId]);

  const setAccountId = useCallback(id => {
    const nextId = id == null ? 'anonymous' : `user-${id}`;
    setAccountIdState(nextId);
    const savedTheme = localStorage.getItem(`singe_theme:${nextId}`);
    const anonymousPreference = localStorage.getItem('singe_theme:anonymous');
    const nextTheme = savedTheme || anonymousPreference
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (nextId !== 'anonymous') {
      localStorage.removeItem('singe_theme:anonymous');
    }
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, toggle: toggleTheme, setTheme, setAccountId, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
