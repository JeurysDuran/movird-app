const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// Crear ruta dinámicamente y procesarla en OSRM
router.post('/', routeController.createRoute);

module.exports = router;
