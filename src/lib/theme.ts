/**
 * Cross-domain theme persistence utility
 * Uses cookies with domain=.afrisinc.com to sync theme across all Afrisinc subdomains
 */

const THEME_COOKIE_NAME = 'afrisinc_theme';
const THEME_COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.afrisinc.com' : 'localhost';
const THEME_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export type Theme = 'light' | 'dark' | 'system';

/**
 * Get theme preference from shared cookie
 * Returns null if cookie doesn't exist
 */
export function getThemeFromCookie(): Theme | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === THEME_COOKIE_NAME) {
      const decoded = decodeURIComponent(value);
      if (decoded === 'light' || decoded === 'dark' || decoded === 'system') {
        return decoded;
      }
    }
  }
  return null;
}

/**
 * Set theme preference in shared cookie
 * Cookie is accessible from all .afrisinc.com subdomains
 */
export function setThemeCookie(theme: Theme): void {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + THEME_COOKIE_MAX_AGE * 1000);

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; domain=${THEME_COOKIE_DOMAIN}; expires=${expiryDate.toUTCString()}; SameSite=Lax${secure}`;
}

/**
 * Clear theme cookie (for logout or reset)
 */
export function clearThemeCookie(): void {
  document.cookie = `${THEME_COOKIE_NAME}=; path=/; domain=${THEME_COOKIE_DOMAIN}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

/**
 * Get current effective theme
 * Priority: cookie → localStorage → system → 'system'
 */
export function getCurrentTheme(): Theme {
  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) return cookieTheme;

  // Fallback to localStorage for backward compatibility
  const storageTheme = localStorage.getItem('theme');
  if (storageTheme && (storageTheme === 'light' || storageTheme === 'dark' || storageTheme === 'system')) {
    return storageTheme as Theme;
  }

  return 'system';
}

/**
 * Apply theme to DOM
 * This is separate from next-themes for systems that don't use next-themes
 */
export function applyTheme(theme: Theme): void {
  const html = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle('dark', prefersDark);
  } else {
    html.classList.toggle('dark', theme === 'dark');
  }
}
