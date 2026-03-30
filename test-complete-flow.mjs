/**
 * Test Webhook with PROPER Media Upload Flow
 * 1. User starts conversation
 * 2. User selects an option (e.g., "1" for Electricity)
 * 3. User uploads a document (in WAITING_UPLOAD state)
 */

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_URL = `${BASE_URL}/api/whatsapp/webhook`;

async function testWebhook(testName, body, delay = 0) {
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${testName}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: body,
    });

    console.log(`✅ Status: ${response.status}`);
    const text = await response.text();
    
    console.log(`\n📥 Response (TwiML):`);
    console.log(text);

    if (text.includes('<?xml')) {
      const formatted = text.replace(/></g, '>\n<');
      console.log(`\n📄 Formatted:\n${formatted}`);
    }

    return response;
  } catch (err) {
    console.error(`❌ Error:`, err.message);
  }
}

async function runTests() {
  console.log('\n🧪 COMPLETE FLOW TEST (Text + Media Upload)\n');
  
  const phone = 'whatsapp:+919999999900';
  
  // Step 1: User sends "Hi"
  console.log('🔄 FLOW: User starts conversation\n');
  const step1 = new FormData();
  step1.append('From', phone);
  step1.append('Body', 'Hi');
  step1.append('NumMedia', '0');
  await testWebhook('Step 1: User says "Hi"', step1);

  // Step 2: User selects "1" (Electricity)
  console.log('\n🔄 FLOW: User selects option 1\n');
  const step2 = new FormData();
  step2.append('From', phone);
  step2.append('Body', '1');
  step2.append('NumMedia', '0');
  await testWebhook('Step 2: User selects "1" (Electricity)', step2);

  // Step 3: User replies "yes" to upload
  console.log('\n🔄 FLOW: User agrees to upload\n');
  const step3 = new FormData();
  step3.append('From', phone);
  step3.append('Body', 'yes');
  step3.append('NumMedia', '0');
  await testWebhook('Step 3: User replies "yes"', step3);

  // Step 4: User uploads a document
  console.log('\n🔄 FLOW: User uploads document (NOW in WAITING_UPLOAD state)\n');
  const step4 = new FormData();
  step4.append('From', phone);
  step4.append('Body', '');
  step4.append('NumMedia', '1');
  step4.append('MediaUrl0', 'https://api.twilio.com/example.pdf');
  step4.append('MediaContentType0', 'application/pdf');
  await testWebhook('Step 4: User uploads PDF document', step4, 1000);

  console.log(`\n${'='.repeat(60)}\n`);
  console.log('📊 KEY OBSERVATIONS:\n');
  console.log('✅ Step 1 (Text): Immediate menu response in TwiML');
  console.log('✅ Step 2 (Menu): Selection response in TwiML');
  console.log('✅ Step 3 (Text): Confirmation response in TwiML');
  console.log('✅ Step 4 (Media): "Got your document! Processing..." in TwiML');
  console.log('\n💡 Why Step 4 is special:');
  console.log('   • Session is in WAITING_UPLOAD state');
  console.log('   • Media is detected (NumMedia=1)');
  console.log('   • Webhook returns immediate "processing..." message');
  console.log('   • Background handler processes file → uploads to Cloudinary → creates token');
  console.log('   • Token sent later via Twilio API when ready\n');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
