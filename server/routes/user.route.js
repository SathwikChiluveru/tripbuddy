const express = require('express')
const router = express.Router()

const userController = require('../controllers/user.controller')

router.get('/getAllUsers', userController.getAllUsers)
router.post('/register', userController.createNewUser)
router.get('/getUserById/:id', userController.getUserById)
router.put('/:id/changePassword', userController.changePassword)
router.put('/:id/editProfile', userController.editProfile);
router.delete('/:id', userController.deleteUser)
router.get('/logout', userController.logout)

module.exports = router
