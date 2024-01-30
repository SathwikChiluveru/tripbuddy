const express = require('express')
const router = express.Router()

const tripController = require('../controllers/trip.controller')
// const authenticateUser = require('../middleware/auth.js')

router.post('/createTrip', tripController.createTrip)
router.post('/joinTrip/:tripId', tripController.joinTrip)
router.get('/getAllTrips', tripController.getAllTrips)
router.put('/editTrip/:id', tripController.editTrip)
router.get('/getTripById/:id', tripController.getTripById)
router.delete('/:id', tripController.deleteTrip)
router.post('/leaveTrip/:tripId', tripController.leaveTrip)
router.get('/getTrips', tripController.getTrips)



module.exports = router
