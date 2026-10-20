const { spawn } = require('node:child_process');
const path = require('node:path');
const mongoose = require('mongoose');
const assert = require('node:assert/strict');

async function harness(database = 'tripbuddy_test', port = 3099, extraEnv = {}) {
  assert.match(database, /^[a-z0-9_]+_test$/);
  const occupied = await new Promise(resolve => {
    const socket = require('node:net').connect({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
  assert.equal(occupied, false, `Test server port ${port} is already occupied; refusing to test an unrelated process`);
  const uri = `mongodb://127.0.0.1:27018/${database}`;
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  await connection.dropDatabase();
  let logs = '';
  const child = spawn(process.execPath, ['--preserve-symlinks', '--preserve-symlinks-main', 'index.js'], {
    cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: String(port), MONGO_URI: uri, NODE_ENV: 'test', SESSION_SECRET: 'integration-test-secret-at-least-32-characters', RATE_LIMIT_MAX: '10000', AUTH_RATE_LIMIT_MAX: '1000', SOCKET_MESSAGE_RATE_LIMIT: '3', USER_UPLOAD_QUOTA_BYTES: '100', ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe']
  });
    child.stdout.on('data', data => { logs = (logs + data).slice(-6000); });
  child.stderr.on('data', data => { logs = (logs + data).slice(-6000); });
  const base = `http://127.0.0.1:${port}`;
  async function request(url, { method = 'GET', body, cookie } = {}) {
    const response = await fetch(base + url, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(6000) });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    for (let n = 0; n < 100; n++) {
      if (child.exitCode !== null) throw new Error(`Server exited: ${logs}`);
      try { if ((await request('/healthcheck')).status === 200) break; } catch {}
      if (n === 99) throw new Error(`Server did not start: ${logs}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) { child.kill(); await connection.close(); throw error; }
  async function user(index) {
    const body = { firstName: 'Test', lastName: 'Traveler', username: `traveler${index}`, email: `traveler${index}@example.com`, password: 'TestPassword123!' };
    const registration = await request('/api/user/register', { method: 'POST', body });
    assert.equal(registration.status, 201, JSON.stringify(registration.data));
    const login = await request('/api/auth/login', { method: 'POST', body: { email: body.email, password: body.password } });
    assert.equal(login.status, 200, JSON.stringify(login.data));
    assert.ok(login.cookie);
    const me = await request('/api/auth/me', { cookie: login.cookie });
    assert.equal(me.status, 200);
    return { ...body, id: me.data._id, cookie: login.cookie };
  }
  async function socket(cookie) {
    const endpoint = `${base}/socket.io/?EIO=4&transport=polling`;
    const headers = { Cookie: cookie };
    const opening = await fetch(endpoint, { headers, signal: AbortSignal.timeout(6000) });
    const sid = JSON.parse((await opening.text()).slice(1)).sid;
    const url = `${endpoint}&sid=${encodeURIComponent(sid)}`;
    const send = body => fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(6000) });
    const poll = async () => (await (await fetch(url, { headers, signal: AbortSignal.timeout(6000) })).text()).split('\u001e');
    await send('40');
    assert.ok((await poll()).some(packet => packet.startsWith('40')), 'Authenticated socket must connect');
    let sequence = 0;
    return {
      async event(event, payload) {
        const ack = sequence++;
        await send(`42${ack}${JSON.stringify([event, payload])}`);
        for (let attempt = 0; attempt < 5; attempt++) {
          for (const packet of await poll()) {
            if (packet === '2') await send('3');
            if (packet.startsWith(`43${ack}[`)) return JSON.parse(packet.slice(`43${ack}`.length))[0];
          }
        }
        throw new Error(`No socket acknowledgement for ${event}`);
      },
      close: () => send('1').catch(() => {})
    };
  }
  return { request, user, socket, connection, base, async close() { child.kill(); await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve)); await connection.dropDatabase(); await connection.close(); } };
}
const tripBody = { title: 'Integration mountain walk', startDate: '2027-06-10', endDate: '2027-06-13', totalSlots: 3, country: 'Japan', city: 'Kyoto', categories: ['Adventure'], tags: ['hiking'], description: 'A friendly mountain walking trip.', imageUrl: '/demo-images/mountains.jpg' };
module.exports = { harness, tripBody };
