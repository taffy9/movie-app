import React, { useCallback, useContext, useState } from "react";
import { IWatchlistItem } from "@/types";

const STORAGE_KEY = "watchlist";

const loadWatchlist = (): IWatchlistItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveWatchlist = (items: IWatchlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable (e.g. private browsing) — silently fall back to in-memory only
  }
};

interface WatchlistContextValue {
  watchlist: IWatchlistItem[];
  addToWatchlist: (item: IWatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

const context = React.createContext<WatchlistContextValue>({
  watchlist: [],
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false,
});

const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>(loadWatchlist);

  const addToWatchlist = useCallback((item: IWatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const next = [...prev, item];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const isInWatchlist = useCallback(
    (id: string) => watchlist.some((i) => i.id === id),
    [watchlist]
  );

  return (
    <context.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </context.Provider>
  );
};

export default WatchlistProvider;

export const useWatchlistContext = () => {
  return useContext(context);
};
