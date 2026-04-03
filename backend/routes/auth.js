const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login de usuario (Obtener Token)
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Obtener mi perfil por Token
// @access  Private
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
