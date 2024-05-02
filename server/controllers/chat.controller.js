const Chat = require('../models/chat.model');
const asyncHandler = require('express-async-handler');
const Message = require('../models/message.model');

const createChat = asyncHandler(async (req, res) => {
    const { tripId, tripTitle, userIds } = req.body;
    try {
        const newChat = new Chat({
            chatName: tripTitle,
            trip: tripId,
            participants: userIds
        });
        await newChat.save();
        res.status(201).json({ success: true, chat: newChat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const fetchUserChats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    try {
      const userChats = await Chat.find({ participants: userId }).populate('trip');
  
      res.status(200).json({ userChats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { sender, content } = req.body;
    const { io } = req.app.locals;

    // Retrieve chat details from the database
    const chat = await Chat.findById(chatId);

    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if the sender is a participant of the chat
    const isParticipant = chat.participants.includes(sender);
    if (!isParticipant) {
        return res.status(403).json({ message: 'You are not authorized to send messages in this chat' });
    }

    // If the sender is authorized, create and save the message
    const newMessage = {
        sender,
        content
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Emit a Socket.IO event to notify connected clients about the new message
    io.to(chatId).emit('newMessage', { chatId, sender, content });

    res.status(201).json({ message: 'Message sent successfully' });
});


const getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    try {
        // Retrieve the chat by its ID
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Return the messages of the chat
        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getChatTitle = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    try {
        // Retrieve the chat by its ID
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Return the messages of the chat
        res.status(200).json(chat.chatName);
    } catch (error) {
        res.status(500).json("Error, not found");
    }
});



  

module.exports = { createChat, fetchUserChats, sendMessage, getChatMessages, getChatTitle };
