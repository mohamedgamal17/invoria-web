import type { ModuleManifest } from '@invoria/core';
import { ContactRound, User } from 'lucide-angular';

export const CUSTOMERS_MANIFEST: ModuleManifest = {
  moduleId: 'customers',
  navigation: [
    {
      label: 'CRM',
      icon: ContactRound,
      children: [{ label: 'Customers', path: '/customers', icon: User }],
    },
  ],
  routes: [
    {
      path: 'customers',
      loadChildren: () => import('./customers.routes').then((module) => module.CUSTOMERS_ROUTES),
    },
  ],
};
