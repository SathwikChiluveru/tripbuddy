const Trip = require('../models/trip.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const multer = require('multer');


const bucketName = process.env.AWS_BUCKET_NAME;
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const upload = multer({ dest: 'uploads/' });


// Create a new trip
const createTrip = asyncHandler(async (req, res) => {
  const { hostId, host, title, startDate, endDate, duration, totalSlots, country, city, categories, tags, description, imageUrl } = req.body;

  // When session is implemented do this:
  //host : req.session.user.username,
  // const hostId = req.session.user.id

  // hostid and host are temporarily passed through the body during trip creation
  const newTrip = new Trip({
    title,
    host,
    hostId,
    startDate,
    endDate,
    duration,
    totalSlots,
    country,
    city,
    categories,
    tags,
    description,
    imageUrl
  });

  console.log(newTrip)

  try {
    const savedTrip = await newTrip.save();

    // Add the trip to the user's tripsPosted array
    await User.findByIdAndUpdate(hostId, {
      $push: {
        tripsPosted: {
          tripId: savedTrip._id,
          tripName: savedTrip.title,
        },
      },
    });
    
    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const joinTrip = asyncHandler(async (req, res) => {
  // const { userId } = req.session.user.id;
  const { userId } = req.body;
  const { tripId } = req.params;
  
  console.log('User ID:', userId);
  console.log('Trip ID:', tripId);

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.tripMates.length >= trip.totalSlots) {
      return res.status(400).json({ message: 'Trip is already full' });
    }

    // Check if user is already in tripMates array
    if (trip.tripMates.includes(userId)) {
      return res.status(400).json({ message: 'User is already part of this trip' });
    }

    // Add the user to the tripMates array in the Trip Model
    const user = await User.findById(userId);
    trip.tripMates.push(user); 
    await trip.save();

    // Add trip ID and name to tripsJoined array in the User Model
    user.tripsJoined.push(trip);
    await user.save();

    res.status(200).json({ message: 'User joined the trip successfully', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });

  }

});

const getAllTrips = asyncHandler(async (req, res) => {
  try {
    const trips = await Trip.find();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getTripById = asyncHandler(async (req, res) => {
  Trip
      .findById(req.params.id)
      .then(trip => {
          return res.status(200).send(trip)
      })
      .catch(error => {
          console.log(error);
      })
})

const editTrip = asyncHandler(async (req, res) =>{
  const tripId = req.params.id
  const { title, startDate, endDate, duration, totalSlots, continent, country, city, description, categories, tags, } = req.body;

  try{
    const trip = await Trip.findById(tripId)

    if(!trip){
      return res.status(404).json({message: 'Trip not found'})
    }

    if(title) trip.title = title
    if(duration) trip.duration = duration
    if(startDate) trip.startDate = startDate
    if(endDate) trip.endDate = endDate
    if(totalSlots) trip.totalSlots = totalSlots
    if(continent) trip.continent = continent
    if(country) trip.country = country
    if(city) trip.city = city
    if(categories) trip.categories = categories
    if(tags) trip.tags = tags
    if(description) trip.description = description

    await trip.save()

    res.status(200).json({message: 'Trip information updated', trip})

  } catch(error){
    res.status(500).json({message: 'Error updating trip information'})
  }

})

const leaveTrip = asyncHandler(async (req, res) =>{
  const { userId } = req.body
  const { tripId } = req.params

  console.log('User ID:', userId);
  console.log('Trip ID:', tripId);

  try {

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const userIndex = trip.tripMates.findIndex(user => user._id.toString() === userId)

    if(userIndex === -1){
      return res.status(400).json({message: 'User is not part of this trip'})
    }

    trip.tripMates.splice(userIndex, 1)
    await trip.save()

    const user = await User.findById(userId)
    const tripIndex = user.tripsJoined.findIndex(joinedTrip => joinedTrip._id.toString() === tripId)

    if(tripIndex !== -1){
      user.tripsJoined.splice(tripIndex, 1)
      await user.save()
    }

    res.status(200).json({ message: 'User left the trip successfully', trip })
  }  catch(error){
    res.status(500).json({ message: error.message })
  }
})

const deleteTrip = asyncHandler(async (req, res) => {
  const tripId = req.params.id;

  console.log('Trip ID:', tripId);

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Update the tripsPosted array of the host user if not empty
    const hostUser = await User.findById(trip.hostId);
    if (hostUser.tripsPosted && hostUser.tripsPosted.length > 0) {
      hostUser.tripsPosted = hostUser.tripsPosted.filter(postedTrip => postedTrip.tripId.toString() !== tripId);
      await hostUser.save();
    }

    // Find all users who joined the trip
    const users = await User.find({ _id: { $in: trip.tripMates } });
    
    if (users && users.length > 0) {
      // Remove the trip from the tripsJoined array of each user who joined if not empty
      for (const user of users) {
        if (user.tripsJoined && user.tripsJoined.length > 0) {
          const tripIndex = user.tripsJoined.findIndex(joinedTrip => joinedTrip._id.toString() === tripId);
          if (tripIndex !== -1) {
            user.tripsJoined.splice(tripIndex, 1);
            await user.save();
          }
        }
      }
    }

    // Delete the trip from the Trip Model
    await Trip.findByIdAndDelete(tripId);

    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getTrips = asyncHandler(async (req, res) =>{
  try{

    //Extract filtering parameters from the request query
    const { startDate, endDate, country, categories} = req.query

    //Build a filter object based on the given parameters

    const filter = {}
    if (startDate) filter.startDate = { $gte: new Date(startDate) }
    if (endDate) filter.endDate = { $lte: new Date(endDate) }
    if (country) filter.country = country
    if (categories) filter.categories = categories

    //Query trips based on the filter const
    const filteredTrips = await Trip.find(filter)

    res.status(200).json(filteredTrips)
  } catch(error){
    res.status(500).json({message: error.message})
  }
})

//Search API has to be implemented later on

// Upload trip image

const uploadImage = async (req, res) => {
  try {
      const fileContent = fs.readFileSync(req.file.path);
      const params = {
          Bucket: bucketName,
          Key: `trip_images/${uuidv4()}.${req.file.mimetype.split('/')[1]}`,
          Body: fileContent,
          ContentType: "image/jpg, image/png, image/jpeg"
      };
      const data = await s3.upload(params).promise();
      // Save data.Location (S3 URL) in MongoDB
      res.status(200).send({ url: data.Location });
  } catch (error) {
      console.error('Error uploading image to S3:', error);
      res.status(500).send({ error: 'Failed to upload image' });
  }
};



module.exports = { createTrip, joinTrip, getAllTrips, editTrip, getTripById, deleteTrip, leaveTrip, getTrips, uploadImage };
