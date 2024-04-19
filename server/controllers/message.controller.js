const Message = require('../models/message.model')
const asyncHandler = require('express-async-handler')

const createMessage = asyncHandler(async(req, res) => {
    try {
        const { tripId, sender, content } = req.body;
        const newMessage = new Message({ tripId, sender, content });
        await newMessage.save();
        res.status(201).json(newMessage);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
})

const getMessagesByTripId = asyncHandler(async(req, res) => {
    try {
        const { tripId } = req.params;
        const messages = await Message.find({ tripId }).sort({ timestamp: 1 });
        res.json(messages);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = {
    createMessage,
    getMessagesByTripId
}