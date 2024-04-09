const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: String, required: true }, // Host will be the username of the creator
  hostId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the host/creator
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true, validate: endDateValidator }, // Adding validation for endDate
  duration: { type: Number, required: true },  totalSlots: { type: Number, required: true },
  tripMates: [{ type: String }], // Array of names of individuals who joined the trip
  continent: {type: String},
  country: { type: String },
  city:{type: String},
  categories: [{ type: String }],
  tags: [{type: String}],
  description: { type: String },
  imageUrl: { type: String },
}, { timestamps: true }); // Adds timestamps for createdAt and updatedAt

// Virtual property to calculate available slots left
tripSchema.virtual('slotsLeft').get(function() {
  return this.totalSlots - this.tripMates.length;
});

// Custom validator for endDate to ensure it's after the startDate
function endDateValidator(endDate) {
  return this.startDate < endDate;
}

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
