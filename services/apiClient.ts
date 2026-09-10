/**
 * services/apiClient.ts
 *
 * Centralized HTTP Client for ShilpSetu Frontend (Expo Mobile & Web)
 * - Base URL configuration with auto-detection (Web, LAN, Emulator)
 * - JWT Token interceptor from AsyncStorage
 * - Normalized ApiError class with status and network detection
 * - AbortController / Signal support for race condition prevention
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const AUTH_TOKEN_KEY = '@shilpsetu_auth_token';

/** Normalized Application API Error */
export class ApiError extends Error {
  public status: number;
  public data?: any;
  public isNetworkError: boolean;

  constructor(status: number, message: string, data?: any, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface RequestOptions extends RequestInit {
  signal?: AbortSignal | null;
  skipAuth?: boolean;
}

class ApiClient {
  private customBaseUrl: string | null = null;

  public setBaseUrl(url: string): void {
    this.customBaseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;

    const envUrl = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : null;
    if (envUrl && envUrl.startsWith('http')) {
      return envUrl.replace(/\/$/, '');
    }

    // Web Browser runtime
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:5001`;
    }

    // Expo Go / Native LAN detection
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip) {
        if (Platform.OS === 'android' && (ip === 'localhost' || ip === '127.0.0.1')) {
          return 'http://10.0.2.2:5001';
        }
        return `http://${ip}:5001`;
      }
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }

    return 'http://localhost:5001';
  }

  public async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) return token;
      return await AsyncStorage.getItem('@shilpsetu_token');
    } catch {
      return null;
    }
  }

  public async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem('@shilpsetu_token', token);
  }

  public async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem('@shilpsetu_token');
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!options.skipAuth) {
      const token = await this.getAuthToken();
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type') || '';
      let responseData: any;

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const errorMsg =
          (typeof responseData === 'object' && (responseData?.error || responseData?.message)) ||
          `Request failed with status ${response.status}`;
        throw new ApiError(response.status, errorMsg, responseData, false);
      }

      return responseData as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err; // Re-throw abort so component hooks can ignore it cleanly
      }

      if (err instanceof ApiError) {
        throw err;
      }

      throw new ApiError(0, err?.message || 'Network connection failure', null, true);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
