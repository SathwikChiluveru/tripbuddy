const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness, tripBody } = require('./helpers');

test('real Mongo and HTTP session, authorization, validation and capacity invariants', { timeout: 120000 }, async t => {
  const app = await harness();
  t.after(() => app.close());
  const { request } = app;
  await t.test('production defaults disable the legacy password endpoints and emit HSTS', async () => {
    const names = ['NODE_ENV', 'CLIENT_ORIGIN', 'SESSION_SECRET', 'ALLOW_LEGACY_PASSWORD_AUTH', 'TRUST_PROXY_HOPS'];
    const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
    let production;
    try {
      process.env.NODE_ENV = 'production';
      process.env.CLIENT_ORIGIN = 'https://tripbuddy.example';
      process.env.SESSION_SECRET = 'production-test-secret-with-at-least-32-bytes';
      delete process.env.ALLOW_LEGACY_PASSWORD_AUTH;
      process.env.TRUST_PROXY_HOPS = '0';
      const { createApp } = require('../app');
      production = createApp({ sessionStore: new (require('express-session').MemoryStore)() });
      await new Promise((resolve, reject) => production.httpServer.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()));
      const origin = `http://127.0.0.1:${production.httpServer.address().port}`;
      for (const [url, body] of [['/api/user/register', { username: 'unsafe' }], ['/api/auth/login', { email: 'unsafe@example.com', password: 'password' }]]) {
        const response = await fetch(origin + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        assert.equal(response.status, 404);
        assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
      }
    } finally {
      if (production?.io) await new Promise(resolve => production.io.close(resolve));
      for (const name of names) previous[name] === undefined ? delete process.env[name] : process.env[name] = previous[name];
    }
  });
  const host = await app.user('host');
  const outsider = await app.user('outsider');
  await t.test('trip destinations accept catalog places and reject unknown or mismatched locations', async () => {
    const valid = await request('/api/trip/createTrip', { method: 'POST', cookie: host.cookie, body: { ...tripBody, title: 'Canonical destination fixture', country: 'jApAn', city: 'kYoTo' } });
    assert.equal(valid.status, 201, JSON.stringify(valid.data));
    assert.equal(valid.data.country, 'Japan');
    assert.equal(valid.data.city, 'Kyoto');
    for (const destination of [
      { country: 'Jappan', city: 'Kyoto' },
      { country: 'Japan', city: 'Lisbon' },
      { country: 'Atlantis', city: 'Kyoto' }
    ]) {
      const invalid = await request('/api/trip/createTrip', { method: 'POST', cookie: host.cookie, body: { ...tripBody, ...destination } });
      assert.equal(invalid.status, 400, JSON.stringify(destination));
      assert.match(invalid.data.message, /country|city|destination/i);
    }
  });
  await t.test('public profiles return only profile fields; owners retain their private details', async () => {
    await app.connection.collection('users').updateOne({ _id: new (require('mongoose').Types.ObjectId)(host.id) }, { $set: { age: 34 } });
    const publicProfile = await request(`/api/user/getUserById/${host.id}`);
    assert.equal(publicProfile.status, 200);
    assert.equal(publicProfile.data.username, host.username);
    for (const field of ['email', 'password', 'age', 'tripsJoined', 'tripsPosted']) assert.equal(publicProfile.data[field], undefined, `public profile must omit ${field}`);
    const directory = await request('/api/user/getAllUsers', { cookie: host.cookie });
    assert.equal(directory.status, 200);
    assert.ok(directory.data.some(user => user._id === host.id));
    for (const user of directory.data) {
      for (const field of ['email', 'password', 'age', 'tripsJoined', 'tripsPosted']) assert.equal(user[field], undefined, `user directory must omit ${field}`);
    }
    const ownProfile = await request(`/api/user/getUserById/${host.id}`, { cookie: host.cookie });
    assert.equal(ownProfile.status, 200);
    assert.equal(ownProfile.data.email, host.email);
    assert.equal(ownProfile.data.age, 34);
  });
  await t.test('global upload storage quota applies across accounts', { timeout: 30000 }, async () => {
    const quotaApp = await harness('tripbuddy_global_quota_test', 3102, {
      USER_UPLOAD_QUOTA_BYTES: '1000',
      UPLOAD_STORAGE_QUOTA_BYTES: '100'
    });
    const fs = require('node:fs/promises');
    const path = require('node:path');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    const firstUser = await quotaApp.user('first');
    const secondUser = await quotaApp.user('second');
    const uploaded = [];
    const upload = async cookie => {
      const form = new FormData();
      form.set('image', new Blob([png], { type: 'image/png' }), 'test.png');
      const response = await fetch(`${quotaApp.base}/api/trip/upload`, { method: 'POST', headers: { Cookie: cookie }, body: form, signal: AbortSignal.timeout(6000) });
      return { status: response.status, data: await response.json() };
    };
    try {
      const accepted = await upload(firstUser.cookie);
      assert.equal(accepted.status, 200);
      uploaded.push(path.join(__dirname, '..', 'uploads', firstUser.id, path.basename(accepted.data.url)));
      assert.equal((await upload(secondUser.cookie)).status, 503, 'global storage cap rejects uploads even when the account cap has room');
    } finally {
      for (const filename of uploaded) await fs.unlink(filename).catch(() => {});
      await quotaApp.close();
    }
  });
  await t.test('uploads enforce authentication, file signatures and size, and serve stored bytes', async () => {
    const fs = require('node:fs/promises');
    const path = require('node:path');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    const upload = async (bytes, cookie, mime = 'image/png') => {
      const form = new FormData();
      form.set('image', new Blob([bytes], { type: mime }), 'test.png');
      const response = await fetch(`${app.base}/api/trip/upload`, { method: 'POST', headers: cookie ? { Cookie: cookie } : {}, body: form, signal: AbortSignal.timeout(6000) });
      return { status: response.status, data: await response.json() };
    };
    assert.equal((await upload(png)).status, 401);
    let filename;
    try {
      const valid = await upload(png, host.cookie);
      assert.equal(valid.status, 200);
      assert.match(valid.data.url, new RegExp('^/uploads/' + host.id + '/[0-9a-f-]{36}\\.png'));
      filename = path.basename(valid.data.url);
      assert.equal((await upload(png, host.cookie)).status, 413, 'per-account storage quota rejects a second upload that would overflow the cap');
      const served = await fetch(`${app.base}${valid.data.url}`, { signal: AbortSignal.timeout(6000) });
      assert.equal(served.status, 200); assert.match(served.headers.get('content-type'), /^image\/png/);
      assert.deepEqual(Buffer.from(await served.arrayBuffer()), png);
      assert.equal((await upload(Buffer.from('<svg><script>alert(1)</script></svg>'), host.cookie)).status, 400);
      assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1), host.cookie)).status, 413);
    } finally {
      if (filename) await fs.unlink(path.join(__dirname, '..', 'uploads', host.id, filename));
    }
  });
  await t.test('anonymous Socket.IO connection is rejected', async () => {
    // Exercise the real Socket.IO protocol over Engine.IO polling, without a
    // browser or an extra client dependency.
    const endpoint = `${app.base}/socket.io/?EIO=4&transport=polling`;
    const opening = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
    const packet = await opening.text();
    assert.equal(packet[0], '0');
    const sid = JSON.parse(packet.slice(1)).sid;
    try {
      const url = `${endpoint}&sid=${encodeURIComponent(sid)}`;
      await fetch(url, { method: 'POST', body: '40', signal: AbortSignal.timeout(6000) });
      const result = await fetch(url, { signal: AbortSignal.timeout(6000) });
      assert.match(await result.text(), /44\{/, 'Socket.IO must return a connect_error packet');
    } finally {
      await fetch(`${endpoint}&sid=${encodeURIComponent(sid)}`, { method: 'POST', body: '1', signal: AbortSignal.timeout(2000) }).catch(() => {});
    }
  });
  await t.test('Google popup callback requires the documented same-origin request header', async () => {
    assert.equal((await request('/api/auth/google/callback', { method: 'POST', body: { code: 'not-a-real-code' } })).status, 403);
  });
  await t.test('registration persists, normalizes email and never returns password hashes', async () => {
    const stored = await app.connection.collection('users').findOne({ email: host.email });
    assert.ok(stored); assert.notEqual(stored.password, host.password);
    const duplicate = await request('/api/user/register', { method: 'POST', body: { ...host, email: ` ${host.email.toUpperCase()} ` } });
    assert.equal(duplicate.status, 409);
    const me = await request('/api/auth/me', { cookie: host.cookie });
    assert.equal(me.data.email, host.email); assert.equal(me.data.password, undefined);
    assert.equal((await request('/api/auth/login', { method: 'POST', body: { email: { $ne: null }, password: host.password } })).status, 400);
  });
  await t.test('rejects unauthenticated mutation, malformed identifiers and unsafe filters', async () => {
    assert.equal((await request('/api/trip/createTrip', { method: 'POST', body: tripBody })).status, 401);
    assert.equal((await request('/api/trip/getTripByTripId/bad')).status, 400);
    for (const [url, method] of [['/api/trip/joinTrip/bad', 'POST'], ['/api/trip/leaveTrip/bad', 'POST'], ['/api/trip/editTrip/bad', 'PUT'], ['/api/trip/bad', 'DELETE'], ['/api/user/getUserById/bad', 'GET'], ['/api/chat/bad', 'GET']]) {
      assert.equal((await request(url, { method, cookie: host.cookie, ...(method === 'GET' ? {} : { body: {} }) })).status, 400, `${method} ${url}`);
    }
    assert.equal((await request('/api/trip/getTripByTripId/000000000000000000000000')).status, 404);
    assert.equal((await request('/api/trip/getTrips?country[$ne]=x')).status, 400);
    for (const body of [{ ...tripBody, endDate: '2020-01-01' }, { ...tripBody, totalSlots: 1.5 }, { ...tripBody, startDate: 'nonsense' }]) {
      assert.equal((await request('/api/trip/createTrip', { method: 'POST', body, cookie: host.cookie })).status, 400);
    }
    for (const url of ['https://tracker.example/pixel.png', 'http://127.0.0.1:3000/admin', 'javascript:alert(1)']) {
      assert.equal((await request('/api/trip/createTrip', { method: 'POST', body: { ...tripBody, imageUrl: url }, cookie: host.cookie })).status, 400);
      assert.equal((await request(`/api/user/${host.id}/editProfile`, { method: 'PUT', body: { imageUrl: url }, cookie: host.cookie })).status, 400);
    }
    assert.equal((await request(`/api/user/${host.id}/editProfile`, { method: 'PUT', body: { firstName: 'Hijacked' }, cookie: outsider.cookie })).status, 403);
  });
  const created = await request('/api/trip/createTrip', { method: 'POST', cookie: host.cookie, body: { ...tripBody, hostId: outsider.id, host: outsider.username } });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  const id = created.data._id;
  assert.equal(created.data.hostId, host.id);
  assert.equal(created.data.host, host.username);
  await t.test('socket message limits are shared across a user’s connections', async () => {
    const sender = await app.user('socket-rate');
    const trip = await request('/api/trip/createTrip', { method: 'POST', cookie: sender.cookie, body: { ...tripBody, title: 'Socket rate limit fixture' } });
    assert.equal(trip.status, 201);
    const chat = await app.connection.collection('chats').findOne({ trip: new (require('mongoose').Types.ObjectId)(trip.data._id) });
    const first = await app.socket(sender.cookie), second = await app.socket(sender.cookie);
    try {
      for (const [socket, content] of [[first, 'one'], [first, 'two'], [second, 'three']]) {
        assert.equal((await socket.event('sendMessage', { roomId: String(chat._id), content })).ok, true);
      }
      const limited = await first.event('sendMessage', { roomId: String(chat._id), content: 'four' });
      assert.equal(limited.ok, false);
      assert.match(limited.message, /Too many messages/);
    } finally { await Promise.all([first.close(), second.close()]); }
  });
  const travelers = [];
  for (let i = 0; i < 12; i++) travelers.push(await app.user(i));
  const joins = await Promise.all(travelers.map(user => request(`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: user.cookie, body: { userId: outsider.id } })));
  await t.test('concurrent joins cannot overflow last two slots or duplicate membership', async () => {
    assert.equal(joins.filter(result => result.status === 200).length, 2);
    for (const join of joins) assert.ok([200, 409].includes(join.status), JSON.stringify(join));
    const trip = await request(`/api/trip/getTripByTripId/${id}`);
    assert.equal(trip.data.tripMates.length, 3); assert.equal(new Set(trip.data.tripMates).size, 3);
  });
  const winner = travelers[joins.findIndex(result => result.status === 200)];
  await t.test('membership controls chat and session determines message sender', async () => {
    assert.equal((await request(`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: winner.cookie, body: {} })).status, 409);
    const me = await request('/api/auth/me', { cookie: winner.cookie });
    assert.ok(me.data.tripsJoined.some(item => item.tripId === id && item.tripName === tripBody.title));
    const chats = await request(`/api/chat/user/${winner.id}/chats`, { cookie: winner.cookie });
    const chat = chats.data.userChats.find(item => (item.trip?._id || item.trip) === id); assert.ok(chat);
    const memberSocket = await app.socket(winner.cookie);
    const outsiderSocket = await app.socket(outsider.cookie);
    try {
      assert.equal((await memberSocket.event('joinRoom', chat._id)).ok, true);
      assert.equal((await outsiderSocket.event('joinRoom', chat._id)).ok, false);
      assert.equal((await outsiderSocket.event('sendMessage', { roomId: chat._id, content: 'Unauthorized' })).ok, false);
      const sent = await memberSocket.event('sendMessage', { roomId: chat._id, content: 'Socket hello', sender: outsider.id });
      assert.equal(sent.ok, true); assert.equal(String(sent.data.sender), winner.id);
      assert.equal((await memberSocket.event('sendMessage', { roomId: chat._id, content: '' })).ok, false);
    assert.equal((await request(`/api/chat/${chat._id}`, { cookie: outsider.cookie })).status, 403);
    for (const content of ['', '   ', 'x'.repeat(10001), { $ne: null }]) assert.equal((await request(`/api/chat/${chat._id}/message`, { method: 'POST', cookie: winner.cookie, body: { content } })).status, 400);
    assert.equal((await request(`/api/chat/${chat._id}/message`, { method: 'POST', cookie: winner.cookie, body: { content: 'See you soon', sender: outsider.id } })).status, 201);
    const history = await request(`/api/chat/${chat._id}`, { cookie: winner.cookie });
    assert.equal(String(history.data.messages.at(-1).sender._id || history.data.messages.at(-1).sender), winner.id);
    assert.equal((await request(`/api/trip/leaveTrip/${id}`, { method: 'POST', cookie: winner.cookie, body: {} })).status, 200);
    assert.equal((await request(`/api/chat/${chat._id}`, { cookie: winner.cookie })).status, 403);
    assert.equal((await memberSocket.event('sendMessage', { roomId: chat._id, content: 'After leaving' })).ok, false);
    assert.ok(!(await request('/api/auth/me', { cookie: winner.cookie })).data.tripsJoined.some(item => item.tripId === id));
    } finally { await memberSocket.close(); await outsiderSocket.close(); }
  });
  await t.test('overlapping leave and rejoin preserve trip, user and chat membership', async () => {
    const objectId = value => new (require('mongoose').Types.ObjectId)(value);
    const member = outsider;
    assert.equal((await request(`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: member.cookie, body: {} })).status, 200);
    for (let repeat = 0; repeat < 10; repeat++) {
      const results = await Promise.all([
        request(`/api/trip/leaveTrip/${repeat % 2 ? id : id.toUpperCase()}`, { method: 'POST', cookie: member.cookie, body: {} }),
        request(`/api/trip/joinTrip/${repeat % 2 ? id.toUpperCase() : id}`, { method: 'POST', cookie: member.cookie, body: {} })
      ]);
      assert.ok(results.every(result => [200, 409].includes(result.status)), JSON.stringify(results));
      const trip = await app.connection.collection('trips').findOne({ _id: objectId(id) });
      const chat = await app.connection.collection('chats').findOne({ trip: objectId(id) });
      const user = await app.connection.collection('users').findOne({ _id: objectId(member.id) });
      const included = trip.tripMates.some(value => String(value) === member.id);
      assert.equal(chat.participants.some(value => String(value) === member.id), included, 'Chat membership must agree with trip');
      assert.equal(user.tripsJoined.some(value => String(value.tripId) === id), included, 'User trips must agree with trip');
      assert.equal(new Set(trip.tripMates.map(String)).size, trip.tripMates.length);
      assert.equal(new Set(chat.participants.map(String)).size, chat.participants.length);
    }
    const joined = await request(`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: member.cookie, body: {} });
    assert.ok([200, 409].includes(joined.status));
    const chats = await request(`/api/chat/user/${member.id}/chats`, { cookie: member.cookie });
    const chat = chats.data.userChats.find(item => (item.trip?._id || item.trip) === id);
    assert.ok(chat);
    assert.equal((await request(`/api/chat/${chat._id}/message`, { method: 'POST', cookie: member.cookie, body: { content: 'Membership survived concurrent leave and join' } })).status, 201);
  });
  await t.test('personal trips and public search include records beyond first global page', async () => {
    const { ObjectId } = require('mongoose').Types;
    const fixtureIds = Array.from({ length: 102 }, () => new ObjectId());
    const needle = 'OlderSearchNeedle';
    const fixtures = fixtureIds.map((_id, index) => ({ ...tripBody, _id, title: index === 0 ? needle : `Pagination fixture ${index}`, host: host.username, hostId: new ObjectId(host.id), tripMates: [new ObjectId(host.id)], createdAt: new Date(2020, 0, index + 1), updatedAt: new Date(2020, 0, index + 1) }));
    fixtures[1].title = 'Literal [.* search';
    try {
      await app.connection.collection('trips').insertMany(fixtures);
      const global = await request('/api/trip/getTrips');
      assert.equal(global.status, 200); assert.ok(global.data.length <= 100);
      assert.ok(!global.data.some(trip => trip._id === String(fixtureIds[0])));
      const search = await request(`/api/trip/getTrips?q=${needle}`);
      assert.equal(search.status, 200); assert.ok(search.data.some(trip => trip._id === String(fixtureIds[0])));
      assert.ok(search.data.every(trip => trip.title.includes(needle)));
      const literal = await request(`/api/trip/getTrips?q=${encodeURIComponent('[.*')}`);
      assert.equal(literal.status, 200); assert.equal(literal.data.length, 1); assert.equal(literal.data[0]._id, String(fixtureIds[1]));
      assert.equal((await request('/api/trip/myTrips')).status, 401);
      const personal = await request('/api/trip/myTrips?limit=100&offset=0', { cookie: host.cookie });
      assert.equal(personal.status, 200); assert.ok(Array.isArray(personal.data));
      const second = await request('/api/trip/myTrips?limit=100&offset=100', { cookie: host.cookie });
      assert.equal(second.status, 200);
      const personalIds = [...personal.data, ...second.data].map(trip => trip._id);
      assert.ok(personalIds.includes(id)); assert.ok(personalIds.includes(String(fixtureIds[0])));
      const memberTrips = await request('/api/trip/myTrips', { cookie: outsider.cookie });
      assert.equal(memberTrips.status, 200); assert.ok(memberTrips.data.some(trip => trip._id === id));
      assert.ok(!memberTrips.data.some(trip => fixtureIds.some(fixtureId => String(fixtureId) === trip._id)));
    } finally { await app.connection.collection('trips').deleteMany({ _id: { $in: fixtureIds } }); }
  });
  await t.test('only host can edit/delete and deletion removes membership and chat', async () => {
    assert.equal((await request(`/api/trip/editTrip/${id}`, { method: 'PUT', cookie: outsider.cookie, body: { title: 'Hijacked' } })).status, 403);
    assert.equal((await request(`/api/trip/${id}`, { method: 'DELETE', cookie: outsider.cookie })).status, 403);
    assert.equal((await request(`/api/trip/editTrip/${id}`, { method: 'PUT', cookie: host.cookie, body: { title: 'Updated mountain walk' } })).status, 200);
    assert.equal((await request(`/api/trip/${id}`, { method: 'DELETE', cookie: host.cookie })).status, 200);
    assert.equal((await request(`/api/trip/getTripByTripId/${id}`)).status, 404);
    assert.equal(await app.connection.collection('chats').countDocuments({ trip: new (require('mongoose').Types.ObjectId)(id) }), 0);
    for (const traveler of travelers) assert.ok(!(await request('/api/auth/me', { cookie: traveler.cookie })).data.tripsJoined.some(item => item.tripId === id));
  });
  await t.test('logout invalidates the existing session cookie', async () => {
    assert.equal((await request('/api/user/logout', { method: 'GET', cookie: host.cookie })).status, 404);
    assert.equal((await request('/api/auth/me', { cookie: host.cookie })).status, 200, 'safe-method logout alias must not destroy the session');
    assert.equal((await request('/api/auth/logout', { method: 'POST', cookie: host.cookie, body: {} })).status, 200);
    assert.equal((await request('/api/auth/me', { cookie: host.cookie })).status, 401);
  });
});
