const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/createChat', chatController.createChat);
router.get('/user/:userId/chats', chatController.fetchUserChats);
router.post('/:chatId/message', chatController.sendMessage);
router.get('/:chatId', chatController.getChatMessages);
router.get('/:chatId/title', chatController.getChatTitle);



module.exports = router;
