import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'invoria-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(readInitialTheme());

  constructor() {
    applyTheme(this.isDark());
  }

  toggleDark(): void {
    this.isDark.update((value) => !value);
    applyTheme(this.isDark());
  }
}

function readInitialTheme(): boolean {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') {
      return true;
    }
    if (stored === 'light') {
      return false;
    }
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

function applyTheme(isDark: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', isDark);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}
