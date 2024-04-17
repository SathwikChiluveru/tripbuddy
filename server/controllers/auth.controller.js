const User = require('../models/user.model.js')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios')

// Login User

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Apply validation rules
    await Promise.all([
        check('email').isEmail().withMessage('Invalid Email Address').run(req),
        check('password').notEmpty().withMessage('Password is required').run(req),
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    //Store user data in the session

    req.session.user = {
        id: user._id,
        email: user.email,
        username: user.username
    };

    // Here, you're attempting to set the token to the user object and then send it as a response
    return res.status(200).json({ message: 'Login successful', session: req.session.user });
});

const getGoogleUserData = async (access_token) => {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const data = await response.data;
    return data;
};

const handleGoogleCallback = async (req, res) => {
  try {
    const code = req.body.code
    console.log(code)
    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'postmessage',
    );
    const { tokens } = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(tokens);
    const userAuth = oAuth2Client.credentials;

    const userData = await getGoogleUserData(userAuth.access_token)
    let user = await User.findOne({ email: userData.email });

    req.session.user = {
        id: user._id,
        email: user.email,
        username: user.username
    };
    res.status(200).json({ message: 'Login successful', session: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
};


module.exports = {
    login,
    handleGoogleCallback,
}