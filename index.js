const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const connectDB = require('./config/db')
require('dotenv').config()
app.use(express.json());
const session = require('express-session')

connectDB()

app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false },
    })
);

app.use('/api/user', require('./routes/user.route'))
app.use('/api/trip', require('./routes/trip.route'))
app.use('/api/auth', require('./routes/auth.route'))

app.get('/', (req, res) => {
    res.send('Welcome')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

