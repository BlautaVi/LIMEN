import { createTheme } from '@mantine/core';

type ColorTuple = readonly [string, string, string, string, string, string, string, string, string, string];

const brandOrange: ColorTuple = [
  '#fff1ed',
  '#ffe0d8',
  '#ffc0ad',
  '#ff9d7e',
  '#f97d5a',
  '#E86A53',
  '#D65A44',
  '#c04a38',
  '#a63d2e',
  '#8c3226',
];

const brandTeal: ColorTuple = [
  '#e8f4f8',
  '#d1e7ef',
  '#a3cfe0',
  '#6fb3cd',
  '#4a97b8',
  '#2B454E',
  '#263d45',
  '#1f333b',
  '#192a31',
  '#132127',
];

export const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '800',
  },
  primaryColor: 'brand',
  colors: {
    brand: brandOrange,
    teal: brandTeal,
  },
  defaultRadius: 'xl',
  cursorType: 'pointer',
  components: {
    Paper: {
      defaultProps: {
        shadow: 'none',
      },
      styles: () => ({
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }),
    },
    Button: {
      styles: () => ({
        root: {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 700,
        },
      }),
    },
    TextInput: {
      styles: () => ({
        input: {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }),
    },
    Textarea: {
      styles: () => ({
        input: {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }),
    },
    ActionIcon: {
      styles: () => ({
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }),
    },
    Badge: {
      styles: () => ({
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }),
    },
    Menu: {
      styles: () => ({
        dropdown: {
          border: '1px solid rgba(240, 235, 225, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(43, 69, 78, 0.12), 0 8px 20px rgba(43, 69, 78, 0.06)',
        },
      }),
    },
  },
});
