const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  bio: { type: String },
  age: { type: Number },
  imageUrl: { type: String },
  countriesVisited: [{ type: String }], 
  tripsPosted: [{
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    tripName: { type: String },
  }],
  tripsJoined: [{
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    tripName: { type: String },
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
