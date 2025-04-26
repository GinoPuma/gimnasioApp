const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');

// Mostrar formulario de registro
router.get('/registro', (req, res) => {
  res.render('registro');
});

// Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Procesar formulario de registro
router.post('/registro', async (req, res) => {
  const { nombre, correo, contraseña, tipoUsuario } = req.body;

  try {
    // Crear usuario
    const nuevoUsuario = new Usuario({ nombre, correo, contraseña, tipoUsuario });
    await nuevoUsuario.save();

    // Según el tipo de usuario, crear cliente o entrenador
    if (tipoUsuario === 'cliente') {
      const nuevoCliente = new Cliente({ nombre, correo, usuarioId: nuevoUsuario._id });
      await nuevoCliente.save();
    } else if (tipoUsuario === 'entrenador') {
      const nuevoEntrenador = new Entrenador({ nombre, correo, usuarioId: nuevoUsuario._id });
      await nuevoEntrenador.save();
    }

    res.redirect('/frontend/login');
  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).send('Error al registrar');
  }
});

// Procesar login
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo, contraseña });
    if (!usuario) {
      return res.status(401).send('Credenciales inválidas');
    }

    if (usuario.tipoUsuario === 'cliente') {
      res.redirect(`/frontend/clientes/${usuario._id}`);
    } else if (usuario.tipoUsuario === 'entrenador') {
      res.redirect(`/frontend/entrenadores/${usuario._id}`);
    } else {
      res.send('Tipo de usuario no reconocido');
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).send('Error en login');
  }
});

// Mostrar dashboard de cliente
router.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ usuarioId: req.params.id }).populate('usuarioId');
    if (!cliente) return res.status(404).send('Cliente no encontrado');

    res.render('clienteDashboard', { cliente });
  } catch (error) {
    console.error('Error al cargar cliente:', error);
    res.status(500).send('Error del servidor');
  }
});

// Mostrar dashboard de entrenador
router.get('/entrenadores/:id', async (req, res) => {
  try {
    const entrenador = await Entrenador.findOne({ usuarioId: req.params.id }).populate('usuarioId');
    if (!entrenador) return res.status(404).send('Entrenador no encontrado');

    res.render('entrenadorDashboard', { entrenador });
  } catch (error) {
    console.error('Error al cargar entrenador:', error);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
