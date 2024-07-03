const express = require('express');
const AppController = require('../controllers/AppController');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UsersController');
const FilesController = require('../controllers/FilesController');

const router = express.Router();

// App endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User endpoints
router.get('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);

// Authentication endpoints
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files endpoints
router.get('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

module.exports = router;
