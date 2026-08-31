/**
 * services/api.ts — ShilpSetu AI Mock API Layer
 *
 * All functions simulate async operations with realistic delays.
 * To swap in a real backend, replace only these functions — no screen component changes needed.
 *
 * AI operations use a "weaving thread" simulation:
 * - Image processing: 2.5s
 * - Voice processing: 2.0s
 * - Catalog generation: 3.0s
 * - AI pricing: 1.5s
 * - AI assistant response: 1.5–2.5s
 */
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import {
  ARTISAN,
  BUYER,
  BUYER_REQUEST,
  BUYER_REQUESTS_LIST,
  DISCOVER_PRODUCTS,
  MESSAGES,
  NOTIFICATIONS,
  ORDER,
  PRODUCT,
  SAMPLE_PRODUCTS,
  AI_INSIGHTS,
  AI_ASSISTANT_MESSAGES,
} from '../mocks/seed';

// ─── Helpers ────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const simulateFailure = (shouldFail: boolean, message: string) => {
  if (shouldFail) throw new Error(message);
};

// Point this at your running server (see /server). Set EXPO_PUBLIC_API_URL in a
// .env at the project root for device/emulator testing, e.g.
// EXPO_PUBLIC_API_URL=http://192.168.1.5:4000
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as any)?.apiUrl ||
  'http://localhost:4000';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const sendOTP = async (phone: string): Promise<{ success: boolean; message: string }> => {
  await delay(1000);
  console.log(`[API] OTP sent to ${phone}`);
  return { success: true, message: 'OTP sent to ' + phone };
};

export const verifyOTP = async (
  phone: string,
  otp: string,
  role: 'artisan' | 'buyer'
): Promise<{ success: boolean; token: string; isNewUser: boolean }> => {
  await delay(1500);
  // Mock: any 6-digit OTP works
  if (otp.length !== 6) throw new Error('Invalid OTP. Please enter 6 digits.');
  console.log(`[API] OTP verified for ${phone} as ${role}`);
  return {
    success: true,
    token: `mock_token_${role}_${Date.now()}`,
    isNewUser: role === 'artisan', // Artisans always go through onboarding in demo
  };
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const setupArtisanProfile = async (data: {
  name: string;
  crafts: string[];
  location: string;
  experience: number;
}): Promise<typeof ARTISAN> => {
  await delay(1500);
  console.log('[API] Artisan profile setup:', data);
  return ARTISAN;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getMyProducts = async (options?: { simulateEmpty?: boolean }) => {
  await delay(500);
  if (options?.simulateEmpty) return [];
  return SAMPLE_PRODUCTS;
};

export const getProductById = async (id: string) => {
  await delay(300);
  const product = SAMPLE_PRODUCTS.find((p) => p.id === id) || PRODUCT;
  return product;
};

export const getDiscoverProducts = async (filters?: {
  category?: string;
  search?: string;
}) => {
  await delay(300);
  let products = DISCOVER_PRODUCTS;
  if (filters?.category && filters.category !== 'all') {
    const cat = filters.category.toLowerCase();
    products = products.filter((p) => {
      const c = (p.category || '').toLowerCase();
      const ct = (p.craftType || '').toLowerCase();
      const m = (p.material || '').toLowerCase();
      const tags = (p.tags || []).join(' ').toLowerCase();
      return c.includes(cat) || ct.includes(cat) || m.includes(cat) || tags.includes(cat);
    });
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.origin && p.origin.toLowerCase().includes(q))
    );
  }
  return products;
};

// ─── AI — Image Processing ───────────────────────────────────────────────────

export const processImages = async (
  imageUris: string[],
  options?: { simulateError?: boolean }
): Promise<{
  processedImages: string[];
  suggestedBackground: 'white' | 'ivory' | 'natural';
  enhancements: string[];
}> => {
  await delay(2500); // Weaving thread shows for 2.5s
  simulateFailure(options?.simulateError ?? false, 'Image processing failed. Please try again.');
  console.log('[API] Images processed:', imageUris.length);
  return {
    processedImages: imageUris,
    suggestedBackground: 'ivory',
    enhancements: ['Background removed', 'Brightness adjusted', 'Sharpness enhanced'],
  };
};

