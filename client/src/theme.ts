import { createTheme, rem } from '@mantine/core';

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
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '800',
    sizes: {
      h1: { fontSize: 'clamp(1.875rem, 1.4rem + 2vw, 3rem)',   lineHeight: '1.15', fontWeight: '900' },
      h2: { fontSize: 'clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem)', lineHeight: '1.2',  fontWeight: '800' },
      h3: { fontSize: 'clamp(1.25rem, 1.0rem + 1vw, 1.75rem)',  lineHeight: '1.3',  fontWeight: '800' },
      h4: { fontSize: 'clamp(1.0rem,  0.9rem + 0.5vw, 1.25rem)', lineHeight: '1.4', fontWeight: '700' },
    },
  },
  primaryColor: 'brand',
  colors: {
    brand: brandOrange,
    teal: brandTeal,
  },
  defaultRadius: 'xl',
  cursorType: 'pointer',
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
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
      defaultProps: {
        radius: 'xl',
      },
      styles: () => ({
        root: {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 700,
          letterSpacing: '0.1px',
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        label: {
          fontSize: 'inherit',
        },
      }),
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xl',
      },
      styles: () => ({
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': {
            transform: 'scale(0.92)',
          },
        },
      }),
    },
    TextInput: {
      styles: () => ({
        input: {
          transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
          '&:focus': {
            borderColor: 'var(--lm-orange)',
            boxShadow: '0 0 0 3px var(--lm-orange-shadow)',
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: '6px',
        },
      }),
    },
    PasswordInput: {
      styles: () => ({
        input: {
          transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
          '&:focus-within': {
            borderColor: 'var(--lm-orange)',
            boxShadow: '0 0 0 3px var(--lm-orange-shadow)',
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: '6px',
        },
      }),
    },
    Textarea: {
      styles: () => ({
        input: {
          transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
          '&:focus': {
            borderColor: 'var(--lm-orange)',
            boxShadow: '0 0 0 3px var(--lm-orange-shadow)',
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: '6px',
        },
      }),
    },
    Select: {
      styles: () => ({
        input: {
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus': {
            borderColor: 'var(--lm-orange)',
            boxShadow: '0 0 0 3px var(--lm-orange-shadow)',
          },
        },
        dropdown: {
          border: '1px solid var(--lm-border)',
          boxShadow: 'var(--lm-shadow-md)',
          borderRadius: '16px',
        },
        label: {
          fontWeight: 600,
          marginBottom: '6px',
        },
      }),
    },
    Badge: {
      styles: () => ({
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.2px',
        },
      }),
    },
    Menu: {
      styles: () => ({
        dropdown: {
          border: '1px solid var(--lm-border)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(43, 69, 78, 0.12), 0 8px 20px rgba(43, 69, 78, 0.06)',
          borderRadius: '16px',
        },
        item: {
          borderRadius: '10px',
          transition: 'background-color 0.15s',
        },
      }),
    },
    Modal: {
      styles: () => ({
        content: {
          border: '1px solid var(--lm-border)',
          backgroundColor: 'var(--lm-card-bg)',
          boxShadow: 'var(--lm-shadow-xl)',
        },
        header: {
          backgroundColor: 'var(--lm-card-bg)',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--lm-border)',
        },
        title: {
          fontWeight: 800,
          color: 'var(--lm-dark)',
        },
        close: {
          borderRadius: '50%',
          transition: 'background-color 0.2s',
        },
      }),
    },
    Drawer: {
      styles: () => ({
        content: {
          backgroundColor: 'var(--lm-bg)',
        },
        header: {
          backgroundColor: 'var(--lm-bg)',
          borderBottom: '1px solid var(--lm-border)',
          paddingBottom: '16px',
        },
        title: {
          fontWeight: 800,
        },
      }),
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        transitionProps: { transition: 'fade', duration: 150 },
      },
      styles: () => ({
        tooltip: {
          fontWeight: 600,
          fontSize: '12px',
          letterSpacing: '0.2px',
        },
      }),
    },
    Tabs: {
      styles: () => ({
        tab: {
          fontWeight: 600,
          transition: 'all 0.2s',
          '&[data-active]': {
            fontWeight: 700,
          },
        },
      }),
    },
    Notification: {
      styles: () => ({
        root: {
          border: '1px solid var(--lm-border)',
          boxShadow: 'var(--lm-shadow-md)',
          borderRadius: '16px',
        },
      }),
    },
    Container: {
      defaultProps: {
        px: { base: 'md', sm: 'xl', md: 'xl' },
      },
    },
    Avatar: {
      styles: () => ({
        root: {
          flexShrink: 0,
        },
        placeholder: {
          backgroundColor: 'var(--lm-warm)',
          color: 'var(--lm-orange)',
          fontWeight: 700,
        },
      }),
    },
    Indicator: {
      styles: () => ({
        indicator: {
          transition: 'transform 0.2s var(--lm-bounce)',
        },
      }),
    },
    ScrollArea: {
      styles: () => ({
        scrollbar: {
          '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
            backgroundColor: 'var(--lm-border)',
          },
          '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover': {
            backgroundColor: 'var(--lm-muted)',
          },
        },
      }),
    },
    Loader: {
      defaultProps: {
        color: 'brand',
      },
    },
    Pagination: {
      styles: () => ({
        control: {
          transition: 'all 0.2s',
          fontWeight: 600,
          border: 'none',
          '&[data-active]': {
            boxShadow: 'var(--lm-shadow-orange)',
          },
        },
      }),
    },
  },
});
