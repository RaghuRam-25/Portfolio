const { spawn } = require('child_process');
const tempDir = require('path').join(require('os').tmpdir(), 'edge-debug-profile-' + Date.now());

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
    const match = str.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9-]+)/);
    if (match) {
        wsUrl = match[1];
        startDebugging();
    }
});

// Timeout to prevent hanging
setTimeout(() => {
    console.log('Timeout reached. Closing...');
    edge.kill();
    process.exit(1);
}, 30000);

async function startDebugging() {
    try {
        const ws = new WebSocket(wsUrl);
        let messageId = 1;
        const pendingCallbacks = new Map();

        ws.onopen = () => {
            // Create target (https://portfolio-pi-bay-b1r570gw7a.vercel.app/)
            send('Target.createTarget', { url: 'https://portfolio-pi-bay-b1r570gw7a.vercel.app/' }, (res) => {
                const targetId = res.targetId;
                
                // Attach to target
                send('Target.attachToTarget', { targetId, flatten: true }, (attachRes) => {
                    const sessionId = attachRes.sessionId;
                    
                    // Enable Runtime and Page
                    send('Runtime.enable', {}, null, sessionId);
                    send('Page.enable', {}, null, sessionId);
                    send('Runtime.runIfWaitingForDebugger', {}, null, sessionId);
                    
                    // Wait 9 seconds for intro to complete, then click tabs
                    setTimeout(() => {
                        console.log('Intro should be complete. Attempting to click all navigation tabs...');
                        
                        // Evaluate script to find and click all navigation buttons
                        const script = `
                            (async () => {
                                const buttons = Array.from(document.querySelectorAll('nav button, nav a'));
                                console.log("Found buttons:", buttons.map(b => b.innerText.trim()).filter(Boolean));
                                
                                for (const btn of buttons) {
                                    const text = btn.innerText.trim();
                                    if (!text || text === '🌙' || text === '☀️' || text === 'Menu' || text === 'Close') continue;
                                    console.log("Clicking tab:", text);
                                    btn.click();
                                    // Wait 1.5 seconds after each click
                                    await new Promise(r => setTimeout(r, 1500));
                                }
                            })()
                        `;
                        
                        send('Runtime.evaluate', { expression: script, awaitPromise: true }, (evalRes) => {
                            console.log('Tab clicking script completed.');
                            setTimeout(() => {
                                edge.kill();
                                process.exit(0);
                            }, 2000);
                        }, sessionId);
                        
                    }, 12000); // 12 seconds to be safe on network load
                });
            });
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            if (msg.id && pendingCallbacks.has(msg.id)) {
                const cb = pendingCallbacks.get(msg.id);
                pendingCallbacks.delete(msg.id);
                if (msg.error) {
                    console.error('CDP Error:', msg.error);
                } else {
                    cb(msg.result);
                }
            }
            
            if (msg.method === 'Runtime.consoleAPICalled') {
                const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
                console.log(`[Browser Console]:`, args);
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
