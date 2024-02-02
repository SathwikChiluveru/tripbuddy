const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
require('dotenv').config()
app.use(express.json());
const session = require('express-session')
const corsOptions = require('./config/corsOptions')

connectDB()

app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false },
    })
);
app.use(cors(corsOptions))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

app.use('/api/user', require('./routes/user.route'))
app.use('/api/trip', require('./routes/trip.route'))
app.use('/api/auth', require('./routes/auth.route'))

app.get('/', (req, res) => {
    res.send('Welcome')
})

app.get('/healthcheck', (req, res) => {
    res.send('Health check completed')
})