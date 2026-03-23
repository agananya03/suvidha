# Text-to-Speech (TTS) Implementation Complete

## ✅ What's Been Implemented

1. **TTS Service Library** (`src/lib/textToSpeech.ts`)
   - Uses Google Cloud Text-to-Speech API
   - Supports all 20+ Indian languages
   - Automatically extracts page content for reading
   - Converts text to speech in MP3 format

2. **TTS Hook** (`src/hooks/useTextToSpeech.ts`)
   - Manages TTS state (playing, loading, error)
   - Integrates with user's selected language preference
   - Handles start/stop controls
   - Shows toast notifications for feedback

3. **Floating Speaker Button** (`src/components/ui/FloatingSpeakerButton.tsx`)
   - Bottom-right corner of every page
   - Blue "Read Page" button (when idle)
   - Red "Stop" button (when playing)
   - Shows "Preparing..." when synthesizing
   - Click to start/stop TTS

4. **Layout Integration**
   - Added to Kiosk Layout (all `/kiosk/*` pages)
   - Added to Root Layout (all pages globally)
   - Uses dynamic imports to avoid SSR issues

5. **Environment Configuration**
   - `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` added to `.env`
   - Uses same API key as Translation service

## 🔧 Required Setup: Enable Google Cloud Text-to-Speech API

The code is ready! Now you need to enable the Text-to-Speech API in Google Cloud Console:

### Steps:
1. Go to: https://console.cloud.google.com/
2. Select your project (same one with Translation API)
3. Search for "Cloud Text-to-Speech API"
4. Click the API and press **ENABLE**
5. That's it! Your existing API key already has access

### Verify It's Enabled:
- Go to https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/
- Should show "✓ Enabled" in blue banner at the top

## 🎤 How It Works

### User Flow:
1. User is on any kiosk page (French, Hindi, etc.)
2. User selects language (e.g., "Hindi")
3. All page text translates to Hindi
4. User clicks floating "Read Page" button
5. System:
   - Extracts all page text
   - Sends to Google TTS API in **Hindi language** (hi-IN voice)
   - Streams back MP3 audio
   - Plays audio in browser
6. Button changes to red "Stop" during playback
7. Click "Stop" to interrupt, or waits for audio to finish

### Language-to-Voice Mapping:
- English → en-US
- Hindi → hi-IN (Indian accent)
- Malayalam → ml-IN
- Tamil → ta-IN
- Telugu → te-IN
- Marathi → mr-IN
- And all 15+ other languages with native voices
- Fallback languages use nearest available voice

## 📊 Page Content Extraction

The TTS system automatically:
- ✅ Reads headings, buttons, labels
- ✅ Reads form text and instructions
- ✅ Reads error messages
- ✅ Skips navigation, scripts, hidden elements
- ✅ Limits to 5000 words (Google API constraint)
- ✅ Removes extra whitespace and formatting

## 🧪 Testing Checklist

- [ ] Start app: `npm run dev`
- [ ] Navigate to `/kiosk/page` (main kiosk page)
- [ ] Click language selector → Choose "Hindi"
- [ ] Page should translate to Hindi ✓
- [ ] Click blue "Read Page" button at bottom-right
- [ ] Listen for audio in Hindi (should say "नमस्ते" etc.)
- [ ] Button should turn red with "Stop"
- [ ] Click "Stop" to interrupt
- [ ] Try different languages (Malayalam, Tamil, etc.)
- [ ] Try on different pages (/kiosk/auth, /kiosk/complaint, etc.)

## 🔊 Audio Quality Notes

- Uses Neural2 voices (high quality, natural sounding)
- MP3 format (compatible with all browsers)
- Normal speaking speed (1.0x)
- Can be enhanced in future with:
  - Speed controls (0.8x, 1.0x, 1.2x)
  - Pause/Resume during playback
  - Download audio option
  - Voice gender selection

## 🚨 Troubleshooting

If TTS doesn't work:

1. **"No text found on page"**
   - Page content is empty or not selectable
   - Check console for extraction errors

2. **"TTS API failed"**
   - Google Cloud Text-to-Speech API not enabled
   - Follow setup steps above
   - Or API key is wrong/expired

3. **No audio plays**
   - Check browser permissions (audio, microphone)
   - Some browsers block autoplay of audio
   - Manual click to play should work

4. **Wrong language voice**
   - Selected language fallback to English
   - Check LANGUAGE_VOICE_MAP in textToSpeech.ts

## 📝 Files Modified

1. `.env` - Added NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY
2. `src/lib/textToSpeech.ts` - NEW
3. `src/hooks/useTextToSpeech.ts` - NEW
4. `src/components/ui/FloatingSpeakerButton.tsx` - NEW
5. `src/app/(kiosk)/layout.tsx` - Added speaker button
6. `src/app/layout.tsx` - Added speaker button

Let me know if you want to add more features like speed controls, pause/resume, or voice selection!
