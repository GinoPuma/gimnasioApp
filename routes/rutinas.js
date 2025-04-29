const express = require('express');
const router = express.Router();
const rutinaController = require('../controllers/rutinaController');

// Rutas para gestión de rutinas
router.post('/crear', (req, res) => rutinaController.crearRutina(req, res));
router.put('/asignar', (req, res) => rutinaController.asignarRutina(req, res));

// Ruta para obtener el formulario de edición de una rutina
router.get('/:id/editar', (req, res) => rutinaController.mostrarFormularioEdicion(req, res));

// Ruta para ver detalles de una rutina
router.get('/:id', (req, res) => rutinaController.obtenerRutina(req, res));

// Ruta para listar rutinas (con filtros opcionales)
router.get('/', (req, res) => rutinaController.listarRutinas(req, res));

// Ruta para actualizar una rutina
router.put('/:id', (req, res) => rutinaController.actualizarRutina(req, res));

// Ruta para agregar ejercicio a una rutina
router.post('/:id/ejercicio', (req, res) => rutinaController.agregarEjercicio(req, res));

// Ruta para eliminar una rutina
router.delete('/:id', (req, res) => rutinaController.eliminarRutina(req, res));

module.exports = router;