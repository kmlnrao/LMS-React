import { apiRequest } from "./queryClient";
import { UserSession, LoginCredentials } from "@/types";
import { queryClient } from "./queryClient";

export async function login(credentials: LoginCredentials): Promise<UserSession> {
  try {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout", {});
    // Clear any cached data
    queryClient.clear();
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function checkSession(): Promise<UserSession | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/session", undefined);
    const data = await response.json();
    return data;
  } catch (error) {
    // Session check failed, user is likely not authenticated
    return null;
  }
}

export function hasRole(session: UserSession | null, role: string | string[]): boolean {
  if (!session || !session.user) return false;
  
  const userRole = session.user.role;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
}
