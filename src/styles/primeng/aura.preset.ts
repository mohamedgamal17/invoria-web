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
      300: 'color-mix(in srgb, var(--c-success), white 72%)',
      400: 'color-mix(in srgb, var(--c-success), white 54%)',
      500: 'var(--c-success)',
      600: 'color-mix(in srgb, var(--c-success), black 12%)',
      700: 'color-mix(in srgb, var(--c-success), black 24%)',
      800: 'color-mix(in srgb, var(--c-success), black 38%)',
      900: 'color-mix(in srgb, var(--c-success), black 52%)',
      950: 'color-mix(in srgb, var(--c-success), black 75%)'
    },
    amber: {
      50: 'color-mix(in srgb, var(--c-warning), white 92%)',
      100: 'color-mix(in srgb, var(--c-warning), white 88%)',
      200: 'color-mix(in srgb, var(--c-warning), white 80%)',
      300: 'color-mix(in srgb, var(--c-warning), white 72%)',
      400: 'color-mix(in srgb, var(--c-warning), white 54%)',
      500: 'var(--c-warning)',
      600: 'color-mix(in srgb, var(--c-warning), black 12%)',
      700: 'color-mix(in srgb, var(--c-warning), black 24%)',
      800: 'color-mix(in srgb, var(--c-warning), black 38%)',
      900: 'color-mix(in srgb, var(--c-warning), black 52%)',
      950: 'color-mix(in srgb, var(--c-warning), black 75%)'
    },
    red: {
      50: 'color-mix(in srgb, var(--c-danger), white 92%)',
      100: 'color-mix(in srgb, var(--c-danger), white 88%)',
      200: 'color-mix(in srgb, var(--c-danger), white 80%)',
      300: 'color-mix(in srgb, var(--c-danger), white 72%)',
      400: 'color-mix(in srgb, var(--c-danger), white 54%)',
      500: 'var(--c-danger)',
      600: 'color-mix(in srgb, var(--c-danger), black 12%)',
      700: 'color-mix(in srgb, var(--c-danger), black 24%)',
      800: 'color-mix(in srgb, var(--c-danger), black 38%)',
      900: 'color-mix(in srgb, var(--c-danger), black 52%)',
      950: 'color-mix(in srgb, var(--c-danger), black 75%)'
    }
  },
  semantic: {
    // Primary palette mapping -> our primary semantic token.
    primary: {
      50: 'color-mix(in srgb, var(--c-primary), white 92%)',
      100: 'color-mix(in srgb, var(--c-primary), white 88%)',
      200: 'color-mix(in srgb, var(--c-primary), white 80%)',
      300: 'color-mix(in srgb, var(--c-primary), white 72%)',
      400: 'color-mix(in srgb, var(--c-primary), white 54%)',
      500: 'var(--c-primary)',
      600: 'color-mix(in srgb, var(--c-primary), black 12%)',
      700: 'color-mix(in srgb, var(--c-primary), black 24%)',
      800: 'color-mix(in srgb, var(--c-primary), black 38%)',
      900: 'color-mix(in srgb, var(--c-primary), black 52%)',
      950: 'color-mix(in srgb, var(--c-primary), black 75%)'
    },
    // Additional creative accent palette for badges/highlights.
    cyan: {
      50: 'color-mix(in srgb, var(--c-accent-2), white 92%)',
      100: 'color-mix(in srgb, var(--c-accent-2), white 88%)',
      200: 'color-mix(in srgb, var(--c-accent-2), white 80%)',
      300: 'color-mix(in srgb, var(--c-accent-2), white 72%)',
      400: 'color-mix(in srgb, var(--c-accent-2), white 54%)',
      500: 'var(--c-accent-2)',
      600: 'color-mix(in srgb, var(--c-accent-2), black 12%)',
      700: 'color-mix(in srgb, var(--c-accent-2), black 24%)',
      800: 'color-mix(in srgb, var(--c-accent-2), black 38%)',
      900: 'color-mix(in srgb, var(--c-accent-2), black 52%)',
      950: 'color-mix(in srgb, var(--c-accent-2), black 75%)'
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--c-surface)',
          50: 'var(--c-surface-2)',
          100: 'color-mix(in srgb, var(--c-surface-2), var(--c-border) 25%)',
          200: 'var(--c-border)',
          300: 'color-mix(in srgb, var(--c-border), var(--c-muted-foreground) 16%)',
          400: 'color-mix(in srgb, var(--c-border), var(--c-muted-foreground) 34%)',
          500: 'var(--c-muted-foreground)',
          600: 'var(--c-muted-foreground)',
          700: 'var(--c-foreground)',
          800: 'color-mix(in srgb, var(--c-foreground), black 8%)',
          900: 'color-mix(in srgb, var(--c-foreground), black 16%)',
          950: 'color-mix(in srgb, var(--c-foreground), black 28%)'
        },
        primary: {
          contrastColor: 'var(--c-primary-foreground)'
        }
      },
      dark: {
        surface: {
          // In PrimeNG dark mode, `surface.0` is used as the main text color.
          0: 'var(--c-foreground)',
          50: 'color-mix(in srgb, var(--c-foreground), white 86%)',
          100: 'color-mix(in srgb, var(--c-foreground), white 72%)',
          200: 'color-mix(in srgb, var(--c-foreground), white 48%)',
          300: 'color-mix(in srgb, var(--c-foreground), var(--c-muted-foreground) 30%)',
          400: 'var(--c-muted-foreground)',
          500: 'color-mix(in srgb, var(--c-muted-foreground), var(--c-border) 22%)',
          600: 'var(--c-border)',
          700: 'var(--c-muted)',
          800: 'var(--c-surface-2)',
          900: 'color-mix(in srgb, var(--c-surface-0), var(--c-foreground) 12%)',
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

