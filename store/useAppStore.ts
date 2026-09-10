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
  craftType: string;
  tags: string[];
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
    if (role) {
      AsyncStorage.setItem('@shilpsetu_role', role).catch((e) =>
        console.error('Failed to save user role:', e)
      );
    }
  },

  setAuthToken: (token) => {
    set({ authToken: token });
    if (token) {
      AsyncStorage.setItem('@shilpsetu_token', token).catch((e) =>
        console.error('Failed to save auth token:', e)
      );
    } else {
      AsyncStorage.removeItem('@shilpsetu_token').catch((e) =>
        console.error('Failed to remove auth token:', e)
      );
    }
  },

  setArtisan: (artisan) => set({ artisan }),

  setBuyer: (buyer) => set({ buyer }),

  setSelectedLanguage: (lang) => {
    set({ selectedLanguage: lang });
    AsyncStorage.setItem('@shilpsetu_lang', lang).catch((e) =>
      console.error('Failed to save language:', e)
    );
  },

  setIsOnline: (online) => set({ isOnline: online }),

  setFontsLoaded: (loaded) => set({ isFontsLoaded: loaded }),

  updateDraftProduct: (data) => {
    const updated = { ...get().draftProduct, ...data };
    set({ draftProduct: updated });
    try {
      // Sanitize: do not write multi-megabyte base64 strings into SQLite AsyncStorage
      // Keep only file URIs (file://...) or remote URLs (http...) to avoid CursorWindow 2MB limits
      const sanitized = {
        ...updated,
        images: (updated.images || [])
          .map((img) => (typeof img === 'string' && img.startsWith('data:') ? '' : img))
          .filter(Boolean),
      };
      AsyncStorage.setItem('@shilpsetu_draft', JSON.stringify(sanitized)).catch((e) =>
        console.error('Failed to save draft product:', e)
      );
    } catch (e) {
      console.error('Failed to stringify draft product:', e);
    }
  },

  clearDraftProduct: () => {
    set({ draftProduct: {} });
    AsyncStorage.removeItem('@shilpsetu_draft').catch((e) =>
      console.error('Failed to clear draft product:', e)
    );
  },

  addOfflineWrite: (write) => {
    const queue = [...get().offlineQueue, write];
    set({ offlineQueue: queue });
    try {
      AsyncStorage.setItem('@shilpsetu_queue', JSON.stringify(queue)).catch((e) =>
        console.error('Failed to save offline queue:', e)
      );
    } catch (e) {
      console.error('Failed to stringify offline queue:', e);
    }
  },

  clearOfflineQueue: () => {
    set({ offlineQueue: [] });
    AsyncStorage.removeItem('@shilpsetu_queue').catch((e) =>
      console.error('Failed to clear offline queue:', e)
    );
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
    AsyncStorage.multiRemove(['@shilpsetu_role', '@shilpsetu_token']).catch((e) =>
      console.error('Failed to clear credentials:', e)
    );
  },

  toggleDebugFlag: (flag) => {
    set((state) => ({ [flag]: !state[flag] }));
  },

  loadPersistedState: async () => {
    try {
      // First load core auth and settings keys that are always small
      let roleVal: string | null = null;
      let tokenVal: string | null = null;
      let langVal: string | null = null;
      let queueVal: string | null = null;

      try {
        const [role, token, lang, queue] = await AsyncStorage.multiGet([
          '@shilpsetu_role',
          '@shilpsetu_token',
          '@shilpsetu_lang',
          '@shilpsetu_queue',
        ]);
        roleVal = role?.[1] || null;
        tokenVal = token?.[1] || null;
        langVal = lang?.[1] || null;
        queueVal = queue?.[1] || null;
      } catch {
        roleVal = await AsyncStorage.getItem('@shilpsetu_role').catch(() => null);
        tokenVal = await AsyncStorage.getItem('@shilpsetu_token').catch(() => null);
        langVal = await AsyncStorage.getItem('@shilpsetu_lang').catch(() => null);
        queueVal = await AsyncStorage.getItem('@shilpsetu_queue').catch(() => null);
      }

      // Safely load draftProduct with CursorWindow overflow protection
      let draftVal: string | null = null;
      try {
        draftVal = await AsyncStorage.getItem('@shilpsetu_draft');
      } catch (cursorErr: any) {
        console.warn('Oversized @shilpsetu_draft found in SQLite, clearing to avoid CursorWindow overflow');
        await AsyncStorage.removeItem('@shilpsetu_draft').catch(() => {});
      }

      const updates: Partial<AppState> = {};
      if (roleVal) {
        updates.userRole = roleVal as UserRole;
        updates.isAuthenticated = true;
        if (roleVal === 'artisan') updates.artisan = ARTISAN as typeof ARTISAN;
        if (roleVal === 'buyer') updates.buyer = BUYER as typeof BUYER;
      }
      if (tokenVal) updates.authToken = tokenVal;
      if (langVal) updates.selectedLanguage = langVal;

      if (draftVal) {
        try {
          updates.draftProduct = JSON.parse(draftVal);
        } catch (e) {
          console.warn('Failed to parse draft product JSON:', e);
        }
      }

      if (queueVal) {
        try {
          updates.offlineQueue = JSON.parse(queueVal);
        } catch (e) {
          console.warn('Failed to parse offline queue JSON:', e);
        }
      }

      set(updates);
    } catch (e: any) {
      console.warn('Failed to load persisted state:', e?.message || e);
      // Clean up corrupted draft if CursorWindow error persists
      if (String(e?.message).includes('CursorWindow')) {
        await AsyncStorage.removeItem('@shilpsetu_draft').catch(() => {});
      }
    }
  },
}));
