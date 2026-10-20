require('dotenv').config();
const mongoose = require('mongoose');
const {
  createApp
} = require('./app');
async function start() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/tripbuddy_dev', {
    serverSelectionTimeoutMS: 5000
  });
  mongoose.set('bufferCommands', false);
  await Promise.all([require('./models/user.model').init(), require('./models/trip.model').init(), require('./models/chat.model').init()]);
  await mongoose.connection.collection('sessions').createIndex({
    expires: 1
  }, {
    expireAfterSeconds: 0
  });
  const server = createApp();
  await new Promise((resolve, reject) => {
    server.httpServer.once('error', reject);
    server.httpServer.listen(Number(process.env.PORT) || 3000, process.env.HOST || '127.0.0.1', resolve);
  });
  console.log(`TripBuddy API listening on ${process.env.HOST || '127.0.0.1'}:${server.httpServer.address().port}`);
  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    await new Promise(resolve => server.io.close(resolve));
    await mongoose.disconnect();
    clearTimeout(timeout);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return {
    ...server,
    shutdown
  };
}
if (require.main === module) start().catch(async error => {
  console.error(`Server startup failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
module.exports = {
  start,
  createApp
};
