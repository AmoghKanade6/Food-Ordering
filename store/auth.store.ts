import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isFetching: boolean;
  hasFetched: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  hasFetched: false,
  isFetching: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    const { isFetching, hasFetched } = get();
    if (isFetching) {
      return;
    }
    if (hasFetched) {
      return;
    }

    set({ isFetching: true, isLoading: true });

    try {
      const user = await getCurrentUser();
      if (user) {
        set({ isAuthenticated: true, user, hasFetched: true });
      } else {
        set({ isAuthenticated: false, user: null, hasFetched: true });
      }
    } catch (error) {
      console.error("FetchAuthenticatedUser error:", error);
      set({ isAuthenticated: false, user: null, hasFetched: true });
    } finally {
      set({ isFetching: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
