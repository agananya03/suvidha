# Meta WhatsApp Bot Setup Guide

## 🚀 Overview

The Meta WhatsApp integration runs **parallel to Twilio** with **no breaking changes**:
- ✅ Twilio endpoints remain unchanged at `/api/whatsapp/webhook`
- ✅ Meta endpoints at `/api/meta/webhook` are separate
- ✅ Same session management and AI bot logic
- ✅ Can coexist during transition period

---

## 📋 Prerequisites

1. **Meta Business Account** - https://business.facebook.com
2. **WhatsApp Business App** - Create/approve your WhatsApp Business app
3. **Business Phone Number** - Register a WhatsApp-enabled phone number
4. **Meta Developers Account** - https://developers.facebook.com

---

## 🔧 Step 1: Get Meta Credentials

### 1.1 Create/Access WhatsApp Business App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Navigate to **My Workspace** → **Create App**
3. Choose **Business** as app type
4. Select **WhatsApp** as the category

### 1.2 Get Access Token

1. In your app dashboard, go to **Settings** → **System Users**
2. Create a new system user with role **Admin**
3. Assign **Apps** permission to your WhatsApp app
4. Generate an access token (valid for 60 days)
5. Copy the **Access Token** value

### 1.3 Get Phone Number ID

1. Go to **WhatsApp** → **Getting Started**
2. You'll see your **Phone Number ID** (starts with numbers)
3. Copy this value

### 1.4 Get Business Account ID

1. Go to **Settings** → **Basic**
2. Find **App ID** (also used as Business Account ID in some contexts)
3. For WhatsApp Cloud API, you may also find it in **WhatsApp** → **API Setup**

### 1.5 Create Webhook Verify Token

Generate a random secure string for webhook verification:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String([Random]::new().NextBytes(32))
```

Generate something like: `abc123def456ghi789jkl012mno345pqr`

---

## 🔑 Step 2: Configure Environment Variables

Update your `.env` file with the credentials from Step 1:

```env
# =============================================================================
# META (WhatsApp Business API)
# =============================================================================
META_PHONE_NUMBER_ID="123456789012345"           # From WhatsApp Getting Started
META_BUSINESS_ACCOUNT_ID="987654321098765"       # From App ID / Business Settings
META_ACCESS_TOKEN="EAABs...xyz"                  # Long-lived token from System User
META_WEBHOOK_VERIFY_TOKEN="abc123def456..."      # Generate yourself (openssl rand -base64 32)

# Optional: For internal API security
INTERNAL_API_SECRET="your-secret-key"            # For /api/meta/send authentication
```

---

## 🌐 Step 3: Configure Webhook URL

### 3.1 Get Your Webhook URL

Your webhook will be at:
```
https://your-domain.com/api/meta/webhook
```

Examples:
- **Local**: `http://localhost:3000/api/meta/webhook`
- **Vercel**: `https://your-project.vercel.app/api/meta/webhook`
- **Custom domain**: `https://api.suvidha.com/api/meta/webhook`

### 3.2 Register Webhook with Meta

1. In your Meta app dashboard, go to **WhatsApp** → **Configuration**
2. Under **Webhook Setup**, click **Edit**
3. Enter your webhook URL: `https://your-domain.com/api/meta/webhook`
4. Enter your **Webhook Verify Token** (from Step 2)
5. Click **Verify and Save**

Meta will send a GET request to verify the webhook. If successful, you'll see ✅ **Webhook verified**.

### 3.3 Subscribe to Webhook Events

1. After webhook is verified, click **Manage**
2. Under **Subscribe to this webhook**, enable:
   - ✅ `messages`
   - ✅ `message_template_status_update` (optional)
   - ✅ `message_status_updates` (optional)
3. Save changes

---

## 🧪 Step 4: Test the Integration

### 4.1 Test Webhook Verification

```bash
# Test GET endpoint (webhook verification)
curl -X GET "http://localhost:3000/api/meta/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_VERIFY_TOKEN"

# Expected response: 200 OK with body "test123"
```

### 4.2 Test Incoming Message Webhook

```bash
# Simulate incoming text message from Meta
curl -X POST "http://localhost:3000/api/meta/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "time": 1234567890,
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "1234567890",
            "id": "wamid.test123",
            "timestamp": "1234567890",
            "type": "text",
            "text": {"body": "Hello from Meta!"}
          }],
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "1234567890"
          }
        }
      }]
    }]
  }'

# Expected response: 200 OK with {"received":true}
```

### 4.3 Test Sending Message

```bash
# Send a text message via API
curl -X POST "http://localhost:3000/api/meta/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INTERNAL_API_SECRET" \
  -d '{
    "to": "1234567890",
    "type": "text",
    "content": {"text": "Hello, this is a test message!"}
  }'

# Expected response: 200 OK with {"success":true,"message":"text message sent successfully"}
```

