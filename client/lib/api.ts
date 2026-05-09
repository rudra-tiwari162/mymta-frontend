/**
 * API utility functions for building correct backend URLs
 */

export function getTenantFromStorageOrHost(): string | null {
  const storedTenant = localStorage.getItem("tenant");
  if (storedTenant) {
    return storedTenant;
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    return null;
  }

  const parts = hostname.split(".");
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    return parts[0];
  }

  return null;
}

export function getBackendUrl(path: string): string {
  const tenant = getTenantFromStorageOrHost();
  if (!tenant) {
    console.warn("⚠️ No tenant found in localStorage or hostname, using default localhost URL");
  }

  const protocol = window.location.protocol;
  const port = 8000; // Backend port

  if (tenant) {
    return `${protocol}//${tenant}.localhost:${port}${path}`;
  }

  return `${protocol}//${window.location.hostname}:${port}${path}`;
}

export async function apiCall(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access_token");
  const url = getBackendUrl(path);

  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Clone response to read body without consuming it
    const cloned = response.clone();
    try {
      const errorText = await cloned.text();
      console.error(`❌ API Error (${response.status}) at ${path}:`, errorText);
    } catch (e) {
      console.error(`❌ API Error (${response.status}) at ${path}: (could not read body)`);
    }
  }

  return response;
}

export async function fetchPortalPosts() {
  const response = await apiCall("/api/operations/portal-posts/");
  if (!response.ok) throw new Error("Failed to fetch portal posts");
  
  const data = await response.json();
  return Array.isArray(data) ? data.map((post: any) => ({
    ...post,
    author: post.author ?? post.posted_by_name,
  })) : [];
}
