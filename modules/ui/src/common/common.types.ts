import type { LucideIconData } from 'lucide-angular';

export type IvSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IvIconPosition = 'start' | 'end';
export type IvIcon = LucideIconData;

export const IV_ICON_SIZES: Record<IvSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};
