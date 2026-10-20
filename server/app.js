const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const {
  createServer
} = require('http');
const {
  Server
} = require('socket.io');
const User = require('./models/user.model');
const Trip = require('./models/trip.model');
const Chat = require('./models/chat.model');
const { resolveDestination } = require('../shared/destination');
class MongoSessionStore extends session.Store {
  constructor() {
    super();
    this.collection = mongoose.connection.collection('sessions');
  }
  get(id, cb) {
    this.collection.findOne({
      _id: id,
      expires: {
        $gt: new Date()
      }
    }).then(row => cb(null, row?.data || null), cb);
  }
  set(id, data, cb = () => {}) {
    this.collection.updateOne({
      _id: id
    }, {
      $set: {
        data,
        expires: new Date(data.cookie.expires || Date.now() + 86400000)
      }
    }, {
      upsert: true
    }).then(() => cb(), cb);
  }
  destroy(id, cb = () => {}) {
    this.collection.deleteOne({
      _id: id
    }).then(() => cb(), cb);
  }
  touch(id, data, cb = () => {}) {
    this.collection.updateOne({
      _id: id
    }, {
      $set: {
        expires: new Date(data.cookie.expires || Date.now() + 86400000)
      }
    }).then(() => cb(), cb);
  }
}
const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const id = value => {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) fail(400, 'Invalid ID');
  return value;
};
const string = (value, name, max = 200, min = 1) => {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) fail(400, `Invalid ${name}`);
  return value.trim();
};
const imageUrl = (value, name, allowGoogle = false) => {
  const result = string(value, name, 1000, 0);
  if (!result) return result;
  if (/^\/(?:uploads\/(?:[0-9a-f-]{36}\.(?:png|jpe?g|webp)|[a-f\d]{24}\/[0-9a-f-]{36}\.(?:png|jpe?g|webp))|demo-images\/[a-z0-9_-]+\.(?:png|jpe?g|webp))$/i.test(result)) return result;
  if (allowGoogle) {
    try {
      const url = new URL(result);
      if (url.protocol === 'https:' && url.hostname === 'lh3.googleusercontent.com' && !url.username && !url.password) return result;
    } catch {}
  }
  fail(400, `Invalid ${name}`);
};
const passwordInput = (value, name = 'password', min = 1) => {
  if (typeof value !== 'string' || value.length < min || Buffer.byteLength(value, 'utf8') > 72) fail(400, `${name} must contain ${min}-72 characters and at most 72 bytes`);
  return value;
};
const list = (value, name) => {
  if (!Array.isArray(value) || value.length > 30) fail(400, `Invalid ${name}`);
  return value.map(v => string(v, name, 80));
};
const date = value => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) fail(400, 'Invalid date');
  return new Date(value);
};
const safeUser = user => {
  const result = user.toObject ? user.toObject() : {
    ...user
  };
  delete result.password;
  delete result.__v;
  return result;
};
const auth = (req, res, next) => req.session?.user ? next() : res.status(401).json({
  message: 'Sign in to continue'
});
const self = req => {
  if (id(req.params.id) !== req.session.user.id) fail(403, 'Access denied');
};
const page = req => ({
  limit: Math.min(100, Math.max(1, Number(req.query.limit) || 100)),
  skip: Math.min(100000, Math.max(0, Number(req.query.offset) || 0))
});
function tripInput(body, existing) {
  const result = {};
  for (const field of ['title', 'country', 'city', 'continent', 'description']) if (body[field] !== undefined) result[field] = string(body[field], field, field === 'description' ? 5000 : 1000, field === 'title' ? 1 : 0);
  if (body.imageUrl !== undefined) result.imageUrl = imageUrl(body.imageUrl, 'image URL');
  for (const field of ['categories', 'tags']) if (body[field] !== undefined) result[field] = list(body[field], field);
  for (const field of ['startDate', 'endDate']) if (body[field] !== undefined) result[field] = date(body[field]);
  for (const field of ['duration', 'totalSlots']) if (body[field] !== undefined) {
    if (!Number.isInteger(Number(body[field])) || Number(body[field]) < 1 || Number(body[field]) > (field === 'totalSlots' ? 100 : 365)) fail(400, `Invalid ${field}`);
    result[field] = Number(body[field]);
  }
  const merged = {
    ...(existing?.toObject() || {}),
    ...result
  };
  if (!merged.title || !merged.startDate || !merged.endDate || !merged.totalSlots) fail(400, 'Title, dates and total slots are required');
  if (new Date(merged.endDate) <= new Date(merged.startDate)) fail(400, 'End date must follow start date');
  const duration = Math.ceil((new Date(merged.endDate) - new Date(merged.startDate)) / 86400000);
  if (duration > 365) fail(400, 'Trips cannot exceed 365 days');
  const locationChanged = !existing || merged.country !== existing.country || merged.city !== existing.city;
  if (locationChanged) {
    const destination = resolveDestination(merged.country, merged.city);
    if (destination.error) fail(400, destination.error);
    result.country = destination.country;
    result.city = destination.city;
  }
  if (merged.totalSlots < (existing?.tripMates.length || 1)) fail(409, 'Capacity cannot be smaller than current membership');
  if (!existing || result.startDate || result.endDate) result.duration = duration;
  return result;
}
function limiter(max, keyFor = req => req.ip) {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (buckets.size > 10000) for (const [key, item] of buckets) if (item.until < now) buckets.delete(key);
    const key = keyFor(req);
    let entry = buckets.get(key);
    if (!entry || entry.until < now) {
      entry = {
        until: now + 60000,
        count: 0
      };
      buckets.set(key, entry);
    }
    if (++entry.count > max) {
      res.set('Retry-After', '60');
      return res.status(429).json({
        message: 'Too many requests. Try again shortly.'
      });
    }
    next();
  };
}
function createApp(options = {}) {
  const app = express();
  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) throw new Error('Set CLIENT_ORIGIN to the public HTTPS frontend origin');
  let origin;
  try {
    const configuredOrigin = new URL(process.env.CLIENT_ORIGIN || 'http://localhost:5173');
    if (!['http:', 'https:'].includes(configuredOrigin.protocol) || configuredOrigin.username || configuredOrigin.password || configuredOrigin.pathname !== '/' || configuredOrigin.search || configuredOrigin.hash) throw new Error();
    if (process.env.NODE_ENV === 'production' && configuredOrigin.protocol !== 'https:') throw new Error();
    origin = configuredOrigin.origin;
  } catch {
    throw new Error('CLIENT_ORIGIN must be an origin URL without a path; production requires HTTPS');
  }
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(proxyHops) || proxyHops < 0 || proxyHops > 10) throw new Error('TRUST_PROXY_HOPS must be an integer between 0 and 10');
  if (proxyHops) app.set('trust proxy', proxyHops);
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use((req, res, next) => {
    if (Object.keys(req.query).some(key => /[\[\]$.]/.test(key))) return res.status(400).json({
      message: 'Invalid query parameters'
    });
    next();
  });
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    });
    if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  app.use(cors({
    origin,
    credentials: true
  }));
  app.use(limiter(Number(process.env.RATE_LIMIT_MAX) || 600));
  app.use(express.json({
    limit: '256kb'
  }));
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) throw new Error('Set SESSION_SECRET to at least 32 characters');
  const sessionCookieName = process.env.NODE_ENV === 'production' ? '__Host-tripbuddy.sid' : 'tripbuddy.sid';
  const sessionMiddleware = session({
    name: sessionCookieName,
    secret: secret || crypto.randomBytes(48).toString('hex'),
    store: options.sessionStore || new MongoSessionStore(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000
    }
  });
  app.use(sessionMiddleware);
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.headers.origin && req.headers.origin !== origin) return res.status(403).json({
      message: 'Origin not allowed'
    });
    next();
  });
  const get = (url, ...handlers) => app.get(url, ...handlers.map(fn => fn === auth ? auth : wrap(fn)));
  const post = (url, ...handlers) => app.post(url, ...handlers.map(fn => fn === auth ? auth : wrap(fn)));
  // This queue coordinates related writes in this single API process. Multiple
  // API workers require replica-set transactions or a distributed equivalent.
  const tripQueues = new Map();
  const socketRateBuckets = new Map();
  const withTrip = async (tripId, operation) => {
    tripId = String(tripId).toLowerCase();
    const previous = tripQueues.get(tripId) || Promise.resolve();
    let release;
    const current = new Promise(resolve => {
      release = resolve;
    });
    tripQueues.set(tripId, current);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (tripQueues.get(tripId) === current) tripQueues.delete(tripId);
    }
  };
  const tripMutation = handler => (req, res) => withTrip(id(req.params.tripId || req.params.id || req.body.tripId), () => handler(req, res));
  const ownedTrip = async req => {
    const trip = await Trip.findById(id(req.params.id));
    if (!trip) fail(404, 'Trip not found');
    if (String(trip.hostId) !== req.session.user.id) fail(403, 'Only the host can change this trip');
    return trip;
  };
  const chatFor = async (chatId, userId) => {
    const chat = await Chat.findById(id(chatId)).select('-messages');
    if (!chat) fail(404, 'Chat not found');
    const trip = await Trip.findOne({
      _id: chat.trip,
      tripMates: userId
    });
    if (!trip) fail(403, 'Join this trip to access its chat');
    return chat;
  };
  async function removeTrip(trip) {
    const chats = await Chat.find({
      trip: trip._id
    }).select('_id');
    for (const chat of chats) app.locals.io?.in(String(chat._id)).socketsLeave(String(chat._id));
    await Trip.deleteOne({
      _id: trip._id
    });
    await User.updateMany({}, {
      $pull: {
        tripsJoined: {
          tripId: trip._id
        },
        tripsPosted: {
          tripId: trip._id
        }
      }
    });
    await Chat.deleteMany({
      trip: trip._id
    });
  }
  app.use(['/api/auth/login', '/api/user/register', '/api/auth/google/callback'], limiter(Number(process.env.AUTH_RATE_LIMIT_MAX) || 30));
  // Password auth is retained for local development and test fixtures. Production
  // defaults to the verified Google identity flow; enabling legacy auth is explicit.
  const allowLegacyPasswordAuth = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LEGACY_PASSWORD_AUTH === 'true';
  if (allowLegacyPasswordAuth) post('/api/user/register', async (req, res) => {
    const firstName = string(req.body.firstName, 'first name', 80),
      lastName = string(req.body.lastName, 'last name', 80),
      username = string(req.body.username, 'username', 50);
    const email = string(req.body.email, 'email', 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Invalid email');
    const password = passwordInput(req.body.password, 'password', 8);
    if (await User.exists({
      $or: [{
        email
      }, {
        username
      }]
    })) fail(409, 'Email or username already registered');
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: await bcrypt.hash(password, 10)
    });
    res.status(201).json({
      message: 'Account created successfully',
      user: safeUser(user)
    });
  });
  if (allowLegacyPasswordAuth) post('/api/auth/login', async (req, res) => {
    const email = string(req.body.email, 'email', 254).toLowerCase(),
      password = passwordInput(req.body.password);
    const user = await User.findOne({
      email
    });
    if (!user || !(await bcrypt.compare(password, user.password))) fail(401, 'Invalid email or password');
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.user = {
      id: String(user._id),
      email: user.email,
      username: user.username
    };
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.json({
      message: 'Login successful',
      session: req.session.user
    });
  });
  get('/api/auth/me', auth, async (req, res) => {
    const user = await User.findById(req.session.user.id).select('-password');
    if (!user) fail(401, 'Session expired');
    res.json(safeUser(user));
  });
  const logout = async (req, res) => {
    const userId = req.session?.user?.id;
    await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    if (userId) app.locals.io?.in(`user:${userId}`).disconnectSockets(true);
    res.clearCookie(sessionCookieName, { path: '/' });
    res.json({
      message: 'Logout successful'
    });
  };
  post('/api/auth/logout', logout);
  post('/api/auth/google/callback', async (req, res) => {
    if (req.get('X-Requested-With') !== 'XmlHttpRequest') fail(403, 'Google sign-in request was not accepted');
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).json({
      message: 'Google sign-in is not configured. Add the Google OAuth client credentials to the app settings.'
    });
    const code = string(req.body.code, 'authorization code', 4096);
    const {
      OAuth2Client
    } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');
    const googleRequest = client.transporter.request.bind(client.transporter);
    client.transporter.request = options => googleRequest({
      ...options,
      timeout: 8000,
      retry: false
    });
    let identity;
    try {
      const {
        tokens
      } = await client.getToken(code);
      if (!tokens.id_token) fail(401, 'Google did not return an identity token');
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      identity = ticket.getPayload();
      if (!identity?.email_verified || !identity.email) fail(401, 'A verified Google email is required');
    } catch (error) {
      const providerError = error?.response?.data?.error || error?.code || error?.name || 'unknown_error';
      console.error('Google OAuth exchange rejected', {
        providerError: String(providerError).slice(0, 100),
        httpStatus: Number(error?.response?.status) || undefined
      });
      if (['EACCES', 'ENETUNREACH', 'ECONNREFUSED', 'ETIMEDOUT'].includes(providerError)) fail(503, 'This server cannot reach Google right now. Check outbound network access and try again.');
      if (providerError === 'invalid_client') fail(503, 'Google sign-in configuration was rejected. Check that the server client ID and secret belong to the same OAuth client.');
      if (providerError === 'invalid_grant') fail(401, 'Google authorization expired or was already used. Please start sign-in again.');
      fail(401, 'Google sign-in failed. Please try again.');
    }
    let user = await User.findOne({ email: identity.email.toLowerCase() });
    if (!user) {
      const givenName = String(identity.given_name || identity.name?.split(' ')[0] || 'Traveler').slice(0, 80);
      const familyName = String(identity.family_name || identity.name?.split(' ').slice(1).join(' ') || 'Buddy').slice(0, 80);
      const base = String(identity.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'traveler';
      let username = base;
      for (let suffix = 2; await User.exists({ username }); suffix++) username = `${base.slice(0, 45)}${suffix}`;
      try {
        user = await User.create({
          firstName: givenName,
          lastName: familyName,
          username,
          email: identity.email.toLowerCase(),
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          imageUrl: identity.picture ? imageUrl(identity.picture, 'Google profile image', true) : undefined
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        user = await User.findOne({ email: identity.email.toLowerCase() });
        if (!user) throw error;
      }
    }
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.user = {
      id: String(user._id),
      email: user.email,
      username: user.username
    };
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.json({
      message: 'Login successful',
      session: req.session.user
    });
  });
  get('/api/user/getAllUsers', auth, async (req, res) => {
    const {
      limit,
      skip
    } = page(req);
    res.json(await User.find().select('username firstName lastName bio imageUrl countriesVisited countriesPlanned').limit(limit).skip(skip));
  });
  get('/api/user/getUserById/:id', async (req, res) => {
    const userId = id(req.params.id);
    const isSelf = req.session?.user?.id === userId;
    const user = await User.findById(userId).select(isSelf ? '-password' : 'username firstName lastName bio imageUrl countriesVisited countriesPlanned');
    if (!user) fail(404, 'User not found');
    const result = safeUser(user);
    if (!isSelf) {
      delete result.email;
      delete result.age;
      delete result.tripsJoined;
      delete result.tripsPosted;
    }
    res.json(result);
  });
  app.put('/api/user/:id/editProfile', auth, wrap(async (req, res) => {
    self(req);
    const update = {};
    for (const field of ['firstName', 'lastName', 'bio']) if (req.body[field] !== undefined) update[field] = string(req.body[field], field, field === 'bio' ? 2000 : 1000, ['firstName', 'lastName'].includes(field) ? 1 : 0);
    if (req.body.imageUrl !== undefined) update.imageUrl = imageUrl(req.body.imageUrl, 'image URL', true);
    if (req.body.countriesVisited !== undefined) update.countriesVisited = list(req.body.countriesVisited, 'countries');
    if (req.body.countriesPlanned !== undefined) update.countriesPlanned = list(req.body.countriesPlanned, 'planned countries');
    if (req.body.age !== undefined) {
      const age = Number(req.body.age);
      if (!Number.isInteger(age) || age < 18 || age > 120) fail(400, 'Age must be between 18 and 120');
      update.age = age;
    }
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: update
    }, {
      new: true,
      runValidators: true
    });
    if (!user) fail(404, 'User not found');
    res.json({
      message: 'User profile updated',
      user: safeUser(user)
    });
  }));
  app.put('/api/user/:id/changePassword', auth, wrap(async (req, res) => {
    self(req);
    const user = await User.findById(req.params.id);
    if (!user || !(await bcrypt.compare(passwordInput(req.body.currentPassword, 'current password'), user.password))) fail(403, 'Current password is incorrect');
    user.password = await bcrypt.hash(passwordInput(req.body.newPassword, 'new password', 8), 10);
    await user.save();
    res.json({
      message: 'Password updated'
    });
  }));
  app.delete('/api/user/:id', auth, wrap(async (req, res) => {
    self(req);
    for (const trip of await Trip.find({
      hostId: req.params.id
    })) await withTrip(String(trip._id), () => removeTrip(trip));
    const chats = await Chat.find({
      participants: req.params.id
    }).select('_id');
    for (const chat of chats) app.locals.io?.in(`user:${req.params.id}`).socketsLeave(String(chat._id));
    await Trip.updateMany({
      tripMates: req.params.id
    }, {
      $pull: {
        tripMates: req.params.id
      }
    });
    await Chat.updateMany({}, {
      $pull: {
        participants: req.params.id
      }
    });
    await User.deleteOne({
      _id: req.params.id
    });
    await mongoose.connection.collection('sessions').deleteMany({
      'data.user.id': req.params.id
    });
    await logout(req, res);
  }));
  post('/api/trip/createTrip', auth, async (req, res) => {
    const userId = req.session.user.id;
    const trip = await Trip.create({
      ...tripInput(req.body),
      host: req.session.user.username,
      hostId: userId,
      tripMates: [userId]
    });
    await Chat.create({
      chatName: trip.title,
      trip: trip._id,
      participants: [userId]
    });
    await User.updateOne({
      _id: userId
    }, {
      $addToSet: {
        tripsPosted: {
          tripId: trip._id,
          tripName: trip.title
        }
      }
    });
    res.status(201).json(trip);
  });
  const tripFilter = req => {
    const filter = {};
    for (const key of ['country', 'city', 'continent', 'categories']) if (req.query[key] !== undefined) filter[key] = string(req.query[key], key, 100);
    if (req.query.startDate) filter.startDate = {
      $gte: date(req.query.startDate)
    };
    if (req.query.endDate) filter.endDate = {
      $lte: date(req.query.endDate)
    };
    if (req.query.category !== undefined) filter.categories = string(req.query.category, 'category', 100);
    if (req.query.q !== undefined) {
      const query = string(req.query.q, 'search', 100, 0);
      if (query) {
        const escaped = Array.from(query).map(char => "^$.*+?()[]{}|".includes(char) || char.charCodeAt(0) === 92 ? String.fromCharCode(92) + char : char).join("");
        filter.$or = ['title', 'country', 'city', 'continent', 'description', 'tags', 'categories'].map(field => ({
          [field]: {
            $regex: escaped,
            $options: 'i'
          }
        }));
      }
    }
    return filter;
  };
  const trips = async (req, res) => {
    const filter = tripFilter(req);
    const {
      limit,
      skip
    } = page(req);
    res.json(await Trip.find(filter).sort({
      createdAt: -1,
      _id: -1
    }).limit(limit).skip(skip));
  };
  get('/api/trip/getAllTrips', trips);
  get('/api/trip/getTrips', trips);
  get('/api/trip/myTrips', auth, async (req, res) => {
    const userId = req.session.user.id;
    const {
      limit,
      skip
    } = page(req);
    const filter = {
      $and: [tripFilter(req), {
        $or: [{
          hostId: userId
        }, {
          tripMates: userId
        }]
      }]
    };
    res.json(await Trip.find(filter).sort({
      createdAt: -1,
      _id: -1
    }).limit(limit).skip(skip));
  });
  get('/api/trip/getTripById/:hostId', async (req, res) => {
    const {
      limit,
      skip
    } = page(req);
    res.json(await Trip.find({
      $and: [tripFilter(req), {
        hostId: id(req.params.hostId)
      }]
    }).sort({
      createdAt: -1,
      _id: -1
    }).limit(limit).skip(skip));
  });
  get('/api/trip/getTripByTripId/:id', async (req, res) => {
    const trip = await Trip.findById(id(req.params.id));
    if (!trip) fail(404, 'Trip not found');
    res.json(trip);
  });
  app.put('/api/trip/editTrip/:id', auth, wrap(tripMutation(async (req, res) => {
    const trip = await ownedTrip(req);
    const update = tripInput(req.body, trip);
    const updated = await Trip.findOneAndUpdate({
      _id: trip._id,
      $expr: {
        $lte: [{
          $size: '$tripMates'
        }, update.totalSlots || trip.totalSlots]
      }
    }, {
      $set: update
    }, {
      new: true
    });
    if (!updated) fail(409, 'Membership changed; please refresh');
    if (update.title) {
      await Chat.updateMany({
        trip: trip._id
      }, {
        $set: {
          chatName: update.title
        }
      });
      await User.updateMany({
        'tripsJoined.tripId': trip._id
      }, {
        $set: {
          'tripsJoined.$[entry].tripName': update.title
        }
      }, {
        arrayFilters: [{
          'entry.tripId': trip._id
        }]
      });
      await User.updateMany({
        'tripsPosted.tripId': trip._id
      }, {
        $set: {
          'tripsPosted.$[entry].tripName': update.title
        }
      }, {
        arrayFilters: [{
          'entry.tripId': trip._id
        }]
      });
    }
    res.json({
      message: 'Trip information updated',
      trip: updated
    });
  })));
  post('/api/trip/joinTrip/:tripId', auth, tripMutation(async (req, res) => {
    const tripId = id(req.params.tripId),
      userId = req.session.user.id;
    const trip = await Trip.findOneAndUpdate({
      _id: tripId,
      tripMates: {
        $ne: userId
      },
      $expr: {
        $lt: [{
          $size: '$tripMates'
        }, '$totalSlots']
      }
    }, {
      $addToSet: {
        tripMates: userId
      }
    }, {
      new: true
    });
    if (!trip) {
      if (!(await Trip.exists({
        _id: tripId
      }))) fail(404, 'Trip not found');
      fail(409, 'Trip is full or you have already joined');
    }
    await Chat.updateOne({
      trip: tripId
    }, {
      $addToSet: {
        participants: userId
      }
    });
    await User.updateOne({
      _id: userId
    }, {
      $addToSet: {
        tripsJoined: {
          tripId: trip._id,
          tripName: trip.title
        }
      }
    });
    res.json({
      message: 'User joined the trip successfully',
      trip
    });
  }));
  post('/api/trip/leaveTrip/:tripId', auth, tripMutation(async (req, res) => {
    const tripId = id(req.params.tripId),
      userId = req.session.user.id;
    const previous = await Trip.findById(tripId);
    if (!previous) fail(404, 'Trip not found');
    if (String(previous.hostId) === userId) fail(409, 'Hosts must delete their trip instead of leaving');
    const trip = await Trip.findOneAndUpdate({
      _id: tripId,
      tripMates: userId
    }, {
      $pull: {
        tripMates: userId
      }
    }, {
      new: true
    });
    if (!trip) fail(409, 'You have not joined this trip');
    await User.updateOne({
      _id: userId
    }, {
      $pull: {
        tripsJoined: {
          tripId: trip._id
        }
      }
    });
    const chats = await Chat.find({
      trip: tripId
    }).select('_id');
    await Chat.updateMany({
      trip: tripId
    }, {
      $pull: {
        participants: userId
      }
    });
    for (const chat of chats) app.locals.io?.in(`user:${userId}`).socketsLeave(String(chat._id));
    res.json({
      message: 'User left the trip successfully',
      trip
    });
  }));
  app.delete('/api/trip/:id', auth, wrap(tripMutation(async (req, res) => {
    await removeTrip(await ownedTrip(req));
    res.json({
      message: 'Trip deleted successfully'
    });
  })));
  get('/api/chat/user/:userId/chats', auth, async (req, res) => {
    if (id(req.params.userId) !== req.session.user.id) fail(403, 'Access denied');
    const {
      limit,
      skip
    } = page(req);
    const joined = await Trip.find({
      tripMates: req.session.user.id
    }).select('_id');
    const userChats = await Chat.find({
      trip: {
        $in: joined.map(t => t._id)
      }
    }).select('-messages').populate('trip').limit(limit).skip(skip);
    res.json({
      userChats
    });
  });
  post('/api/chat/createChat', auth, tripMutation(async (req, res) => {
    const trip = await Trip.findById(id(req.body.tripId));
    if (!trip) fail(404, 'Trip not found');
    if (String(trip.hostId) !== req.session.user.id) fail(403, 'Only the host can create chat');
    const chat = await Chat.findOneAndUpdate({
      trip: trip._id
    }, {
      $setOnInsert: {
        chatName: trip.title,
        participants: trip.tripMates
      }
    }, {
      new: true,
      upsert: true
    });
    res.status(201).json({
      success: true,
      chat
    });
  }));
  get('/api/chat/:chatId/title', auth, async (req, res) => res.json((await chatFor(req.params.chatId, req.session.user.id)).chatName));
  get('/api/chat/:chatId', auth, async (req, res) => {
    const chat = await chatFor(req.params.chatId, req.session.user.id);
    const {
      limit,
      skip
    } = page(req);
    const row = await Chat.findById(chat._id).select({
      messages: {
        $slice: [-(skip + limit), limit]
      }
    });
    res.json({
      tripId: chat.trip,
      messages: row.messages
    });
  });
  async function sendMessage(chatId, userId, content) {
    const targetChat = await Chat.findById(id(chatId)).select('trip');
    if (!targetChat) fail(404, 'Chat not found');
    return withTrip(String(targetChat.trip), async () => {
      await chatFor(chatId, userId);
      const message = {
        _id: new mongoose.Types.ObjectId(),
        sender: userId,
        content: string(content, 'message', 4000),
        timestamp: new Date()
      };
      const chat = await Chat.findOneAndUpdate({
        _id: chatId,
        participants: userId
      }, {
        $push: {
          messages: {
            $each: [message],
            $slice: -1000
          }
        }
      }, {
        new: true
      }).select('_id');
      if (!chat) fail(403, 'Access denied');
      const result = {
        ...message,
        chatId
      };
      app.locals.io?.to(chatId).emit('newMessage', result);
      return result;
    });
  }
  post('/api/chat/:chatId/message', auth, async (req, res) => {
    const message = await sendMessage(id(req.params.chatId), req.session.user.id, req.body.content);
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
      fields: 5
    },
    fileFilter(req, file, cb) {
      cb(null, ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype));
    }
  });
  const uploadDir = path.join(__dirname, 'uploads');
  let uploadQueue = Promise.resolve();
  const serializeUploadWrite = async operation => {
    const previous = uploadQueue;
    let release;
    uploadQueue = new Promise(resolve => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  };
  async function directoryBytes(directory) {
    let total = 0;
    let entries = [];
    try { entries = await fs.readdir(directory, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return 0; throw error; }
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) total += await directoryBytes(entryPath);
      else if (entry.isFile()) total += (await fs.stat(entryPath)).size;
    }
    return total;
  }
  app.use('/uploads', express.static(uploadDir, {
    dotfiles: 'deny',
    maxAge: '1d',
    setHeaders(res) {
      res.set('Cross-Origin-Resource-Policy', 'same-site');
      res.set('X-Content-Type-Options', 'nosniff');
    }
  }));
  for (const url of ['/api/trip/upload', '/api/user/upload']) app.post(url, auth, limiter(Number(process.env.UPLOAD_RATE_LIMIT_MAX) || 12, req => req.session.user.id), upload.single('image'), wrap(async (req, res) => {
    if (!req.file) fail(400, 'Upload a PNG, JPEG or WebP image');
    const buffer = req.file.buffer;
    const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      jpeg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255,
      webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const ext = png ? 'png' : jpeg ? 'jpg' : webp ? 'webp' : null;
    if (!ext) fail(400, 'Invalid image content');
    const userId = req.session.user.id;
    const userUploadDir = path.join(uploadDir, userId);
    const userQuota = Number(process.env.USER_UPLOAD_QUOTA_BYTES) || 50 * 1024 * 1024;
    const totalQuota = Number(process.env.UPLOAD_STORAGE_QUOTA_BYTES) || 5 * 1024 * 1024 * 1024;
    await serializeUploadWrite(async () => {
      const [userBytes, totalBytes] = await Promise.all([directoryBytes(userUploadDir), directoryBytes(uploadDir)]);
      if (userBytes + buffer.length > userQuota) fail(413, 'Your photo storage is full. Remove an older image before uploading another.');
      if (totalBytes + buffer.length > totalQuota) fail(503, 'Photo storage is full. Please try again later.');
      await fs.mkdir(userUploadDir, { recursive: true });
      const filename = `${crypto.randomUUID()}.${ext}`;
      await fs.writeFile(path.join(userUploadDir, filename), buffer, { flag: 'wx' });
      req.uploadedImageUrl = `/uploads/${userId}/${filename}`;
    });
    res.json({
      url: req.uploadedImageUrl
    });
  }));
  get('/', async (req, res) => res.json({
    name: 'TripBuddy API'
  }));
  const health = async (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
  get('/healthcheck', health);
  get('/api/health', health);
  app.use((req, res) => res.status(404).json({
    message: 'Route not found'
  }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500;
    if (error.code === 11000) status = 409;
    if (['ValidationError', 'CastError', 'MulterError'].includes(error.name)) status = 400;
    if (error.code === 'LIMIT_FILE_SIZE' || error.type === 'entity.too.large') status = 413;
    res.status(status).json({
      message: status === 500 ? 'Internal server error' : error.code === 11000 ? 'Email or username already registered' : error.message
    });
  });
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    allowRequest: (req, callback) => callback(null, !req.headers.origin || req.headers.origin === origin),
    cors: {
      origin,
      credentials: true
    },
    maxHttpBufferSize: 16384
  });
  app.locals.io = io;
  io.engine.use(sessionMiddleware);
  io.use((socket, next) => socket.request.session?.user ? next() : next(new Error('Authentication required')));
  io.on('connection', socket => {
    const userId = socket.request.session.user.id;
    socket.join(`user:${userId}`);
    if (socketRateBuckets.size > 10000) for (const [key, bucket] of socketRateBuckets) if (Date.now() - bucket.start > 60000) socketRateBuckets.delete(key);
    const socketAction = fn => async (payload, callback) => {
      try {
        await new Promise((resolve, reject) => socket.request.session.reload(error => error ? reject(error) : resolve()));
        if (!socket.request.session.user) fail(401, 'Session expired');
        const data = await fn(payload);
        if (typeof callback === 'function') callback({
          ok: true,
          data
        });
      } catch (error) {
        if (typeof callback === 'function') callback({
          ok: false,
          message: error.status ? error.message : 'Unable to complete request'
        });else socket.emit('chatError', {
          message: error.status ? error.message : 'Session expired'
        });
      }
    };
    socket.on('joinRoom', socketAction(async payload => {
      const roomId = id(typeof payload === 'string' ? payload : payload?.roomId);
      const targetChat = await Chat.findById(roomId).select('trip');
      if (!targetChat) fail(404, 'Chat not found');
      return withTrip(String(targetChat.trip), async () => {
        await chatFor(roomId, userId);
        await socket.join(roomId);
        return {
          roomId
        };
      });
    }));
    socket.on('leaveRoom', payload => {
      const roomId = typeof payload === 'string' ? payload : payload?.roomId;
      if (typeof roomId === 'string' && !roomId.startsWith('user:')) socket.leave(roomId);
    });
    let socketRate = socketRateBuckets.get(userId);
    if (!socketRate || Date.now() - socketRate.start > 60000) {
      socketRate = { start: Date.now(), count: 0 };
      socketRateBuckets.set(userId, socketRate);
    }
    socket.on('sendMessage', socketAction(async payload => {
      if (Date.now() - socketRate.start > 60000) {
        socketRate.start = Date.now();
        socketRate.count = 0;
      }
      if (++socketRate.count > (Number(process.env.SOCKET_MESSAGE_RATE_LIMIT) || 60)) fail(429, 'Too many messages');
      return sendMessage(id(payload?.roomId), userId, payload?.content);
    }));
  });
  return {
    app,
    httpServer,
    io,
    sessionMiddleware
  };
}
module.exports = {
  createApp,
  MongoSessionStore
};
