const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/userMiddleware');

// Ruta para verificar si el correo ya existe
router.get('/:correo', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ correo: req.params.correo });
        if (usuario) {
            return res.json(usuario);  // Si existe, retornar usuario
        }
        res.json(null);  // Si no existe, retornar null
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para login
router.post('/login', usuarioController.loginUsuario);

// Ruta para crear un usuario
router.post('/', usuarioController.crearUsuario); 

// Obtener todos los usuarios
router.get('/', usuarioController.obtenerUsuarios); 

// Actualizar un usuario
router.put('/:id', usuarioController.actualizarUsuario); 

// Eliminar un usuario (Soft Delete)
router.delete('/:id', usuarioController.eliminarUsuario); 

// Obtener perfil de usuario
router.get('/perfil', verificarToken, async (req, res) => {
    const usuario = await Usuario.findById(req.usuarioId);
    res.json(usuario);
});

module.exports = router;
