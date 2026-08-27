import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTISAN, BUYER } from '../mocks/seed';

export type UserRole = 'artisan' | 'buyer' | null;

export interface DraftProduct {
  images: string[];
  description: string;
  name: string;
  category: string;
  material: string;
  price: number;
  quantity: number;
}

export interface OfflineWrite {
  id: string;
  type: 'publish_product' | 'post_request' | 'send_offer';
  payload: Record<string, unknown>;
  timestamp: string;
}

interface AppState {
  // Auth
  userRole: UserRole;
  authToken: string | null;
  isAuthenticated: boolean;

  // User data
  artisan: typeof ARTISAN | null;
  buyer: typeof BUYER | null;

  // UI state
  selectedLanguage: string;
  isOnline: boolean;
  isFontsLoaded: boolean;

  // Product draft (add-product flow)
  draftProduct: Partial<DraftProduct>;

  // Offline queue
  offlineQueue: OfflineWrite[];

  // Debug flags
  simulateNetworkError: boolean;
  simulateAIError: boolean;
  simulateEmptyProducts: boolean;
  simulateEmptyOrders: boolean;

  // Actions
  setUserRole: (role: UserRole) => void;
  setAuthToken: (token: string | null) => void;
  setArtisan: (artisan: typeof ARTISAN | null) => void;
  setBuyer: (buyer: typeof BUYER | null) => void;
  setSelectedLanguage: (lang: string) => void;
  setIsOnline: (online: boolean) => void;
  setFontsLoaded: (loaded: boolean) => void;
  updateDraftProduct: (data: Partial<DraftProduct>) => void;
  clearDraftProduct: () => void;
  addOfflineWrite: (write: OfflineWrite) => void;
  clearOfflineQueue: () => void;
  logout: () => void;
  toggleDebugFlag: (flag: 'simulateNetworkError' | 'simulateAIError' | 'simulateEmptyProducts' | 'simulateEmptyOrders') => void;
  loadPersistedState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  userRole: null,
  authToken: null,
  isAuthenticated: false,
  artisan: null,
  buyer: null,
  selectedLanguage: 'en',
  isOnline: true,
  isFontsLoaded: false,
  draftProduct: {},
  offlineQueue: [],
  simulateNetworkError: false,
  simulateAIError: false,
  simulateEmptyProducts: false,
  simulateEmptyOrders: false,

  setUserRole: (role) => {
    set({ userRole: role, isAuthenticated: role !== null });
    if (role) AsyncStorage.setItem('@shilpsetu_role', role);
  },

  setAuthToken: (token) => {
    set({ authToken: token });
    if (token) AsyncStorage.setItem('@shilpsetu_token', token);
    else AsyncStorage.removeItem('@shilpsetu_token');
  },

  setArtisan: (artisan) => set({ artisan }),

  setBuyer: (buyer) => set({ buyer }),

  setSelectedLanguage: (lang) => {
    set({ selectedLanguage: lang });
    AsyncStorage.setItem('@shilpsetu_lang', lang);
  },

  setIsOnline: (online) => set({ isOnline: online }),

  setFontsLoaded: (loaded) => set({ isFontsLoaded: loaded }),

  updateDraftProduct: (data) => {
    const updated = { ...get().draftProduct, ...data };
    set({ draftProduct: updated });
    AsyncStorage.setItem('@shilpsetu_draft', JSON.stringify(updated));
  },

  clearDraftProduct: () => {
    set({ draftProduct: {} });
    AsyncStorage.removeItem('@shilpsetu_draft');
  },

  addOfflineWrite: (write) => {
    const queue = [...get().offlineQueue, write];
    set({ offlineQueue: queue });
    AsyncStorage.setItem('@shilpsetu_queue', JSON.stringify(queue));
  },

  clearOfflineQueue: () => {
    set({ offlineQueue: [] });
    AsyncStorage.removeItem('@shilpsetu_queue');
  },

  logout: () => {
    set({
      userRole: null,
      authToken: null,
      isAuthenticated: false,
      artisan: null,
      buyer: null,
      draftProduct: {},
    });
    AsyncStorage.multiRemove(['@shilpsetu_role', '@shilpsetu_token']);
  },

  toggleDebugFlag: (flag) => {
    set((state) => ({ [flag]: !state[flag] }));
  },

  loadPersistedState: async () => {
    try {
      const [role, token, lang, draft, queue] = await AsyncStorage.multiGet([
        '@shilpsetu_role',
        '@shilpsetu_token',
        '@shilpsetu_lang',
        '@shilpsetu_draft',
        '@shilpsetu_queue',
      ]);

      const updates: Partial<AppState> = {};
      if (role[1]) {
        updates.userRole = role[1] as UserRole;
        updates.isAuthenticated = true;
        // Re-seed the user data from mock
        if (role[1] === 'artisan') updates.artisan = ARTISAN as typeof ARTISAN;
        if (role[1] === 'buyer') updates.buyer = BUYER as typeof BUYER;
      }
      if (token[1]) updates.authToken = token[1];
      if (lang[1]) updates.selectedLanguage = lang[1];
      if (draft[1]) updates.draftProduct = JSON.parse(draft[1]);
      if (queue[1]) updates.offlineQueue = JSON.parse(queue[1]);

      set(updates);
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }
  },
}));
