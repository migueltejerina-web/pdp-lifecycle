import "server-only";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

function getAccessToken(): string | null {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim();
  return token || null;
}

export function isHubSpotConfigured(): boolean {
  return Boolean(getAccessToken());
}

export async function hubSpotFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  const response = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HubSpot API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
