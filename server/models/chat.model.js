// chat.model.js

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatName: { type: String, trim: true},
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
