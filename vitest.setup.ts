import '@testing-library/jest-dom/vitest';

// vitest.setup.ts
vi.mock('@teispace/next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: () => {},
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: any) => children,
}));

// 同时拦截 next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  usePathname: () => '/',
}));
