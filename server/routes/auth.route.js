const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/google/callback', authController.handleGoogleCallback);

module.exports = router;

