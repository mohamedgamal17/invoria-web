import type { LucideIconData } from 'lucide-angular';

/**
 * A navigation item that a feature module registers in the shell sidebar.
 */
export interface ModuleNavItem {
  /** Display label shown in the sidebar. */
  readonly label: string;
  /** Router path (absolute, e.g. '/orders'). */
  readonly path: string;
  /** Lucide icon for the sidebar. */
  readonly icon: LucideIconData;
}

/**
 * A navigation group that collects related nav items under a collapsible header.
 */
export interface ModuleNavGroup {
  /** Group header label. */
  readonly label: string;
  /** Lucide icon for the group header. */
  readonly icon: LucideIconData;
  /** Child navigation items within this group. */
  readonly children: readonly ModuleNavItem[];
}

/**
 * A single sidebar entry — either a standalone link or a collapsible group.
 */
export type ModuleNavEntry = ModuleNavItem | ModuleNavGroup;
