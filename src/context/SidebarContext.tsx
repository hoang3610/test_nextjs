'use client';
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext<any>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setCollapsed] = useState(false); // Mặc định mở
  const toggleSidebar = () => setCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);