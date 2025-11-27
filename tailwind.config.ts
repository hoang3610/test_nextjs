// 1️⃣ Import theme mặc định và plugin
import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import aspectRatio from '@tailwindcss/aspect-ratio'

/** @type {import('tailwindcss').Config} */
export default {
  // 2️⃣ Bật dark mode (giữ nguyên)
  darkMode: 'class',

  // 3️⃣ Nơi quét class (giữ nguyên)
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
  ],

  // 4️⃣ Cấu hình theme
  theme: {
    container: {
      // ... (giữ nguyên phần container của bạn)
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },

    // Mở rộng theme mặc định
    extend: {
      
      // 🎨 MÀU SẮC (Phần quan trọng nhất)
      // Thay vì định nghĩa màu, ta "trỏ" chúng tới biến CSS
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)", // 👈 Dòng này sẽ fix lỗi outline-ring/50
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
        chart: {
          '1': 'hsl(var(--chart-1) / <alpha-value>)',
          '2': 'hsl(var(--chart-2) / <alpha-value>)',
          '3': 'hsl(var(--chart-3) / <alpha-value>)',
          '4': 'hsl(var(--chart-4) / <alpha-value>)',
          '5': 'hsl(var(--chart-5) / <alpha-value>)',
        }
      },

      // 📏 BO GÓC (Tương tự, trỏ tới biến CSS)
      borderRadius: {
        lg: 'var(--radius-lg)',
        DEFAULT: 'var(--radius)', // Biến --radius là 8px
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xs: 'var(--radius-xs)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },

      // ✍️ Font chữ (giữ nguyên)
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
      },
      
      // ... (Phần animation và keyframes của bạn giữ nguyên)
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
    },
  },

  // 5️⃣ Plugins: Thêm animate vào
  plugins: [forms, typography, aspectRatio, require("tailwindcss-animate")],
}