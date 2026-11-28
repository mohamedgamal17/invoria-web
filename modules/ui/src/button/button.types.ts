import { IV_ICON_SIZES, type IvIconPosition, type IvSize } from '../common/common.types';

export type IvButtonSize = IvSize;
export type IvButtonVariant = 'primary' | 'secondary';
export type IvButtonAppearance = 'solid' | 'outline' | 'ghost' | 'link';
export type IvButtonShape = 'default' | 'rounded' | 'pill';
export type IvButtonIconPosition = IvIconPosition;
export type IvButtonType = 'button' | 'submit' | 'reset';

export const ICON_SIZES: Record<IvButtonSize, number> = IV_ICON_SIZES;
