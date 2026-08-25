// Lightweight Redux Toolkit persistence: load the saved store state on
// startup and write it back to localStorage whenever the store changes.
// This keeps the user logged in and preserves UI preferences across refreshes.

const STORAGE_KEY = "erp_state";

/**
 * Load persisted state to seed the store's preloadedState.
 * Returns undefined when nothing is stored (so slice initialState is used).
 */
export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // One-time migration from the older per-key format (erp_user / erp_token).
    const legacyUser = localStorage.getItem("erp_user");
    const legacyToken = localStorage.getItem("erp_token");
    if (legacyUser && legacyToken) {
      localStorage.removeItem("erp_user");
      localStorage.removeItem("erp_token");
      return {
        auth: { user: JSON.parse(legacyUser), token: legacyToken, status: "idle", error: null },
        ui: { loadingCount: 0, sidebarOpen: true },
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Persist only the slices worth saving (auth session + UI preferences).
 * Transient fields like request status/errors are intentionally dropped.
 */
export const saveState = (state) => {
  try {
    const toPersist = {
      auth: {
        user: state.auth.user,
        token: state.auth.token,
        status: "idle",
        error: null,
      },
      ui: {
        loadingCount: 0,
        sidebarOpen: state.ui.sidebarOpen,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // Ignore write errors (e.g. storage full or unavailable).
  }
};

/**
 * Simple trailing throttle so we don't write to localStorage on every action.
 */
export const throttle = (fn, wait = 500) => {
  let last = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
};
