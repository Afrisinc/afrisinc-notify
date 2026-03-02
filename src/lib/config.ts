export interface RuntimeConfig {
  serverUrl: string;
  authUiUrl: string; // URL of the Afrisinc Identity Platform (auth.afrisinc.com)
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (configLoaded) {
    return config!;
  }

  try {
    const response = await fetch('/config.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to load config.json: ${response.status}`);
    }

    const runtimeConfig = await response.json();

    config = {
      serverUrl: import.meta.env.VITE_API_URL || runtimeConfig.serverUrl || '',
      authUiUrl: import.meta.env.VITE_AUTH_UI_URL || runtimeConfig.authUiUrl || '',
    };

    // console.log('[Config] Loaded:', {
    //   serverUrl: config.serverUrl || '(not set)',
    //   authUiUrl: config.authUiUrl || '(not set)',
    // });

    configLoaded = true;
    return config;
  } catch (error) {
    console.warn('[Config] Could not load config.json, falling back to env vars', error);
    config = {
      serverUrl: import.meta.env.VITE_API_URL || '',
      authUiUrl: import.meta.env.VITE_AUTH_UI_URL || '',
    };
    configLoaded = true;
    return config;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!configLoaded || !config) {
    throw new Error('Configuration not loaded. Call loadRuntimeConfig() first.');
  }
  return config;
}

export function getConfigValue(key: keyof RuntimeConfig): string {
  const cfg = getRuntimeConfig();
  return cfg[key] || '';
}

export function isRuntimeConfigLoaded(): boolean {
  return configLoaded;
}
