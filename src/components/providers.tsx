'use client';

import React from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { CartProvider } from '@/hooks/useCart';
import { NextAuthProvider } from '@/providers/NextAuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </NextAuthProvider>
  );
}