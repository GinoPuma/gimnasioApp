const express = require('express');
const router = express.Router();
const entrenadorController = require('../controllers/entrenadorController')

router.get('/ver', entrenadorController.obtenerEntrenador)
router.put('/actualizar', entrenadorController.actualizarEntrenador)

module.exports = router;