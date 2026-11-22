import type { ModuleManifest } from '@invoria/core';
import { CATALOG_MANIFEST } from '@invoria/catalog';
import { CUSTOMERS_MANIFEST } from '@invoria/customers';
import { FINANCIAL_MANIFEST } from '@invoria/financial';
import { PROCUREMENT_MANIFEST } from '@invoria/procurement';
import { SALES_MANIFEST } from '@invoria/sales';

/**
 * Ordered registry of feature module manifests registered in the Invoria shell.
 */
export const APP_MODULE_MANIFESTS: readonly ModuleManifest[] = [
  CATALOG_MANIFEST,
  SALES_MANIFEST,
  PROCUREMENT_MANIFEST,
  FINANCIAL_MANIFEST,
  CUSTOMERS_MANIFEST,
];
