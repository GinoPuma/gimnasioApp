// routes/auth.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Asegúrate que la ruta al modelo sea correcta

// Mostrar el formulario de login (GET)
router.get('/login', (req, res) => {
    res.render('login'); // Asegúrate de tener una vista login.ejs
});

// Procesar el formulario de login (POST)
router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(400).send('Usuario no encontrado');
        }

        if (contraseña !== usuario.contraseña) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Guardar en sesión
        req.session.usuarioId = usuario._id;
        req.session.tipoUsuario = usuario.tipoUsuario;

        // Redirigir según el tipo de usuario
        if (usuario.tipoUsuario === 'cliente') {
            res.redirect(`/clientes/${usuario._id}/dashboard`);
        } else if (usuario.tipoUsuario === 'entrenador') {
            res.redirect(`/entrenadores/${usuario._id}/dashboard`);
        } else {
            res.status(400).send('Tipo de usuario no válido');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

// Exportar rutas
module.exports = router;
