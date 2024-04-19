const express = require('express')
const router = express.Router()
const messageController = require('../controllers/message.controller')

router.post('/', messageController.createMessage);
router.get('/:tripId', messageController.getMessagesByTripId);


module.exports = router