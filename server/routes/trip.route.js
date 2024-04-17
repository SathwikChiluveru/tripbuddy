const express = require('express')
const router = express.Router()
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const tripController = require('../controllers/trip.controller')
// const authenticateUser = require('../middleware/auth.js')

router.post('/createTrip', tripController.createTrip)
router.post('/joinTrip/:tripId', tripController.joinTrip)
router.get('/getAllTrips', tripController.getAllTrips)
router.put('/editTrip/:id', tripController.editTrip)
router.get('/getTripById/:hostId', tripController.getTripById)
router.get('/getTripByTripId/:id', tripController.getTripByTripId)
router.delete('/:id', tripController.deleteTrip)
router.post('/leaveTrip/:tripId', tripController.leaveTrip)
router.get('/getTrips', tripController.getTrips)
router.post('/upload', upload.single('image'), tripController.uploadImage);




module.exports = router
