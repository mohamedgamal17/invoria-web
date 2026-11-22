import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * PrimeNG preset — offloaded palette.
 *
 * Previously this preset mirrored custom --c-* tokens into PrimeNG via
 * color-mix() derivations (emerald/amber/red/primary/cyan + colorScheme surfaces).
 * That created a triple theming stack and color contradictions.
 *
 * Now PrimeNG Aura is the SINGLE source of truth for colors.
 * This preset only overrides non-color design tokens that remain app-owned:
 * - borderRadius (mapped to app radii --r-*)
 *
 * All color palettes (amber, red, violet, cyan, slate/zinc surfaces) use Aura
 * defaults, but primary is overridden to blue/sky for Invoria brand trust.
 * Tailwind utilities proxy via tokens.css (--c-* -> --p-*) so existing templates
 * keep working without drift.
 *
 * Primary: sky/blue scale (sky.500 #0ea5e9 anchor, blue-like trust).
 * Light/dark handled by PrimeNG colorScheme internally.
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
    // Expose sky palette for primary (Aura already defines sky, but we ensure 50-950).
    sky: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    }
  },
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    }
  }
});

export default AuraInvoria;
