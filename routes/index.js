const express = require('express');
const AppController = require('../controllers/AppController');
const UserController = require('../controllers/UsersController');

const router = express.Router();

// App endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User endpoints
router.get('/users', UserController.postNew)
router.get('/users/me', UserController.getMe)

// Authentication endpoints
router.get('/connect', AuthController.getConnect)
router.get('/disconnect', AuthController.getDisconnect)

module.exports = router;
