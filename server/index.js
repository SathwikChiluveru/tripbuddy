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

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
});

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

app.locals.io = io;

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle joining a chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });

  socket.on('sendMessage', ({ roomId, content }) => {
    io.to(roomId).emit('newMessage', { sender: socket.id, content });
      console.log('Message sent')
  });

  // Handle errors during connection
  socket.on('error', (error) => {
    console.error('Socket.IO connection error:', error);
});
});
