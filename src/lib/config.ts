export interface RuntimeConfig {
  serverUrl: string;
  authUiUrl: string; // URL of the Afrisinc Identity Platform
  apiGatewayUrl: string; // URL of the API Gateway)
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
      apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || runtimeConfig.apiGatewayUrl || '',
    };

    configLoaded = true;
    return config;
  } catch (error) {
    console.warn('[Config] Could not load config.json, falling back to env vars', error);
    config = {
      serverUrl: import.meta.env.VITE_API_URL || '',
      authUiUrl: import.meta.env.VITE_AUTH_UI_URL || '',
      apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || '',
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
