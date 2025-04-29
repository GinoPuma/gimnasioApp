const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');
const usuarioService = require('../services/usuarioService')

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
  try {
    const usuario = await usuarioService.crearUsuario(req.body);
    
    // Redirigir según tipo de usuario
    if (usuario.tipoUsuario === 'cliente') {
      res.redirect('/frontend/login?registro=exitoso&tipo=cliente');
    } else if (usuario.tipoUsuario === 'entrenador') {
      res.redirect('/frontend/login?registro=exitoso&tipo=entrenador');
    } else {
      res.redirect('/frontend/registro?error=tipo_invalido');
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    res.redirect('/frontend/registro?error=registro_fallido');
  }
});

// Procesar login
router.post('/login', async (req, res) => {
  const { correo, contrasenia } = req.body;

  try {
    // Buscar el usuario por correo
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.render('login', { error: 'Correo electrónico no encontrado' });
    }

    // Verificar contraseña con bcrypt
    const bcrypt = require('bcryptjs');
    const esValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!esValida) {
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    // Verificar estado del usuario
    if (usuario.estado === 'bloqueado') {
      return res.render('login', { error: 'Su cuenta ha sido bloqueada. Contacte al administrador.' });
    }
    
    if (usuario.estado === 'inactivo') {
      return res.render('login', { error: 'Su cuenta está inactiva. Contacte al administrador.' });
    }

    // Guardar usuario en sesión
    req.session.usuario = {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      tipoUsuario: usuario.tipoUsuario
    };

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Redirigir según tipo de usuario
    if (usuario.tipoUsuario === 'cliente') {
      const cliente = await Cliente.findOne({ usuarioId: usuario._id });
      if (!cliente) {
        return res.render('login', { error: 'Perfil de cliente no encontrado' });
      }
      return res.redirect(`/frontend/clientes/${usuario._id}`);
    } else if (usuario.tipoUsuario === 'entrenador') {
      const entrenador = await Entrenador.findOne({ usuarioId: usuario._id });
      if (!entrenador) {
        return res.render('login', { error: 'Perfil de entrenador no encontrado' });
      }
      return res.redirect(`/frontend/entrenadores/${usuario._id}`);
    } else if (usuario.tipoUsuario === 'administrador') {
      // Redirigir al panel de administración
      return res.redirect('/admin/dashboard');
    } else {
      return res.render('login', { error: 'Tipo de usuario no reconocido' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    return res.render('login', { error: 'Error al iniciar sesión. Inténtelo de nuevo.' });
  }
});

// Mostrar dashboard de cliente
router.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ usuarioId: req.params.id }).populate('usuarioId');
    if (!cliente) return res.status(404).send('Cliente no encontrado');

    res.render('clienteDashboard', {
      nombre: cliente.usuarioId.nombre,
      idCliente: cliente._id
    });
  } catch (error) {
    console.error('Error al cargar cliente:', error);
    res.status(500).send('Error del servidor');
  }
});

// Mostrar dashboard de entrenador
router.get('/entrenadores/:id', async (req, res) => {
  try {
    console.log('ID de usuario del entrenador:', req.params.id);
    
    // Buscar el entrenador por el ID de usuario
    const entrenador = await Entrenador.findOne({ usuarioId: req.params.id }).populate('usuarioId');
    
    if (!entrenador) {
      console.error('Entrenador no encontrado para el ID de usuario:', req.params.id);
      return res.status(404).send('Entrenador no encontrado');
    }
    
    console.log('Entrenador encontrado:', entrenador._id);
    
    // Obtener las rutinas del entrenador
    const Rutina = require('../models/Rutina');
    const rutinas = await Rutina.find({ entrenadorId: entrenador._id.toString() });
    
    console.log('Rutinas encontradas:', rutinas.length);
    console.log('IDs de las rutinas:', rutinas.map(r => r._id));
    
    // Renderizar la vista con los datos
    res.render('entrenadorDashboard', {
      nombre: entrenador.usuarioId.nombre,
      idEntrenador: entrenador._id,
      rutinas: rutinas || [] // Pasar las rutinas o un array vacío si no hay
    });
  } catch (error) {
    console.error('Error al cargar entrenador:', error);
    res.status(500).send('Error del servidor: ' + error.message);
  }
});

module.exports = router;
