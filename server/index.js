// Import statements
const express = require('express');
const multer  = require('multer');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const corsOptions = require('./config/corsOptions');
const { Server } = require('socket.io');
const { createServer } = require("http");
const Message = require('./models/message.model')

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

app.use(cors({
    origin: 'http://localhost:5173'
}));


const PORT = process.env.PORT || 3000;

// Create an HTTP server instance
const httpServer = createServer(app);

// Pass the server instance to the Socket.IO constructor
const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173"
    }
  });
// For express servers, but we are using Socket IO
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
// });

httpServer.listen(3000);

app.use('/api/user', require('./routes/user.route'));
app.use('/api/trip', require('./routes/trip.route'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/chat', require('./routes/chat.route'));



app.get('/', (req, res) => {
    res.send('Welcome');
});

app.get('/healthcheck', (req, res) => {
    res.send('Health check completed');
});

io.on('connection', (socket) => {
    console.log(`User connected`);

    const tripId = "66155e88fc38d20761a08975";

    socket.join(tripId);
    console.log(`User joined room ${tripId}`);

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('chatMessage', async ({ tripId, sender, content }) => {
        try {
          const newMessage = new Message({ tripId, sender, content });
          await newMessage.save();
          io.to(tripId).emit('message', newMessage);
          console.log(newMessage.content)
        } catch (error) {
          console.error(error);
        }
    });

    // Join a room based on trip ID
    // socket.on('joinRoom', (tripId) => {
    //     socket.join(tripId);
    //     console.log(`User joined room ${tripId}`);
    // });
    
});