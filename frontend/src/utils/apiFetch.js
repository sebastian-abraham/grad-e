import { auth } from "../config/firebase";

/**
 * A wrapper around the standard `fetch` that automatically appends
 * the Firebase Auth ID Token to the Authorization header.
 * 
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} options - The fetch options.
 * @returns {Promise<Response>}
 */
export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  
  if (auth.currentUser) {
    try {
      // Force refresh if token is close to expiry maybe? Default is fine.
      const token = await auth.currentUser.getIdToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.error("Failed to get Firebase token:", error);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
