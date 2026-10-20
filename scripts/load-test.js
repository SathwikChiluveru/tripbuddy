// Bounded real-server load test. Uses only loopback Mongo on port 27018 and
// an isolated *_test database; never accepts an arbitrary database URI.
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { harness, tripBody } = require('../server/tests/helpers');

async function main() {
  const app = await harness('tripbuddy_load_test', 3101);
  try {
    const host = await app.user('loadhost');
    const users = [];
    for (let n = 0; n < 12; n++) users.push(await app.user(`load${n}`));
    const created = await app.request('/api/trip/createTrip', { method: 'POST', cookie: host.cookie, body: tripBody });
    assert.equal(created.status, 201);
    const id = created.data._id;
    const race = await Promise.all(users.map(user => app.request(`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: user.cookie, body: {} })));
    assert.equal(race.filter(result => result.status === 200).length, 2, 'Exactly two remaining places must be awarded');
    assert.ok(race.every(result => [200, 409].includes(result.status)));
    const durationMs = Math.min(30000, Math.max(5000, Number(process.env.LOAD_DURATION_MS) || 10000));
    const concurrency = Math.min(32, Math.max(1, Number(process.env.LOAD_CONCURRENCY) || 16));
    const latencies = []; const failures = []; const counts = {};
    const started = performance.now();
    const scenarios = [
      ['/api/trip/getAllTrips', {}, 200],
      [`/api/trip/getTripByTripId/${id}`, {}, 200],
      ['/api/trip/getTrips?country=Japan', {}, 200],
      ['/api/auth/me', { cookie: host.cookie }, 200],
      ['/api/trip/getTripByTripId/not-an-id', {}, 400],
      ['/api/trip/getTrips?country[$ne]=Japan', {}, 400],
      ['/api/trip/createTrip', { method: 'POST', cookie: host.cookie, body: { ...tripBody, totalSlots: -1 } }, 400],
      [`/api/trip/joinTrip/${id}`, { method: 'POST', cookie: users[0].cookie, body: {} }, 409]
    ];
    await Promise.all(Array.from({ length: concurrency }, async (_, worker) => {
      let iteration = worker;
      while (performance.now() - started < durationMs) {
        const [url, options, expected] = scenarios[iteration++ % scenarios.length];
        const before = performance.now();
        try {
          const result = await app.request(url, options);
          counts[result.status] = (counts[result.status] || 0) + 1;
          if (result.status !== expected) failures.push({ url, expected, actual: result.status, body: result.data });
        } catch (error) { failures.push({ url, error: error.message }); }
        latencies.push(performance.now() - before);
      }
    }));
    const elapsed = performance.now() - started;
    latencies.sort((a, b) => a - b);
    const percentile = fraction => Number(latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * fraction))].toFixed(2));
    const trip = await app.request(`/api/trip/getTripByTripId/${id}`);
    assert.equal(trip.data.tripMates.length, 3, 'Load must not overflow trip capacity');
    assert.equal(new Set(trip.data.tripMates).size, 3);
    console.log(JSON.stringify({ requests: latencies.length, concurrency, durationMs: Math.round(elapsed), requestsPerSecond: Number((latencies.length / elapsed * 1000).toFixed(2)), latencyMs: { p50: percentile(.5), p95: percentile(.95), max: percentile(1) }, statusCounts: counts, capacityRace: { contenders: users.length, admitted: 2, finalMembers: trip.data.tripMates.length }, failures: failures.length, failureExamples: failures.slice(0, 5) }, null, 2));
    assert.equal(failures.length, 0, 'Unexpected HTTP status or transport failures');
  } finally { await app.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
