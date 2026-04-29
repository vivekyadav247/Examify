import { useCallback, useState, useEffect } from "react";

export function useApiClient() {
  const [token, setTokenState] = useState(() => localStorage.getItem("examify_token"));
  
  const isSignedIn = !!token;
  const isLoaded = true;

  const setToken = useCallback((t) => {
    if (t) {
      localStorage.setItem("examify_token", t);
    } else {
      localStorage.removeItem("examify_token");
    }
    setTokenState(t);
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem("examify_token");
    if (!currentToken && url !== "/api/users/login/" && url !== "/api/users/signup/") {
      throw new Error("not_signed_in");
    }

    const headers = new Headers(options.headers || {});
    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });
    
    if (res.status === 401 && url !== "/api/users/login/") {
      setToken(null);
      if (window.location.pathname !== "/sign-in" && window.location.pathname !== "/sign-up") {
        window.location.href = "/sign-in";
      }
    }
    return res;
  }, [setToken]);

  return { apiFetch, isLoaded, isSignedIn, setToken, token };
}
