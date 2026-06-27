import { useQuery } from "@tanstack/react-query";

const FALLBACK_RATE = 1450;

export async function fetchUsdToRwfRate(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.exchangerate.host/convert?from=USD&to=RWF",
    );
    const data = await response.json();
    if (data.result && typeof data.result === "number") {
      return Math.round(data.result);
    }
    return FALLBACK_RATE;
  } catch {
    return FALLBACK_RATE;
  }
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchangeRate", "USD", "RWF"],
    queryFn: fetchUsdToRwfRate,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
    retry: 2,
    initialData: FALLBACK_RATE,
  });
}

export function convertUsdToRwf(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate);
}
