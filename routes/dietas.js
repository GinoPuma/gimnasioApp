const express = require('express');
const router = express.Router();
const dietaController = require('../controllers/dietaController');

router.post('/crear', (req, res) => dietaController.crearDieta(req, res));
router.put('/asignar', (req, res) => dietaController.asignarDieta(req, res));
router.get('/:id', (req, res) => dietaController.obtenerDieta(req, res));
router.get('/', (req, res) => dietaController.listarDietas(req, res));
router.delete('/:id', (req, res) => dietaController.eliminarDieta(req, res));

module.exports = router;