import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * PrimeNG tokens -> Invoria design tokens mapping.
 *
 * PrimeNG uses CSS variables generated from this preset:
 * - The `providePrimeNG({ theme: { preset } })` provider turns these tokens into `--p-*` variables.
 * - Components then consume those variables.
 *
 * We reference `--c-*`, `--r-*` tokens from `src/styles/tokens.css` so the Prime theme
 * tracks light/dark mode automatically.
 */
const AuraInvoria = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: 'var(--r-sm)',
      sm: 'var(--r-md)',
      md: 'var(--r-lg)',
      lg: 'var(--r-xl)',
      xl: 'var(--r-xl)'
    },
    // Status palette mapping (success/warning/danger) -> our semantic tokens.
    emerald: {
      50: 'color-mix(in srgb, var(--c-success), white 92%)',
      100: 'color-mix(in srgb, var(--c-success), white 88%)',
      200: 'color-mix(in srgb, var(--c-success), white 80%)',
      300: 'color-mix(in srgb, var(--c-success), white 65%)',
      400: 'color-mix(in srgb, var(--c-success), white 45%)',
      500: 'var(--c-success)',
      600: 'color-mix(in srgb, var(--c-success), black 15%)',
      700: 'color-mix(in srgb, var(--c-success), black 30%)',
      800: 'color-mix(in srgb, var(--c-success), black 45%)',
      900: 'color-mix(in srgb, var(--c-success), black 60%)',
      950: 'color-mix(in srgb, var(--c-success), black 75%)'
    },
    amber: {
      50: 'color-mix(in srgb, var(--c-warning), white 92%)',
      100: 'color-mix(in srgb, var(--c-warning), white 88%)',
      200: 'color-mix(in srgb, var(--c-warning), white 80%)',
      300: 'color-mix(in srgb, var(--c-warning), white 65%)',
      400: 'color-mix(in srgb, var(--c-warning), white 45%)',
      500: 'var(--c-warning)',
      600: 'color-mix(in srgb, var(--c-warning), black 15%)',
      700: 'color-mix(in srgb, var(--c-warning), black 30%)',
      800: 'color-mix(in srgb, var(--c-warning), black 45%)',
      900: 'color-mix(in srgb, var(--c-warning), black 60%)',
      950: 'color-mix(in srgb, var(--c-warning), black 75%)'
    },
    red: {
      50: 'color-mix(in srgb, var(--c-danger), white 92%)',
      100: 'color-mix(in srgb, var(--c-danger), white 88%)',
      200: 'color-mix(in srgb, var(--c-danger), white 80%)',
      300: 'color-mix(in srgb, var(--c-danger), white 65%)',
      400: 'color-mix(in srgb, var(--c-danger), white 45%)',
      500: 'var(--c-danger)',
      600: 'color-mix(in srgb, var(--c-danger), black 15%)',
      700: 'color-mix(in srgb, var(--c-danger), black 30%)',
      800: 'color-mix(in srgb, var(--c-danger), black 45%)',
      900: 'color-mix(in srgb, var(--c-danger), black 60%)',
      950: 'color-mix(in srgb, var(--c-danger), black 75%)'
    }
  },
  semantic: {
    // Primary palette mapping -> our primary semantic token.
    primary: {
      50: 'color-mix(in srgb, var(--c-primary), white 92%)',
      100: 'color-mix(in srgb, var(--c-primary), white 88%)',
      200: 'color-mix(in srgb, var(--c-primary), white 80%)',
      300: 'color-mix(in srgb, var(--c-primary), white 65%)',
      400: 'color-mix(in srgb, var(--c-primary), white 45%)',
      500: 'var(--c-primary)',
      600: 'color-mix(in srgb, var(--c-primary), black 15%)',
      700: 'color-mix(in srgb, var(--c-primary), black 30%)',
      800: 'color-mix(in srgb, var(--c-primary), black 45%)',
      900: 'color-mix(in srgb, var(--c-primary), black 60%)',
      950: 'color-mix(in srgb, var(--c-primary), black 75%)'
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--c-surface)',
          50: 'var(--c-surface-2)',
          100: 'color-mix(in srgb, var(--c-surface-2), var(--c-border) 35%)',
          200: 'var(--c-border)',
          300: 'color-mix(in srgb, var(--c-border), var(--c-muted-foreground) 10%)',
          400: 'color-mix(in srgb, var(--c-border), var(--c-muted-foreground) 30%)',
          500: 'var(--c-muted-foreground)',
          600: 'var(--c-muted-foreground)',
          700: 'var(--c-foreground)',
          800: 'color-mix(in srgb, var(--c-foreground), black 10%)',
          900: 'color-mix(in srgb, var(--c-foreground), black 20%)',
          950: 'color-mix(in srgb, var(--c-foreground), black 35%)'
        },
        primary: {
          contrastColor: 'var(--c-primary-foreground)'
        }
      },
      dark: {
        surface: {
          // In PrimeNG dark mode, `surface.0` is used as the main text color.
          0: 'var(--c-foreground)',
          50: 'color-mix(in srgb, var(--c-foreground), white 80%)',
          100: 'color-mix(in srgb, var(--c-foreground), white 60%)',
          200: 'color-mix(in srgb, var(--c-foreground), white 35%)',
          300: 'color-mix(in srgb, var(--c-foreground), var(--c-muted-foreground) 30%)',
          400: 'var(--c-muted-foreground)',
          500: 'color-mix(in srgb, var(--c-muted-foreground), var(--c-border) 30%)',
          600: 'var(--c-border)',
          700: 'var(--c-muted)',
          800: 'var(--c-surface-2)',
          900: 'var(--c-primary-foreground)',
          950: 'var(--c-surface)'
        },
        primary: {
          contrastColor: 'var(--c-primary-foreground)'
        }
      }
    }
  }
});

export default AuraInvoria;

