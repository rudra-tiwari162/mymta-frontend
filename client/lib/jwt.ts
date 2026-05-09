/**
 * JWT utility functions for token handling
 */

export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;

    // Extract role from Auth0 custom claim
    const roles = payload['https://mymta.com/roles'];
    if (Array.isArray(roles) && roles.length > 0) {
      // Convert "ADMIN" to "admin", "EMPLOYEE" to "employee"
      return roles[0].toLowerCase();
    }

    return null;
  } catch (error) {
    console.error('Failed to extract role from token:', error);
    return null;
  }
}

export function getTenantFromToken(token: string): string | null {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;

    // Extract tenant from Auth0 custom claim
    return payload['https://mymta.com/tenant'] || null;
  } catch (error) {
    console.error('Failed to extract tenant from token:', error);
    return null;
  }
}
