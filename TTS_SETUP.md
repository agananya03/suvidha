## Text-to-Speech (TTS) Setup Guide

This guide explains how to set up the **secure, Service Account-based** Text-to-Speech system.

### Architecture

```
User Clicks Speaker Button
    ↓
Frontend Hook: useTextToSpeech()
    ↓
POST /api/tts (Local, Secure)
    ↓
Backend: Uses Service Account Credentials
    ↓
Google Cloud Text-to-Speech API
    ↓
Returns: MP3 (base64) → Frontend Plays Audio
```

**✅ SECURE:** API credentials never exposed to frontend
**✅ ISOLATED:** Uses separate Service Account, not translation API key
**✅ CLEAN:** Uses google-auth-library for OAuth 2.0 token generation

---

## Setup Steps

### 1. Create Service Account in Google Cloud

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Select your project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **+ Create Service Account**
5. Fill details:
   - **Service Account Name:** `suvidha-tts`
   - **Description:** `Text-to-Speech for Suvidha Kiosk`
   - Click **Create and Continue**
6. Grant Role:
   - Select **Cloud Text-to-Speech Editor** (or `roles/texttospeech.editor`)
   - Click **Continue** → **Done**

### 2. Create and Download JSON Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON** format
5. Click **Create**
6. A JSON file will download (e.g., `suvidha-tts-xxxxx.json`)
7. **KEEP THIS FILE SAFE** - It contains credentials

### 3. Add to Environment Variables

#### Option A: Using .env.local (Recommended for Development)

1. Create/Edit `.env.local` in your project root:
```bash
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"suvidha-tts@...gserviceaccount.com",...}'
```

2. Copy the entire JSON key content (including the `{...}` brackets) as a single line string
3. Paste it as the value

#### Option B: Using Environment Variables in Production

For Vercel/production:
1. Go to your deployment settings (e.g., Vercel → Environment Variables)
2. Add: `GOOGLE_SERVICE_ACCOUNT_JSON` = (paste the full JSON)

### 4. Enable the Text-to-Speech API

1. Go to **[APIs & Services](https://console.cloud.google.com/apis/dashboard)**
2. Click **+ Enable APIs and Services**
3. Search for **"Cloud Text-to-Speech API"**
4. Click on it and press **Enable**

### 5. Test the Setup

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/kiosk`
3. Select a language (e.g., Hindi)
4. Click the speaker button (🔊 in bottom-right)
5. You should hear the page content read aloud

---

## How It Works

### Frontend (useTextToSpeech Hook)

```typescript
// 1. Extract all page text
const pageText = extractPageText();

// 2. Call backend API
const response = await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({
    text: pageText,
    lang: 'hi',  // Language code
  }),
});

// 3. Get base64 audio
const { audioContent } = await response.json();

// 4. Play audio
await playAudio(audioContent);
```

### Backend (API Route)

```
1. Receive { text, lang }
2. Generate OAuth 2.0 access token using Service Account
3. Call Google Text-to-Speech API with Bearer token
4. Receive MP3 audio (base64)
5. Return to client
```

---

## Language Support

The system supports 20+ Indian languages:

| Code | Language | Voice |
|------|----------|-------|
| `en` | English | en-US-Neural2-C |
| `hi` | Hindi | hi-IN-Neural2-A |
| `ml` | Malayalam | ml-IN-Neural2-A |
| `ta` | Tamil | ta-IN-Neural2-A |
| `te` | Telugu | te-IN-Neural2-A |
| `bn` | Bengali | bn-IN-Neural2-A |
| `pa` | Punjabi | pa-IN-Neural2-A |
| `gu` | Gujarati | gu-IN-Neural2-A |
| `kn` | Kannada | kn-IN-Neural2-A |
| `mr` | Marathi | mr-IN-Neural2-A |
| ... | ... | ... |

Add more languages in `src/app/api/tts/route.ts` in the `LANGUAGE_VOICE_MAP` object.

---

## Troubleshooting

### Error: `GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set`
- Make sure `.env.local` exists and contains the JSON
- Restart your dev server
- Ensure the JSON is properly formatted (single line, escaped quotes)

### Error: `Failed to generate access token`
- Verify the JSON is valid (copy from Google Cloud again)
- Ensure the service account has the correct role

### Error: `Cloud Text-to-Speech API ... not enabled`
- Go to APIs & Services in Google Cloud Console
- Enable "Cloud Text-to-Speech API"

### Audio plays but quality is poor
- Adjust `speakingRate` in `/api/tts/route.ts` (default: 1.0)
- Try different voices in `LANGUAGE_VOICE_MAP`

### Works on localhost but not in production
- Add `GOOGLE_SERVICE_ACCOUNT_JSON` to production environment variables
- Use the same JSON value from your .env.local

---

## File Structure

```
suvidha/
├── .env                              # Env template (no secrets)
├── .env.local                        # Local secrets (gitignored)
├── .gitignore                        # Ignores .env.local, service-account.json
├── src/
│   ├── app/
│   │   └── api/
│   │       └── tts/
│   │           └── route.ts          # ← TTS Backend API (uses Service Account)
│   │
│   ├── lib/
│   │   └── textToSpeech.ts          # ← TTS Utilities (playAudio, stopAudio, extractPageText)
│   │
│   └── hooks/
│       └── useTextToSpeech.ts        # ← TTS Frontend Hook (calls /api/tts)
│
└── TTS_SETUP.md                      # ← This file
```

---

## Security Notes

✅ **API Key Protection:**
- Service Account credentials stored server-side only
- Never exposed to frontend
- Frontend makes secure local calls to `/api/tts`

✅ **Translation API Isolation:**
- Translation still uses `GOOGLE_TRANSLATE_API_KEY`
- TTS uses separate `GOOGLE_SERVICE_ACCOUNT_JSON`
- No credential reuse or mixing

✅ **Git Protection:**
- `.env.local` is gitignored
- `service-account.json` is gitignored
- Safe to commit all code changes

---

## Integration Notes

This TTS system is already integrated with:
- ✅ Language selection in kiosk (uses stored language)
- ✅ Floating speaker button (appears on all pages)
- ✅ Translation system (speaks already-translated text)
- ✅ Accessibility features (works with high contrast, etc.)

The existing translation system is **NOT modified** and continues working as before.
