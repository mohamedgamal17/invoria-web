export type IvButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IvButtonVariant = 'primary' | 'secondary';
export type IvButtonAppearance = 'solid' | 'outline' | 'ghost' | 'link';
export type IvButtonShape = 'default' | 'rounded' | 'pill';
export type IvButtonIconPosition = 'start' | 'end';
export type IvButtonType = 'button' | 'submit' | 'reset';

export const ICON_SIZES: Record<IvButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};
