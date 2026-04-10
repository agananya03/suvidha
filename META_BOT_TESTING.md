# Meta Bot - Quick Testing Reference

## 🧪 Test Commands (Paste in PowerShell)

### 1. Test Webhook Verification (GET)

```powershell
$token = "YOUR_WEBHOOK_VERIFY_TOKEN_HERE"
$url = "http://localhost:3000/api/meta/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=$token"

$response = Invoke-WebRequest -Uri $url -Method Get -Headers @{"Content-Type"="application/json"}
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

**Expected Response:** `test123` (should echo back the challenge)

---

### 2. Test Incoming Text Message (POST)

```powershell
$payload = @{
    object = "whatsapp_business_account"
    entry = @(@{
        id = "123456789"
        time = [int][double]::Parse((Get-Date -UFormat %s))
        changes = @(@{
            value = @{
                messaging_product = "whatsapp"
                messages = @(@{
                    from = "919876543210"  # Your test phone
                    id = "wamid.test_$(Get-Random)"
                    timestamp = [int][double]::Parse((Get-Date -UFormat %s))
                    type = "text"
                    text = @{ body = "Hello from Meta test!" }
                })
                metadata = @{
                    display_phone_number = "919876543210"
                    phone_number_id = "123456789"
                }
            }
        })
    })
}

$json = $payload | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/webhook" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $json

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

**Expected Response:** `{"received":true}`

---

### 3. Test Image Message

```powershell
$payload = @{
    object = "whatsapp_business_account"
    entry = @(@{
        id = "123456789"
        time = [int][double]::Parse((Get-Date -UFormat %s))
        changes = @(@{
            value = @{
                messaging_product = "whatsapp"
                messages = @(@{
                    from = "919876543210"
                    id = "wamid.test_image_$(Get-Random)"
                    timestamp = [int][double]::Parse((Get-Date -UFormat %s))
                    type = "image"
                    image = @{
                        id = "image_id_12345"
                        mime_type = "image/jpeg"
                    }
                })
                metadata = @{
                    display_phone_number = "919876543210"
                    phone_number_id = "123456789"
                }
            }
        })
    })
}

$json = $payload | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/webhook" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $json

Write-Host "Status: $($response.StatusCode)"
```

---

### 4. Send Text Message via API

```powershell
$payload = @{
    to = "919876543210"
    type = "text"
    content = @{
        text = "Hello! This is a test message from Meta API."
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/send" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer YOUR_INTERNAL_API_SECRET"
    } `
    -Body $payload

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

**Expected Response:** `{"success":true,"message":"text message sent successfully"}`

---

### 5. Send Image Message

```powershell
$payload = @{
    to = "919876543210"
    type = "image"
    content = @{
        imageUrl = "https://example.com/image.jpg"
        caption = "Check this image!"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/send" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer YOUR_INTERNAL_API_SECRET"
    } `
    -Body $payload

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

---

### 6. Send Document Message

```powershell
$payload = @{
    to = "919876543210"
    type = "document"
    content = @{
        documentUrl = "https://example.com/document.pdf"
        fileName = "MyDocument.pdf"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/send" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer YOUR_INTERNAL_API_SECRET"
    } `
    -Body $payload

Write-Host "Status: $($response.StatusCode)"
```

---

### 7. Send Location Message

```powershell
$payload = @{
    to = "919876543210"
    type = "location"
    content = @{
        latitude = 28.7041
        longitude = 77.1025
        locationName = "New Delhi, India"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/meta/send" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer YOUR_INTERNAL_API_SECRET"
    } `
    -Body $payload

Write-Host "Status: $($response.StatusCode)"
```

---

## 📊 Check Server Logs

When running locally:
```powershell
# Terminal where dev server is running
npm run dev

# Look for these log patterns:
# [Meta Webhook] Received:
# [MetaBot] Message handled successfully:
# [Meta] Message sent successfully:
```

---

## 🔧 Setup Checklist Before Testing

- [ ] `.env` file has all Meta variables set
- [ ] `META_WEBHOOK_VERIFY_TOKEN` matches between `.env` and Meta dashboard
- [ ] Dev server running (`npm run dev`)
- [ ] Redis/Upstash connection working
- [ ] Replace phone numbers with your actual test numbers

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "401 Unauthorized" on `/api/meta/send` | Add `INTERNAL_API_SECRET` to `.env` and use correct Bearer token |
| "Webhook verification failed" | Verify `META_WEBHOOK_VERIFY_TOKEN` value matches exactly |
| "Missing configuration" error | Restart dev server after adding env variables |
| No response from webhook | Check server is running and console for errors |
| Message not appearing | Check phone number format (no +), verify Meta credentials |

---

## ✅ Success Indicators

1. ✅ Webhook verification returns echo of challenge
2. ✅ Webhook POST returns `{"received":true}`
3. ✅ Server logs show message processing
4. ✅ `/api/meta/send` returns `200 OK`
5. ✅ Messages appear in WhatsApp
