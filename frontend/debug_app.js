import { spawn } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';
import { tmpdir } from 'node:os';

const tempDir = join(tmpdir(), 'edge-debug-profile-' + Date.now());
console.log('Using temp profile directory:', tempDir);

const edgeArgs = [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempDir}`,
    '--no-sandbox',
    '--disable-gpu',
    '--remote-allow-origins=*',
    'about:blank'
];

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', edgeArgs);

let wsUrl = '';
edge.stderr.on('data', (data) => {
    const str = data.toString();
    console.log('Edge Stderr:', str);
    const match = str.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9-]+)/);
    if (match) {
        wsUrl = match[1];
        console.log('Detected WebSocket URL:', wsUrl);
        startDebugging();
    }
});

edge.stdout.on('data', (data) => {
    console.log('Edge Stdout:', data.toString());
});

edge.on('close', (code) => {
    console.log('Edge process exited with code', code);
    process.exit(0);
});

// Timeout to prevent hanging
setTimeout(() => {
    console.log('Timeout reached. Closing...');
    edge.kill();
    process.exit(1);
}, 15000);

async function startDebugging() {
    try {
        console.log('Connecting to browser WebSocket...');
        const ws = new WebSocket(wsUrl);
        
        let messageId = 1;
        const pendingCallbacks = new Map();
        ws.onopen = () => {
            console.log('WebSocket connected. Creating target for localhost:5173...');
            
            // Create target (localhost:5173)
            send('Target.createTarget', { url: 'http://localhost:5173/' }, (res) => {
                const targetId = res.targetId;
                console.log('Created target with ID:', targetId);
                
                // Attach to target
                send('Target.attachToTarget', { targetId, flatten: true }, (attachRes) => {
                    const sessionId = attachRes.sessionId;
                    console.log('Attached to target. Session ID:', sessionId);
                    
                    // Enable Runtime, Console, Log for the session
                    send('Runtime.enable', {}, null, sessionId);
                    send('Log.enable', {}, null, sessionId);
                    send('Page.enable', {}, null, sessionId);
                    
                    console.log('Waiting for errors...');
                });
            });
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            // Check if it's a response to a pending request
            if (msg.id && pendingCallbacks.has(msg.id)) {
                const cb = pendingCallbacks.get(msg.id);
                pendingCallbacks.delete(msg.id);
                if (msg.error) {
                    console.error('CDP Error:', msg.error);
                } else {
                    cb(msg.result);
                }
            }
            
            // Log console messages and exceptions
            if (msg.method === 'Runtime.consoleAPICalled') {
                const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
                console.log(`[Browser Console ${msg.params.type}]:`, args);
            }
            if (msg.method === 'Runtime.exceptionThrown') {
                console.error('\n--- BROWSER EXCEPTION DETECTED ---');
                console.error(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
                if (msg.params.exceptionDetails.stackTrace) {
                    console.error('Stack Trace:');
                    for (const frame of msg.params.exceptionDetails.stackTrace.callFrames) {
                        console.error(`  at ${frame.functionName || '<anonymous>'} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})`);
                    }
                }
                console.error('---------------------------------\n');
            }
            if (msg.method === 'Log.entryAdded') {
                console.log('[Browser Log]:', msg.params.entry.text, `(level: ${msg.params.entry.level})`);
            }
        };

        function send(method, params = {}, callback = null, sessionId = null) {
            const id = messageId++;
            if (callback) {
                pendingCallbacks.set(id, callback);
            }
            const payload = { id, method, params };
            if (sessionId) {
                payload.sessionId = sessionId;
            }
            ws.send(JSON.stringify(payload));
        }

    } catch (e) {
        console.error('Error in debugging:', e);
        edge.kill();
    }
}
