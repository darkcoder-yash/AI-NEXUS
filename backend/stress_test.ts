import WebSocket from 'ws';

/**
 * stress_test.ts
 * Simulates a high-concurrency client environment to verify sequential message processing.
 */

const WS_URL = 'ws://localhost:4001';
const ws = new WebSocket(WS_URL);

let messageCount = 0;
const TOTAL_MESSAGES = 10;
const startTimes = new Map<number, number>();

ws.on('open', () => {
  console.log('[Test] Connected. Authenticating...');
  ws.send(JSON.stringify({ type: 'AUTH', payload: { token: 'STRESS_TEST_TOKEN' } }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());

  if (message.type === 'SERVER_RESPONSE' && message.payload.message.includes('Authenticated')) {
    console.log('[Test] Authenticated. Starting Burst Test...');
    
    // Blast 10 messages in 1 millisecond
    for (let i = 1; i <= TOTAL_MESSAGES; i++) {
        console.log(`[Test] Sending Message ${i}`);
        startTimes.set(i, Date.now());
        ws.send(JSON.stringify({ 
            type: 'CLIENT_MESSAGE', 
            payload: { text: `Message Number ${i}. Please reply exactly with: RESPONSE_${i}` } 
        }));
    }
  }

  if (message.type === 'RESPONSE_COMPLETE') {
    messageCount++;
    const text = message.payload.fullText;
    const match = text.match(/RESPONSE_(\d+)/);
    const index = match ? parseInt(match[1]) : 0;
    
    const duration = Date.now() - (startTimes.get(index) || Date.now());
    console.log(`[Test] Received ${messageCount}/${TOTAL_MESSAGES}: ${text} (Latency: ${duration}ms)`);

    if (messageCount === TOTAL_MESSAGES) {
      console.log('[Test] ALL MESSAGES RECEIVED. Sequential Integrity Verified.');
      ws.close();
      process.exit(0);
    }
  }

  if (message.type === 'ERROR') {
    console.error('[Test] ERROR:', message.payload.message);
    process.exit(1);
  }
});

ws.on('close', () => console.log('[Test] Connection Closed.'));
ws.on('error', (err) => console.error('[Test] WebSocket Error:', err));

// Safety timeout
setTimeout(() => {
    console.error('[Test] TIMEOUT: Did not receive all responses.');
    process.exit(1);
}, 60000);
