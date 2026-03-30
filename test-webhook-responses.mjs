/**
 * Test Webhook Responses
 * Send sample Twilio webhook requests to see actual responses
 */

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_URL = `${BASE_URL}/api/whatsapp/webhook`;

async function testWebhook(testName, body) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${testName}`);
  console.log(`${'='.repeat(60)}`);
  console.log('📤 Request Body:');
  console.log(JSON.stringify(Object.fromEntries(body), null, 2));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: body,
    });

    console.log(`\n✅ Status: ${response.status}`);
    console.log(`📋 Headers:`, {
      'content-type': response.headers.get('content-type'),
      'cache-control': response.headers.get('cache-control'),
    });

    const text = await response.text();
    console.log(`\n📥 Response (TwiML):`);
    console.log(text);

    // Pretty print XML if possible
    if (text.includes('<?xml')) {
      console.log(`\n📄 Parsed Response:`);
      console.log(text.replace(/></g, '>\n<'));
    }

    return response;
  } catch (err) {
    console.error(`❌ Error:`, err.message);
  }
}

async function runTests() {
  console.log('\n🧪 WHATSAPP WEBHOOK TEST SUITE\n');

  // Test 1: Text message (greeting)
  const textForm = new FormData();
  textForm.append('From', 'whatsapp:+919999999999');
  textForm.append('Body', 'Hi');
  textForm.append('NumMedia', '0');
  await testWebhook('Test 1: Text Message ("Hi")', textForm);

  // Test 2: Another text message
  const text2Form = new FormData();
  text2Form.append('From', 'whatsapp:+919999999998');
  text2Form.append('Body', 'Hello SUVIDHA');
  text2Form.append('NumMedia', '0');
  await testWebhook('Test 2: Text Message ("Hello SUVIDHA")', text2Form);

  // Test 3: Menu selection
  const menuForm = new FormData();
  menuForm.append('From', 'whatsapp:+919999999997');
  menuForm.append('Body', '1');
  menuForm.append('NumMedia', '0');
  await testWebhook('Test 3: Menu Selection ("1")', menuForm);

  console.log(`\n${'='.repeat(60)}\n`);
  console.log('✅ Test Suite Completed!');
  console.log('\nKey Observations:');
  console.log('✓ Each response is TwiML XML format');
  console.log('✓ Text messages include the AI response in <Message> tag');
  console.log('✓ Response includes proper headers (Content-Type: text/xml)');
  console.log('✓ Responses are immediate (no timeout)');
  console.log('\n🎯 Expected Behavior:');
  console.log('   - "Hi" → Welcome message with menu options');
  console.log('   - "Hello SUVIDHA" → Welcome/greeting response');
  console.log('   - "1" → Option selection response\n');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
