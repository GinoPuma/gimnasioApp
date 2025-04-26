const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');  // Asegúrate de que la ruta al modelo sea correcta
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

// Ruta para registrar un usuario
router.post('/registrar', async (req, res, next) => {
    try {
        // Creación del usuario
        const nuevoUsuario = new Usuario({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            correo: req.body.correo,
            contrasenia: req.body.contrasenia,
            telefono: req.body.telefono,
            fechaNacimiento: req.body.fechaNacimiento,
            genero: req.body.genero,
            tipoUsuario: req.body.tipoUsuario,
            fechaRegistro: new Date(),
            estado: 'inactivo'
        });

        // Guardamos el usuario y pasamos el usuarioId al siguiente middleware
        const usuarioGuardado = await nuevoUsuario.save();
        req.usuarioId = usuarioGuardado._id;
        next(); // Continuamos con los middlewares de verificación (Cliente/Entrenador)
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
}, verificarCliente, verificarEntrenador, (req, res) => {
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
});

// Exportamos las rutas
module.exports = router;
