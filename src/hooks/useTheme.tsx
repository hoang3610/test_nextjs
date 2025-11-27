'use client';

import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean; // (Tùy chọn) Export thêm mounted để component con biết khi nào nên render icon
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    
    // Update DOM
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // KHÔNG được return <>{children}</> khi !mounted
  // Thay vào đó, nếu muốn tránh hydration mismatch, 
  // hãy render children bên trong Provider bình thường.
  // Việc ẩn hiện icon mặt trăng/mặt trời sẽ do component con tự xử lý dựa trên biến 'mounted'

  // Nếu bạn muốn giấu toàn bộ app cho đến khi load xong theme (không khuyến khích vì hại SEO):
  // if (!mounted) return <div className="invisible">{children}</div>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};