// ─── AI — Voice Processing ───────────────────────────────────────────────────

export const processVoice = async (
  audioUri: string,
  options?: { simulateError?: boolean }
): Promise<{
  transcription: string;
  detectedLanguage: string;
  extractedAttributes: {
    productName?: string;
    material?: string;
    craftType?: string;
    size?: string;
    description?: string;
  };
}> => {
  if (options?.simulateError) {
    await delay(500);
    simulateFailure(true, 'Voice recognition failed. Please try again.');
  }

  const uploadResult = await FileSystem.uploadAsync(
  `${API_BASE_URL}/api/voice/process`,
  audioUri,
  {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'audio',
    mimeType: 'audio/m4a',
    parameters: {},
  }
);

if (uploadResult.status < 200 || uploadResult.status >= 300) {
  let message = 'Voice recognition failed. Please try again.';
  try {
    message = JSON.parse(uploadResult.body).error || message;
  } catch {}
  throw new Error(message);
}

const result = JSON.parse(uploadResult.body);
console.log('[API] Voice processed from:', audioUri);
return result;
};

// ─── AI — Catalog Generation ─────────────────────────────────────────────────

export const generateCatalog = async (
  draft: {
    images: string[];
    voiceTranscription?: string;
    manualDescription?: string;
    attributes?: { material?: string; craftType?: string };
  },
  options?: { simulateError?: boolean }
): Promise<typeof PRODUCT> => {
  if (options?.simulateError) {
    await delay(500);
    simulateFailure(true, 'Catalog generation failed. Please try again.');
  }

  const response = await fetch(`${API_BASE_URL}/api/catalog/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voiceTranscription: draft.voiceTranscription,
      manualDescription: draft.manualDescription,
      attributes: draft.attributes,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Catalog generation failed. Please try again.');
  }

  const generated = await response.json();
  console.log('[API] Catalog generated from draft');
  // Merge into PRODUCT shape so screens relying on other PRODUCT fields (images, etc.) still work
  return { ...PRODUCT, ...generated, images: draft.images?.length ? draft.images : PRODUCT.images };
};

// ─── AI — Pricing ────────────────────────────────────────────────────────────

export const getAIPricing = async (
  productData: { name: string; category: string; material: string; quantity: number }
): Promise<{
  suggested: number;
  min: number;
  max: number;
  reasoning: string;
  marketInsight: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/pricing/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Pricing estimate failed. Please try again.');
  }

  return response.json();
};

// ─── AI — Product Publishing ─────────────────────────────────────────────────

export const publishProduct = async (
  product: Partial<typeof PRODUCT>,
  options?: { isOffline?: boolean }
): Promise<{ productId: string; published: boolean }> => {
  if (options?.isOffline) {
    // Save to offline queue — actual publish on reconnect
    const queued = await AsyncStorage.getItem('@shilpsetu_queue');
    const queue = queued ? JSON.parse(queued) : [];
    queue.push({ type: 'publish_product', payload: product, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem('@shilpsetu_queue', JSON.stringify(queue));
    console.log('[API] Product queued for offline publish');
    return { productId: product.id || 'draft-' + Date.now(), published: false };
  }
  await delay(1000);
  console.log('[API] Product published:', product.name);
  return { productId: product.id || 'product-' + Date.now(), published: true };
};

// ─── Buyers ──────────────────────────────────────────────────────────────────

export const getBuyerRequests = async (options?: { simulateEmpty?: boolean }) => {
  await delay(600);
  if (options?.simulateEmpty) return [];
  return BUYER_REQUESTS_LIST;
};

export const getBuyerRequestById = async (id: string) => {
  await delay(300);
  return BUYER_REQUESTS_LIST.find((r) => r.id === id) || BUYER_REQUEST;
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = async (options?: { simulateEmpty?: boolean }) => {
  await delay(500);
  if (options?.simulateEmpty) return [];
  return [ORDER];
};

export const getOrderById = async (id: string) => {
  await delay(300);
  return ORDER;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  await delay(800);
  console.log('[API] Order status updated:', orderId, status);
  return { success: true };
};

// ─── Offers ──────────────────────────────────────────────────────────────────

export const sendOffer = async (offer: {
  requestId: string;
  quantity: number;
  pricePerUnit: number;
  deliveryDate: string;
  message: string;
}): Promise<{ offerId: string; sent: boolean }> => {
  await delay(1200);
  console.log('[API] Offer sent:', offer);
  return { offerId: 'offer-' + Date.now(), sent: true };
};

export const postBulkRequest = async (request: {
  category: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  requirements: string;
}): Promise<{ requestId: string; posted: boolean }> => {
  await delay(1200);
  console.log('[API] Bulk request posted:', request);
  return { requestId: 'request-' + Date.now(), posted: true };
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const getMessages = async (threadId: string) => {
  await delay(400);
  return MESSAGES.filter((m) => m.threadId === threadId);
};

export const sendMessage = async (threadId: string, text: string, senderId: string) => {
  await delay(300);
  const message = {
    id: 'msg-' + Date.now(),
    threadId,
    senderId,
    senderName: 'You',
    text,
    timestamp: new Date().toISOString(),
    isMe: true,
  };
  console.log('[API] Message sent:', text);
  return message;
};

// ─── AI Assistant ─────────────────────────────────────────────────────────────

export const getAIAssistantResponse = async (
  message: string,
  options?: { simulateError?: boolean }
): Promise<string> => {
  const delay_ms = 1500 + Math.random() * 1000;
  await delay(delay_ms);
  simulateFailure(options?.simulateError ?? false, 'AI assistant is unavailable. Please try again.');

  const responses: Record<string, string> = {
    pricing:
      'Based on current market trends, your Bamboo Basket at ₹899 is competitively priced. Consider seasonal pricing — you could increase to ₹999–1,050 during the festive season (September–November) when demand peaks.',
    buyers:
      'You have a 94% match with Heritage Living Pvt. Ltd. for 500 units. I recommend responding to their request within 24 hours — early responders have a 3x higher chance of closing the deal.',
    orders:
      'Your order #SS1024 from Heritage Living is in production. You are on track for the September 20th delivery. Remember to update milestones as you complete each batch.',
    help:
      'I can help you with: pricing strategy, finding buyers, improving your product descriptions, order management, and market insights. What would you like to explore?',
    default:
      'That is a great question, Sita ji! Based on your craft profile and current market data, I can see several opportunities for your business. Your Madhubani bamboo craft is in high demand in metropolitan markets. Would you like specific advice on pricing, buyer outreach, or product listing improvements?',
  };

  const lower = message.toLowerCase();
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('rate')) return responses.pricing;
  if (lower.includes('buyer') || lower.includes('customer') || lower.includes('sell')) return responses.buyers;
  if (lower.includes('order') || lower.includes('delivery')) return responses.orders;
  if (lower.includes('help') || lower.includes('what can you')) return responses.help;
  return responses.default;
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async () => {
  await delay(400);
  return NOTIFICATIONS;
};

export const markAllNotificationsRead = async () => {
  await delay(300);
  return { success: true };
};

// ─── Offline Queue Flush ─────────────────────────────────────────────────────

export const flushOfflineQueue = async (
  queue: Array<{ type: string; payload: Record<string, unknown> }>
): Promise<void> => {
  console.log('[API] Flushing offline queue:', queue.length, 'items');
  for (const item of queue) {
    await delay(500);
    if (item.type === 'publish_product') {
      await publishProduct(item.payload as Partial<typeof PRODUCT>);
    } else if (item.type === 'post_request') {
      await postBulkRequest(item.payload as Parameters<typeof postBulkRequest>[0]);
    }
    console.log('[API] Flushed:', item.type);
  }
  await AsyncStorage.removeItem('@shilpsetu_queue');
};

export const getArtisanProfile = async () => {
  await delay(400);
  return ARTISAN;
};

export const getAIInsights = async () => {
  await delay(600);
  return AI_INSIGHTS;
};
