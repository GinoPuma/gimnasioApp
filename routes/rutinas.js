const express = require('express');
const router = express.Router();
const rutinaController = require('../controllers/rutinaController');

router.post('/crear', (req, res) => rutinaController.crearRutina(req, res));
router.put('/asignar', (req, res) => rutinaController.asignarRutina(req, res));
router.get('/:id', (req, res) => rutinaController.obtenerRutina(req, res));
router.get('/', (req, res) => rutinaController.listarRutinas(req, res));
router.delete('/:id', (req, res) => rutinaController.eliminarRutina(req, res));

module.exports = router;