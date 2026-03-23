## TTS Implementation - Clean Migration Guide

### What Changed

This is a **complete replacement** of the broken TTS system with a **secure, Service Account-based** approach.

#### ❌ What Was Removed

Old broken/insecure approach that attempted to:
- ❌ Reuse translation API key for TTS
- ❌ Call Google TTS API directly from frontend
- ❌ Expose API credentials to client-side code
- ❌ Had permissions and CSP policy errors

#### ✅ What Was Added

New secure implementation:
- ✅ `src/app/api/tts/route.ts` - Backend API using Service Account OAuth
- ✅ Updated `src/lib/textToSpeech.ts` - Frontend utilities (playAudio, stopAudio)
- ✅ Updated `src/hooks/useTextToSpeech.ts` - Calls secure backend API
- ✅ `.env` documentation for Service Account setup
- ✅ `TTS_SETUP.md` - Complete setup guide
- ✅ Updated `.gitignore` - Protects credentials

#### ✅ What Stayed The Same

Everything important was preserved:
- ✅ Translation system (`src/app/api/translate/route.ts`) - **UNCHANGED**
- ✅ Translation API key (`GOOGLE_TRANSLATE_API_KEY`) - **UNCHANGED**
- ✅ Floating speaker button UI component
- ✅ Language selection and storage
- ✅ All other app features

---

### Key Differences

| Aspect | Old (Broken) | New (Secure) |
|--------|------------|-----------|
| **Authentication** | API Key | Service Account → OAuth 2.0 |
| **Frontend Call** | Direct to Google | Local to `/api/tts` |
| **API Key Location** | Frontend & Backend mix | Backend only |
| **Credentials** | Shared (translation + TTS) | Separate (isolated) |
| **Security** | ❌ Exposed | ✅ Protected |
| **Setup Complexity** | Failed | Simple (3 steps) |

---

### Setup Instructions (3 Steps)

#### Step 1: Create Service Account (5 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **IAM & Admin** → **Service Accounts**
3. Create service account: `suvidha-tts`
4. Grant role: **Cloud Text-to-Speech Editor**
5. Download JSON key

#### Step 2: Add to Environment (1 minute)
1. Create or edit `.env.local` (already in .gitignore)
2. Add:
```
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```
(Paste the entire downloaded JSON as a single-line string)

#### Step 3: Enable API (1 minute)
1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Search for **Cloud Text-to-Speech API**
3. Click **Enable**

Done! ✅

---

### How to Use

For end users, nothing changed:
1. Go to kiosk page
2. Select a language
3. Click speaker button (🔊 bottom-right)
4. Page reads aloud in selected language

---

### File Changes Summary

```
CREATED:
├── TTS_SETUP.md                           (Setup guide)
└── src/app/api/tts/route.ts              (Core: Service Account auth)

MODIFIED:
├── src/lib/textToSpeech.ts               (Removed: synthesizeSpeech function)
├── src/hooks/useTextToSpeech.ts          (Updated: calls /api/tts)
├── .env                                   (Added: Service Account documentation)
└── .gitignore                             (Added: credential file protection)

UNTOUCHED (Preserved):
├── src/app/api/translate/route.ts         ✅ Translation still works
├── .env (GOOGLE_TRANSLATE_API_KEY)        ✅ Translation API key intact
├── All UI components                      ✅ Speaker button works
└── All other features                     ✅ Everything else unchanged
```

---

### API Endpoint Reference

#### POST /api/tts

**Request:**
```json
{
  "text": "The translated page text...",
  "lang": "hi"
}
```

**Response:**
```json
{
  "audioContent": "//NExAAR..."  // base64 MP3
}
```

**Error Response:**
```json
{
  "error": "Language 'xx' not supported"
}
```

---

### Code Changes

#### Before (Old, Broken)
```typescript
// Old: Tried to call Google API from frontend
const audioBlob = await synthesizeSpeech(text, languageCode);
// ❌ Exposed API key, permission errors, CSP violations
```

#### After (New, Secure)
```typescript
// New: Call backend API with Service Account
const response = await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({ text, lang: 'hi' }),
});
const { audioContent } = await response.json();
await playAudio(audioContent);
// ✅ Secure, no credentials exposed, OAuth 2.0 protected
```

---

### Verification Checklist

After setup, verify:
- [ ] `.env.local` created with `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] Service Account has "Cloud Text-to-Speech Editor" role
- [ ] Cloud Text-to-Speech API is enabled
- [ ] Dev server started: `npm run dev`
- [ ] Page loads: `http://localhost:3000/kiosk`
- [ ] Select language and click speaker button
- [ ] Audio plays and page reads aloud

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "GOOGLE_SERVICE_ACCOUNT_JSON not set" | Check `.env.local` exists and has proper JSON |
| "Failed to generate access token" | Verify JSON is valid (copy from Google again) |
| "API not enabled" | Enable it in Google Cloud APIs & Services |
| "Language not supported" | Add to LANGUAGE_VOICE_MAP in route.ts |
| "Works locally but not in production" | Add GOOGLE_SERVICE_ACCOUNT_JSON to production env vars |

---

### Why This Approach

✅ **Secure:** Credentials in server environment, never in client code
✅ **Isolated:** TTS service account separate from translation API key
✅ **Standard:** Uses google-auth-library, industry best practice
✅ **Scalable:** Works in localhost, staging, and production
✅ **Clean:** Minimal code, no duplication or confusion
✅ **Protected:** .gitignore prevents accidental commits of credentials

---

### Next Steps

1. Follow `TTS_SETUP.md` for detailed setup instructions
2. Test the speaker button on the kiosk page
3. Add more languages to `LANGUAGE_VOICE_MAP` if needed
4. All done! Translation + TTS now working together securely

---

### Questions or Issues?

- Check logs: `npm run dev` will show any service account errors
- Verify API is enabled in Google Cloud Console
- Ensure JSON key is valid JSON (paste in jsonlint.com to verify)
- Check that service account has correct role

