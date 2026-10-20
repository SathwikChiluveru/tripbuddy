/* Explicit, repeatable sample data for the local development database only. */
const mongoose = require('../server/node_modules/mongoose');
const bcrypt = require('../server/node_modules/bcryptjs');
const path = require('node:path');
require('../server/node_modules/dotenv').config({ path: path.join(__dirname, '../server/.env') });
const User = require('../server/models/user.model');
const Trip = require('../server/models/trip.model');
const Chat = require('../server/models/chat.model');
const { resolveDestination } = require('../shared/destination');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/tripbuddy_dev';
const parsed = new URL(uri);
if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || parsed.pathname !== '/tripbuddy_dev') {
  throw new Error('Demo seeding is restricted to the loopback tripbuddy_dev database.');
}
const date = days => { const d = new Date(); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
const samples = [
  { title: 'Kyoto, slowly: lanes, gardens & spring light', country: 'Japan', city: 'Kyoto', offset: 165, days: 5, totalSlots: 5, categories: ['Culture', 'Food'], imageUrl: '/demo-images/mountains.jpg', description: 'A small, walkable Kyoto week for curious independent travelers. Spring flowers are a possibility, never a promise; we will enjoy the city either way. No accommodation or tickets are booked.\n\nDAY 1 — Meet near Kyoto Station, settle in, and take an easy orientation walk.\nDAY 2 — Start early around Higashiyama, then leave the afternoon open for a rest or a neighborhood detour.\nDAY 3 — Follow the Philosopher’s Path and choose one garden or temple together.\nDAY 4 — Take the train to Uji for riverside time and tea, returning before dinner.\nDAY 5 — Share a final breakfast and keep departures flexible.\n\nPACE — Expect plenty of walking and stairs, with open afternoons. We will use local trains and buses, check current crowd guidance, and agree each day together in the group chat. Each traveler books and pays for their own transport, lodging and meals.' },
  { title: 'The Algarve on foot: Lagos & the coast', country: 'Portugal', city: 'Lagos', offset: 195, days: 6, totalSlots: 5, categories: ['Nature', 'Beach'], imageUrl: '/demo-images/coast.jpg', description: 'A relaxed base in Lagos with coastal walks, town time and room to change plans. Boat and beach activities depend on sea and weather conditions; nothing is pre-booked.\n\nDAY 1 — Meet in town, check in independently, and share a simple welcome dinner.\nDAY 2 — Walk the Ponta da Piedade viewpoints and choose a beach stop at our own pace.\nDAY 3 — Keep it local: market breakfast, old-town lanes, and a free afternoon.\nDAY 4 — Optional weather-permitting boat trip; anyone skipping it can take a slower town day.\nDAY 5 — Take the train or bus for a choose-your-own day along the coast, then regroup for dinner.\nDAY 6 — Coffee together and flexible departures.\n\nPACE — Easy to moderate walking, uneven coastal paths, and sun exposure. We will confirm transport, tide and weather conditions together. Each traveler arranges their own room and pays for their own meals and activities.' },
  { title: 'Taipei by neighborhood: tea, trails & night markets', country: 'Taiwan', city: 'Taipei', offset: 150, days: 5, totalSlots: 5, categories: ['Food', 'Culture'], imageUrl: '/demo-images/coast.jpg', description: 'A transit-first city stay with one optional half-day outdoors. Great for travelers who like to explore side by side, then take time on their own. All stops are suggestions, not reservations.\n\nDAY 1 — Meet near Taipei Main Station, get oriented, and choose a nearby dinner.\nDAY 2 — Ride the MRT to a historic district, take a long lunch, and try a night market together.\nDAY 3 — Choose between a short, weather-dependent trail and a slower museum/café day.\nDAY 4 — Take the train to Jiufen as an optional day trip; return before the evening rush.\nDAY 5 — Brunch, swap recommendations, and depart on individual schedules.\n\nPACE — Mostly city walking and public transport; trail participation is optional. We will keep dietary needs and rain plans in the chat. Lodging, transit and food are booked and paid individually.' },
  { title: 'Chiang Mai, with time to breathe', country: 'Thailand', city: 'Chiang Mai', offset: 90, days: 5, totalSlots: 5, categories: ['Food', 'Culture'], imageUrl: '/demo-images/mountains.jpg', description: 'A considerate small-group city break built around food, craft and an unhurried pace. No animal attractions or activities are included; the group can choose a locally run cooking class after checking current details.\n\nDAY 1 — Meet inside the old city, settle in, and find a relaxed shared dinner.\nDAY 2 — Walk the old-city lanes and temples, with a long midday break.\nDAY 3 — Visit a market in the morning; leave the afternoon open for cafés or rest.\nDAY 4 — Optional locally run cooking class, or a free day for independent plans.\nDAY 5 — Breakfast together and flexible checkout.\n\nPACE — Easy city walking in warm weather. We will agree transport and any shared activity in advance, dress respectfully at temples, and keep individual plans welcome. Each traveler books their own stay, meals and activities.' },
  { title: 'Marrakech in the morning, Atlas at your own pace', country: 'Morocco', city: 'Marrakesh', offset: 185, days: 5, totalSlots: 5, categories: ['Culture', 'Food'], imageUrl: '/demo-images/coast.jpg', description: 'A city-centered trip with one optional day outside town. The Atlas day depends on current road and weather conditions and will only be arranged with a licensed local operator after the group agrees.\n\nDAY 1 — Meet at a central café, get settled, and walk the nearby souks together.\nDAY 2 — Explore the medina in the morning, then leave the hottest part of the day unplanned.\nDAY 3 — Choose a garden or museum visit and regroup for a shared dinner.\nDAY 4 — Optional guided Atlas foothills day; those staying in town can make a slower plan.\nDAY 5 — Breakfast and departures.\n\nPACE — Busy streets, uneven paving and warm afternoons. We will keep meeting points clear, check current local guidance and agree any guide/transport costs before booking. Accommodation and meals are individual.' },
  { title: 'Florence & the small-town train days', country: 'Italy', city: 'Florence', offset: 174, days: 6, totalSlots: 5, categories: ['Culture', 'Food'], imageUrl: '/demo-images/mountains.jpg', description: 'A Florence base for art, neighborhood walks and one easy rail day trip chosen by the group. Museum slots and trains are not included or reserved.\n\nDAY 1 — Arrive independently, meet near Santa Maria Novella, and take a short orientation walk.\nDAY 2 — Explore the historic center early, with one museum chosen and booked in advance by each traveler.\nDAY 3 — Cross the Arno for Oltrarno workshops, gardens and an unhurried dinner.\nDAY 4 — Optional train day to Lucca; check the current timetable before deciding.\nDAY 5 — Leave the plan open for a market, a second museum or a quiet café day.\nDAY 6 — Coffee and flexible departures.\n\nPACE — Moderate city walking on cobbled streets; expect stairs and busy pavements. We will keep shared costs optional and split only what the group explicitly agrees to. Each traveler books their own lodging and tickets.' },
];

async function main() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    const password = await bcrypt.hash('TripBuddy2026!', 10);
    const travelers = [];
    for (const [i, name] of ['Alex Morgan', 'Maya Chen', 'Sam Rivera'].entries()) {
      const [firstName, lastName] = name.split(' ');
      travelers.push(await User.findOneAndUpdate({ email: i === 0 ? 'demo@tripbuddy.local' : `demo${i}@tripbuddy.local` }, { $setOnInsert: { firstName, lastName, username: ['alexwanders', 'mayatravels', 'samontheroad'][i], email: i === 0 ? 'demo@tripbuddy.local' : `demo${i}@tripbuddy.local`, password, bio: 'Sample traveler profile for the local TripBuddy preview.', countriesVisited: ['Portugal', 'Switzerland'] } }, { upsert: true, new: true, runValidators: true }));
    }
    const existingByHost = new Map(travelers.map(traveler => [String(traveler._id), []]));
    for (const trip of await Trip.find({ tags: 'local-demo' }).sort({ createdAt: 1 })) existingByHost.get(String(trip.hostId))?.push(trip);
    const usedDemoTrips = new Set();
    for (const [i, sample] of samples.entries()) {
      const host = travelers[i % travelers.length];
      const { offset, days, ...fields } = sample;
      const destination = resolveDestination(fields.country, fields.city);
      if (destination.error) throw new Error(destination.error);
      const values = { ...fields, ...destination, description: '[Demo itinerary] ' + fields.description, host: host.username, hostId: host._id, startDate: date(offset), endDate: date(offset + days), duration: days, totalSlots: sample.totalSlots, categories: sample.categories, imageUrl: sample.imageUrl, tags: ['local-demo'] };
      const oldDemo = existingByHost.get(String(host._id))?.find(trip => !usedDemoTrips.has(String(trip._id)));
      let trip;
      if (oldDemo) {
        usedDemoTrips.add(String(oldDemo._id));
        Object.assign(oldDemo, values);
        oldDemo.tripMates.addToSet(String(host._id));
        trip = await oldDemo.save();
      } else {
        trip = await Trip.create({ ...values, tripMates: [String(host._id)] });
      }
      await User.updateMany({ 'tripsPosted.tripId': trip._id }, { $pull: { tripsPosted: { tripId: trip._id } } });
      await User.updateOne({ _id: host._id }, { $addToSet: { tripsPosted: { tripId: trip._id, tripName: trip.title } } });
      await Chat.findOneAndUpdate({ trip: trip._id }, { $set: { chatName: trip.title }, $setOnInsert: { trip: trip._id, messages: [] }, $addToSet: { participants: host._id } }, { upsert: true });
    }
    console.log(`Local preview is ready: ${samples.length} detailed, clearly labeled sample itineraries.`);
    console.log('Sign in: demo@tripbuddy.local / TripBuddy2026!');
    console.log('Seeding is idempotent and preserves existing trips and profiles.');
  } finally { await mongoose.disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
