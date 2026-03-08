# Cross-Domain Dark Mode Implementation Guide

## Overview

This guide documents how to implement persistent dark mode preferences that sync across all Afrisinc subdomains (auth.afrisinc.com, notify.afrisinc.com, etc.). Instead of relying on domain-isolated `localStorage`, the solution uses **shared cookies** to maintain theme preference across the entire `.afrisinc.com` domain.

---

## Current Problem

The current dark mode implementation in auth-ui uses `next-themes` with `localStorage`:
- ✅ Works perfectly within a single domain
- ❌ Does NOT sync across subdomains (auth.afrisinc.com ≠ notify.afrisinc.com)
- ❌ Each subdomain has independent theme preference

**Example Issue:**
1. User visits auth.afrisinc.com and selects dark mode
2. User clicks link to notify.afrisinc.com
3. notify.afrisinc.com defaults to light mode (no theme preference stored)

---

## Solution: Cookie-Based Theme Persistence

Instead of `localStorage` (domain-specific), use **HTTP cookies** with `domain=.afrisinc.com` to share theme preference across all subdomains.

### How It Works

1. **User selects theme** → ThemeToggle.tsx calls `setThemeCookie(theme)`
2. **Cookie is set** with `domain=.afrisinc.com` and 1-year expiration
3. **Browser shares cookie** across all .afrisinc.com subdomains
4. **On app load** → Check cookie first → Apply theme → Fallback to localStorage/system
5. **Theme applies via CSS class** → Dark mode CSS variables override light defaults

---

## Implementation Steps

### Step 1: Create Theme Utility Module

Create `src/lib/theme.ts`:

```typescript
/**
 * Cross-domain theme persistence utility
 * Uses cookies with domain=.afrisinc.com to sync theme across all Afrisinc subdomains
 */

const THEME_COOKIE_NAME = 'afrisinc_theme';
const THEME_COOKIE_DOMAIN = '.afrisinc.com';
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

  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; domain=${THEME_COOKIE_DOMAIN}; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
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
```

---

### Step 2: Update ThemeToggle Component

Update `src/components/ThemeToggle.tsx` to call `setThemeCookie()` when theme changes:

```typescript
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setThemeCookie } from "@/lib/theme";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Sync theme to cookie for cross-domain sharing
    setThemeCookie(newTheme as 'light' | 'dark' | 'system');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### Step 3: Update App.tsx

Update `src/App.tsx` to check cookie theme on app initialization:

```typescript
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { getThemeFromCookie } from '@/lib/theme';
import { Routes } from './routes';
import { queryClient } from '@/lib/queryClient';