### 4.4 Real WhatsApp Test

1. Send a message to your WhatsApp Business number from your phone
2. Check the server logs for incoming webhook
3. You should receive an automated AI response
4. Session will be saved in Redis

---

## 📁 File Structure

```
src/
├── lib/
│   ├── metaMessaging.ts        # Meta API client (send/receive)
│   ├── metaBot.ts              # Message handling & AI logic
│   ├── whatsappBot.ts          # ← Twilio (unchanged)
│   └── messaging.ts            # ← Twilio (unchanged)
│
└── app/
    └── api/
        ├── meta/
        │   ├── webhook/route.ts   # ← Meta webhook receiver
        │   └── send/route.ts      # ← Meta message sender
        │
        └── whatsapp/
            ├── webhook/route.ts   # ← Twilio webhook (unchanged)
            └── route.ts           # ← Twilio alt (unchanged)
```

---

## 🔄 Message Flow

### Incoming Message

```
Meta Cloud → /api/meta/webhook (GET/POST)
    ↓
handleMetaMessage()
    ↓
getAiResponse() (Gemini AI)
    ↓
saveSession() (Redis)
    ↓
sendMetaTextMessage() → Meta Cloud → User's WhatsApp
```

### Outgoing Message (API)

```
POST /api/meta/send
    ↓
sendMetaTextMessage() | sendMetaImageMessage() | etc.
    ↓
Meta Cloud API
    ↓
User's WhatsApp
```

---

## 🛠️ Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `META_PHONE_NUMBER_ID` | Your WhatsApp phone number ID | `123456789012345` |
| `META_BUSINESS_ACCOUNT_ID` | Business account identifier | `987654321098765` |
| `META_ACCESS_TOKEN` | API access token (long-lived) | `EAAB...` |
| `META_WEBHOOK_VERIFY_TOKEN` | Custom webhook verification token | `abc123...` |
| `INTERNAL_API_SECRET` | (Optional) For `/api/meta/send` auth | `secret_key_123` |

---

## 🐛 Troubleshooting

### "Webhook verification failed"

- ✅ Check `META_WEBHOOK_VERIFY_TOKEN` matches Meta dashboard setting
- ✅ Verify webhook URL is publicly accessible (not localhost on Vercel)
- ✅ Check server logs for exact error

### "Missing configuration: META_PHONE_NUMBER_ID"

- ✅ Ensure all Meta env variables are set in `.env`
- ✅ Restart dev server after adding env variables
- ✅ Check `.env` file is not in `.gitignore` (it should be!)

### "Failed to send message"

- ✅ Check `META_ACCESS_TOKEN` hasn't expired (regenerate if needed)
- ✅ Verify phone number format (no `+` prefix)
- ✅ Check Meta Business Account permissions
- ✅ Enable **Test Phone Numbers** if in development mode

### "Message not received"

- ✅ Check webhook is properly configured in Meta dashboard
- ✅ Verify `messages` event is subscribed in webhook settings
- ✅ Check server logs for incoming webhook requests
- ✅ Test with sample webhook curl command

### "Session not persisting"

- ✅ Check Redis (Upstash) credentials are correct
- ✅ Check `UPSTASH_REDIS_REST_URL` and token in `.env`
- ✅ Verify session get/save in logs

---

## 🔐 Security Notes

1. **Never commit credentials** to git (use `.env.local` or `.gitignore`)
2. **Rotate access tokens** periodically (Meta: 60-day expiry)
3. **Use HTTPS only** for production webhooks
4. **Verify webhook signature** (optional: implement signature validation)
5. **Rate limit** `/api/meta/send` endpoint with authentication

---

## 📞 Support

For Meta API issues:
- Meta Developer Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Meta Community: https://www.facebook.com/groups/metadevelopers
- WhatsApp API Docs: https://developers.facebook.com/docs/whatsapp

---

## ✅ Checklist

Before going live:

- [ ] Meta credentials obtained and stored in `.env`
- [ ] Webhook URL configured in Meta dashboard
- [ ] Webhook verification successful (✅ in Meta dashboard)
- [ ] Messages subscribed in webhook settings
- [ ] Test message sent successfully
- [ ] Test message received successfully
- [ ] Sessions saving to Redis
- [ ] AI bot responding appropriately
- [ ] Media uploads working
- [ ] Twilio bot still functioning (no conflicts)

---

## 🚀 Next Steps

1. **Transition Period**: Both Twilio and Meta bots running in parallel
2. **Monitor Performance**: Check logs for errors and usage patterns
3. **User Onboarding**: Update user communications to include Meta WhatsApp option
4. **Remove Twilio**: Once production-tested, disable Twilio bot (later phase)

Happy messaging! 🎉
