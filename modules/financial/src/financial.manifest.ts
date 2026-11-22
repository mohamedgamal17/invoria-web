import type { ModuleManifest } from '@invoria/core';
import { Banknote, Receipt, Wallet } from 'lucide-angular';

export const FINANCIAL_MANIFEST: ModuleManifest = {
  moduleId: 'financial',
  navigation: [
    {
      label: 'Financial',
      icon: Wallet,
      children: [
        { label: 'Receivables', path: '/receivables', icon: Receipt },
        { label: 'Payables', path: '/payables', icon: Banknote },
      ],
    },
  ],
  routes: [
    {
      path: 'receivables',
      loadChildren: () =>
        import('./receivables/receivables.routes').then((module) => module.RECEIVABLES_ROUTES),
    },
    {
      path: 'payables',
      loadChildren: () =>
        import('./payables/payables.routes').then((module) => module.PAYABLES_ROUTES),
    },
  ],
};