function App() {
  useEffect(() => {
    // On app load, check if theme cookie exists and apply it
    const cookieTheme = getThemeFromCookie();
    if (cookieTheme) {
      document.documentElement.classList.toggle('dark', cookieTheme === 'dark');
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
        >
          <AuthProvider>
            <TooltipProvider>
              <Helmet>
                <title>Afrisinc</title>
              </Helmet>
              <Routes />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
```

---

### Step 4: Update Logout Handler

When users log out, clear the theme cookie (optional, but recommended for security):

Update logout function in your auth service or context:

```typescript
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optional: clear theme cookie on logout
  // clearThemeCookie();
  window.location.href = '/login';
}
```

---

## Applying to Other Afrisinc Apps

### Afrisinc Notify (notify.afrisinc.com)

1. **Copy theme utility**: Copy `src/lib/theme.ts` to notify project
2. **Update auth context or app initialization**: Check cookie on load with `getThemeFromCookie()`
3. **Update theme toggle**: Call `setThemeCookie()` when theme changes
4. **Sync with server config**: Ensure `authUiUrl` is correctly set to auth.afrisinc.com

**Example for notify (if using a custom theme system without next-themes):**

```typescript
// notify/src/contexts/AuthContext.tsx
import { useEffect } from 'react';
import { getThemeFromCookie, setThemeCookie, applyTheme } from '@/lib/theme';

export function AuthProvider({ children }) {
  useEffect(() => {
    // On app load, apply theme from cookie
    const theme = getThemeFromCookie() || 'system';
    applyTheme(theme);
  }, []);

  // In your theme toggle handler:
  const handleThemeChange = (newTheme) => {
    setThemeCookie(newTheme);
    applyTheme(newTheme);
  };

  return (
    <AuthContext.Provider value={{ handleThemeChange }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Other Afrisinc Subdomains

Apply the same pattern to any subdomain that needs theme persistence:
- Copy `src/lib/theme.ts` (or equivalent)
- Check cookie on app initialization
- Call `setThemeCookie()` on theme changes

---

## Cookie Configuration Details

| Property | Value | Reason |
|---|---|---|
| **Name** | `afrisinc_theme` | Consistent across all apps |
| **Domain** | `.afrisinc.com` | Accessible from all subdomains (auth.afrisinc.com, notify.afrisinc.com, etc.) |
| **Path** | `/` | Accessible from all routes on each subdomain |
| **Max-Age** | 31,536,000 (1 year) | User preference persists across sessions |
| **Expires** | 1 year from now | Alternative to Max-Age for older browsers |
| **SameSite** | `Lax` | Security: allows cross-site navigation but not cross-site requests |
| **Secure** | Optional (should be `true` in production) | HTTPS only in production; allows HTTP in dev |

---

## Browser Compatibility

| Feature | Support |
|---|---|
| **Cookies with domain** | ✅ All modern browsers |
| **SameSite attribute** | ✅ Chrome 80+, Firefox 60+, Safari 13+ |
| **.afrisinc.com domain** | ✅ Works across all subdomains |

**For older browsers (IE11):** The solution gracefully falls back to `localStorage` since `next-themes` is used as primary storage.

---

## Testing Cross-Domain Theme Persistence

### Manual Testing

1. **Open auth.afrisinc.com/login** in browser
2. **Toggle theme to dark mode** using ThemeToggle
3. **Check DevTools → Application → Cookies** → Verify `afrisinc_theme=dark` exists with `domain=.afrisinc.com`
4. **Open notify.afrisinc.com** in same browser window
5. **Verify dark mode is active** (no manual toggle needed)
6. **Change theme to light mode** on notify.afrisinc.com
7. **Return to auth.afrisinc.com** → Verify light mode is active

### Automated Testing (Optional)

```typescript
// test/theme.integration.test.ts
describe('Cross-domain theme persistence', () => {
  it('should persist dark mode theme across subdomains', () => {
    // Set theme cookie on domain1
    document.cookie = 'afrisinc_theme=dark; domain=.afrisinc.com; path=/';

    // Simulate navigation to domain2
    const cookieTheme = getThemeFromCookie();
    expect(cookieTheme).toBe('dark');
  });

  it('should handle system theme preference', () => {
    setThemeCookie('system');
    const theme = getThemeFromCookie();
    expect(theme).toBe('system');
  });

  it('should fallback to localStorage if cookie missing', () => {
    localStorage.setItem('theme', 'dark');
    const theme = getCurrentTheme();
    expect(theme).toBe('dark');
  });
});
```

---

## Troubleshooting

### Theme Not Persisting Across Subdomains

**Problem:** User selects dark mode on auth.afrisinc.com, but notify.afrisinc.com shows light mode

**Solutions:**
1. **Verify cookie was set**: Open DevTools → Application → Cookies → Check for `afrisinc_theme=dark` with `domain=.afrisinc.com`
2. **Check domain configuration**: Cookie must have `domain=.afrisinc.com` (with leading dot)
3. **Check SameSite policy**: Ensure `SameSite=Lax` (allows cross-site navigation)
4. **Verify HTTPS in production**: Add `Secure` flag in production environments
5. **Check app initialization**: Ensure `getThemeFromCookie()` is called on app load

### Cookie Not Being Set

**Problem:** Cookie appears in DevTools but shows `domain=localhost` or specific domain

**Solution:**
1. **Check domain literal**: Must use `.afrisinc.com` (with dot), not `afrisinc.com`
2. **Verify local development**: Use `localhost` domain for testing in dev
3. **Configure domain dynamically**:
   ```typescript
   const THEME_COOKIE_DOMAIN = process.env.NODE_ENV === 'production'
     ? '.afrisinc.com'
     : 'localhost';
   ```

### Dark Mode Class Not Applied

**Problem:** Cookie is set correctly but theme doesn't change

**Solution:**
1. **Ensure `next-themes` recognizes cookie**: Update App.tsx to check cookie first
2. **Check CSS variables**: Verify `src/index.css` has `.dark` selector with CSS variable overrides
3. **Verify HTML element**: Check that `<html>` has `class="dark"` or `class="light"` set by next-themes

---

## Security Considerations

### Data Sensitivity
- ⚠️ Theme preference is **not sensitive data** (non-personalized, non-authentication)
- ✅ Safe to store in cookies accessible across subdomains

### Cookie Security
- ✅ **SameSite=Lax** prevents CSRF attacks
- ✅ **Secure flag** (production only) prevents transmission over HTTP
- ✅ **HttpOnly flag** not used (intentionally — JS needs to read for cross-domain sync)

### Third-Party Cookie Concerns
- ⚠️ Some browsers (Safari, Firefox) block third-party cookies by default
- ✅ **SameSite=Lax** enables cross-site navigation exceptions
- ✅ Cookie is first-party (set by .afrisinc.com domain), not third-party

---

## Migration Path (For Existing Users)

### Phase 1: Deploy to auth-ui
- Add `src/lib/theme.ts`
- Update ThemeToggle.tsx and App.tsx
- Theme preferences start syncing via cookies
- Existing localStorage preferences still work (fallback)

### Phase 2: Deploy to notify.afrisinc.com
- Add `src/lib/theme.ts`
- Update theme initialization
- Cookie-based persistence now active on both apps

### Phase 3: Deploy to other subdomains
- Repeat Phase 2 pattern for each subdomain

**Backward Compatibility:** No user action required. Existing localStorage preferences automatically become cookie-based on next theme change.

---

## Summary

This implementation ensures that users' dark mode preferences persist across all Afrisinc subdomains through shared cookies. The solution:

✅ Works across all modern browsers
✅ Maintains user preference for 1 year
✅ Secure (SameSite=Lax, optional Secure flag)
✅ Backward compatible with localStorage
✅ Easy to implement in any React app
✅ No external dependencies required

By following these steps, all Afrisinc apps will seamlessly share dark mode preference across subdomains, providing a consistent and professional user experience.
