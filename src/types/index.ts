export * from '../backend/types/index.ts';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  iconName: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'warning' | 'error' | 'neutral';
  children?: NavigationItem[];
}
