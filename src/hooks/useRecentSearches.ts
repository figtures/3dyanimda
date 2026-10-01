import { useCallback, useEffect, useState } from "react";

const KEY = "admin.recentSearches.v1";
const MAX = 8;

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);

  const push = useCallback((q: string) => {
    const v = q.trim(); if (!v) return;
    setItems((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]); try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return { items, push, clear };
}