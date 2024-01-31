const User = require('../models/user.model.js')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');


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
        res.status(400).json({ message: 'User does not exist' });
        // Here, you're sending a response and then also trying to send another response below
        throw new Error('User does not exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        // Similar issue: attempting to send multiple responses
        throw new Error('Invalid credentials');
    }

    //Store user data in the session

    req.session.user = {
        id: user._id,
        email: user.email,
        username: user.username
    };

    // Here, you're attempting to set the token to the user object and then send it as a response
    res.status(200).json({ message: 'Login successful', session: req.session.user });
});


module.exports = {
    login
}