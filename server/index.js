// Import statements
const express = require('express');
const multer  = require('multer');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const corsOptions = require('./config/corsOptions');

require('dotenv').config();

const app = express(); 

app.use(express.json());

connectDB();

app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false },
    })
);

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

app.use('/api/user', require('./routes/user.route'));
app.use('/api/trip', require('./routes/trip.route'));
app.use('/api/auth', require('./routes/auth.route'));

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.get('/healthcheck', (req, res) => {
    res.send('Health check completed');
});