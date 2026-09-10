# ShilpSetu — API Integration Status Matrix

This document provides the verified integration mapping between the `ShilpSetu` frontend (Expo / React Native) and the `ShilpSetu-Backend` (Node.js / Express / Prisma).

---

## 1. API Integration Matrix

| Backend API Endpoint | Frontend Screen / Component | HTTP Method | Auth Status | Integration Status | Data Handled & Notes |
|---|---|---|---|---|---|
| `/health` | Core API Client (`systemApi.checkHealth`) | `GET` | Public | **Connected** | Server status & uptime check. Returns `{ status: 'ok', timestamp }`. |
| `/api/auth/send-otp` | `app/(auth)/artisan-login.tsx`<br>`app/(auth)/buyer-login.tsx` | `POST` | Public | **Connected** | Dispatches real 6-digit SMS verification code to provided phone. |
| `/api/auth/verify-otp` | `app/(auth)/artisan-otp.tsx`<br>`app/(auth)/buyer-otp.tsx` | `POST` | Public | **Connected** | Verifies OTP code, returns real JWT token & User object with explicit ID, persisted into `AsyncStorage`. |
| `/api/auth/signin` | `authApi.signIn` | `POST` | Public | **Connected** | Direct credential authentication (phone + password), saves JWT token. |
| `/api/auth/signup` | `authApi.signUp` | `POST` | Public | **Connected** | New artisan registration with phone, password, and name. |
| `/api/studio-styles` | `imageStudioApi.getStyles` | `GET` | Public | **Connected** | Lists available studio backdrops (`white_studio`, `wooden_surface`, etc.). |
| `/api/studio-styles/:id/preview` | `imageStudioApi.getStylePreviewUrl` | `GET` | Public | **Connected** | Direct PNG image URL for photoshoot backdrops. |
| `/api/image-batches/upload` | `app/(artisan-flow)/image-processing.tsx` | `POST` | Authenticated | **Connected** | Real multipart photo upload; triggers background removal via Poof.bg and Cloudinary studio enhancement. |
| `/api/image-batches/:id` | `imageStudioApi.getBatchStatus` | `GET` | Authenticated | **Connected** | Polls status of image background removal job (`PENDING`, `PROCESSING`, `COMPLETED`). |
| `/api/voice/process` | `app/(artisan-flow)/voice-description.tsx` | `POST` | Hybrid/Public | **Connected** | Multipart audio upload (`.m4a`/`.wav`); transcribes via Whisper STT and extracts craft attributes. |
| `/api/catalog/generate` | `app/(artisan-flow)/catalog-generation.tsx` | `POST` | Public | **Connected** | Generates bilingual catalog listing (English + Hindi), dimensions, tags, and care instructions. |
| `/api/catalog/:productId/save` | `catalogApi.saveCatalog` | `POST` | Authenticated | **Connected** | Saves generated title, description, and keywords to product record in database. |
| `/api/catalog/:productId` | `app/(buyer)/product/[id].tsx`<br>`getProductById` | `GET` | Public | **Connected** | Fetches saved product catalog details by product ID. |
| `/api/catalog/:artisanId/pdf` | `catalogApi.getPdfDownloadUrl` | `GET` | Authenticated | **Connected** | Generates downloadable, printable artisan brochure PDF. |
| `/api/pricing/estimate` | `app/(artisan-flow)/pricing.tsx` | `POST` | Public | **Connected** | Dynamic ML pricing calculation based on raw materials, craft complexity, hours, and market prices. |
| `/api/pricing/:productId/save` | `pricingApi.savePricing` | `POST` | Authenticated | **Connected** | Saves suggested price and margin breakdown to database. |
| `/api/pricing/:productId` | `pricingApi.getPricing` | `GET` | Public | **Connected** | Retrieves saved pricing records. |
| `/api/public/stores/:slug` | `app/(artisan)/products/index.tsx`<br>`app/(buyer)/discover.tsx` | `GET` | Public | **Connected** | Fetches live artisan storefront with published products and craft details. |
| `/api/public/stores/:slug/qr.png` | `marketApi.getStoreQrCodeUrl` | `GET` | Public | **Connected** | Generates direct PNG QR code image pointing to public storefront. |
| `/api/public/inquiries` | `app/bulk-request.tsx` | `POST` | Public | **Connected** | Submits institutional/retail B2B wholesale inquiry. |
| `/api/artisan/inquiries` | `app/(artisan)/buyers/index.tsx` | `GET` | Authenticated | **Connected** | Fetches inbound buyer inquiries for authenticated artisan. |
| `/api/products/:productId/publish`| `app/(artisan-flow)/publish-success.tsx` | `POST` | Authenticated | **Connected** | Publishes product simultaneously across ONDC, GeM, and Amazon. |
| `/api/exports/ondc/:productId` | `marketApi.getOndcExport` | `GET` | Authenticated | **Connected** | Exports product translated to standard ONDC RET10 schema. |
| `/api/exports/gem/:productId` | `marketApi.getGemExport` | `GET` | Authenticated | **Connected** | Exports product translated to Government e-Marketplace (GeM) schema. |
| `/api/admin/dashboard` | `app/(artisan)/home.tsx` (`getAIInsights`) | `GET` | Admin | **Connected** | Returns live community impact, artisan counts, and economic uplift metrics. |
| `/api/admin/regional` | `adminApi.getRegionalBreakdown` | `GET` | Admin | **Connected** | State and district artisan craft distribution. |
| `/api/i18n/:lang` | `systemApi.getLanguageDictionary` | `GET` | Public | **Connected** | Fetches localized UI strings for 8 Indian regional languages. |

---

## 2. Backend APIs with No Frontend Usage
- `/api/admin/reports/csv`: Administrative CSV download endpoint (used by government ministry portal rather than mobile artisan app).
- `/api/admin/audit-logs`: Security and admin audit logging.
- `/api/artisan/connections`: Marketplace credential management.

---

## 3. Frontend Features Without Backend API
- **In-App Direct Chat Messaging (`app/chat/[threadId].tsx`)**: Handled via offline storage with AI assistant fallback (`getAIAssistantResponse`).
- **Push Notification Triggering**: Local mock notifications with read status persistence in AsyncStorage.

---

## 4. Environment Variables Required

### Frontend (`D:\ShilpSetu\.env`):
```env
# URL pointing to ShilpSetu-Backend
# For Android Emulator use: http://10.0.2.2:5001
# For iOS Simulator / Web use: http://localhost:5001
# For Physical Device on LAN use: http://<YOUR_LOCAL_IP>:5001
EXPO_PUBLIC_API_URL=http://localhost:5001
```

### Backend (`D:\ShilpSetu-Backend\.env`):
```env
PORT=5001
DATABASE_URL="postgresql://shilpsetu:shilpsetu@localhost:5433/shilpsetu"
JWT_SECRET="V8i9rhMVSEz+8dwlqj7Qx8QRTTupqmB5lwtAYOLIEocYerJqMYI2zEBxI6LzJwVI"
GEMINI_API_KEY="..."
GROQ_API_KEY="..."
POOF_BG_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
```

---

## 5. Verification Checklist
- **TypeScript**: PASS (0 errors on both frontend and backend)
- **Live Health Endpoint**: PASS (`GET /health` -> `{ status: "ok" }`)
- **Real ML Pricing API**: PASS (`POST /api/pricing/estimate` -> 200 OK)
- **Real Bilingual Catalog Generation**: PASS (`POST /api/catalog/generate` -> 200 OK)
- **Backward Compatibility**: PASS (All named imports preserved across all 20 screens)
