const User = require('../models/user.model.js')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const saltRounds = 10  


// Create and Save a new User
const createNewUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    //Check for duplicate
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    console.log(username)

    //Hash password
    const hashPassword = await bcrypt.hash(password, 10)

    //Create and store new user
    const account = new User ({
        username,
        email,
        password: hashPassword
    })

    // If account is created successfully

    if(account) {
        res.status(201).json({message: 'Account created successfully'})
        await account.save() 
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

})

// Login User

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
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


// Get all users

const getAllUsers = asyncHandler(async (req, res) => {
    User
        .find()
        .select('-password')
        .then(users => {
            return res.status(200).send(users)
        })
        .catch(error => {
            console.log(error);
        })
})

const getUserById = asyncHandler(async (req, res) => {
    User
        .findById(req.params.id)
        .select('-password')
        .then(user => {
            return res.status(200).send(user)
        })
        .catch(error => {
            console.log(error);
        })
})

// Change password

const changePassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    try {
        // Find the user by ID from the request parameters
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Hash the new password before saving it to the database (using bcrypt)
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;

        // Save the updated user (including the new password) to the database
        await user.save();

        res.json({ message: `Password for ${user.username} updated` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
});




// Update user profile

const editProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { bio, age, username } = req.body;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.bio = bio;
      user.age = age;
      user.username = username;
      await user.save();
  
      res.status(200).json({ message: 'User profile updated', user });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile' });
    }
});

//Delete user

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Perform the deletion
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found for deletion' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// User Logout

const logout = asyncHandler(async (req, res) => {
    req.session.destroy((err=>{
        if(err){
            return res.status(500).json({message: 'Error logging out'});
        }

        res.clearCookie('connect.sid');
        res.status(200).json({message: 'Logout successful'});
    }))
});




module.exports = {
    createNewUser,
    login,
    getAllUsers,
    getUserById,
    changePassword,
    editProfile,
    deleteUser,
    logout
}