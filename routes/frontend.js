const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');
const usuarioService = require('../services/usuarioService');
const bcrypt = require('bcryptjs');

// Mostrar formulario de registro
router.get('/registro', (req, res) => {
  // Obtener mensajes de la URL si existen
  let error = null;
  let success = null;
  
  // Manejar mensajes de error
  if (req.query.error) {
    switch(req.query.error) {
      case 'datos_incompletos':
        error = 'Por favor complete todos los campos requeridos.';
        break;
      case 'correo_existente':
        error = 'El correo electrónico ya está registrado.';
        break;
      case 'codigo_verificacion_invalido':
        error = 'El código de verificación no es válido.';
        break;
      case 'error_perfil_cliente':
        error = 'Error al crear el perfil de cliente.';
        break;
      case 'registro_fallido':
        error = 'Error al registrar el usuario. Por favor intente nuevamente.';
        break;
      default:
        error = req.query.error.replace(/_/g, ' ');
    }
  }
  
  // Manejar mensajes de éxito
  if (req.query.success) {
    switch(req.query.success) {
      case 'registro_cliente':
        success = 'Cliente registrado exitosamente. Ya puede iniciar sesión.';
        break;
      case 'registro_entrenador':
        success = 'Entrenador registrado exitosamente. Su cuenta será revisada por un administrador.';
        break;
      default:
        success = req.query.success.replace(/_/g, ' ');
    }
  }
  
  // Renderizar la vista con los mensajes
  res.render('registro', { error, success });
});

// Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para verificar usuarios registrados (solo para desarrollo)
router.get('/verificar-usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}).select('-contrasenia');
    const clientes = await Cliente.find({}).populate('usuarioId', '-contrasenia');
    const entrenadores = await Entrenador.find({}).populate('usuarioId', '-contrasenia');
    
    res.json({
      usuarios: {
        total: usuarios.length,
        datos: usuarios
      },
      clientes: {
        total: clientes.length,
        datos: clientes
      },
      entrenadores: {
        total: entrenadores.length,
        datos: entrenadores
      }
    });
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Procesar formulario de registro
router.post('/registro', async (req, res) => {
  try {
    console.log('Datos de registro recibidos:', JSON.stringify(req.body, null, 2));
    console.log('Tipo de usuario:', req.body.tipoUsuario);
    
    // Validar datos básicos
    const camposObligatorios = ['nombre', 'apellido', 'correo', 'contrasenia', 'tipoUsuario', 'genero', 'telefono', 'fechaNacimiento'];
    for (const campo of camposObligatorios) {
      if (!req.body[campo]) {
        console.error(`Campo obligatorio faltante: ${campo}`);
        return res.redirect(`/frontend/registro?error=campo_faltante_${campo}`);
      }
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.correo)) {
      return res.redirect('/frontend/registro?error=formato_correo_invalido');
    }
    
    // Validar contraseña (mínimo 6 caracteres)
    if (req.body.contrasenia.length < 6) {
      return res.redirect('/frontend/registro?error=contrasenia_muy_corta');
    }
    
    // Validaciones específicas según tipo de usuario
    if (req.body.tipoUsuario === 'cliente') {
      // Validar campos específicos de cliente
      if (!req.body.objetivo) {
        req.body.objetivo = 'No especificado'; // Valor predeterminado
      }
      if (!req.body.nivel) {
        req.body.nivel = 'principiante'; // Valor predeterminado
      }
    } else if (req.body.tipoUsuario === 'entrenador') {
      // Validar código de verificación para entrenadores
      if (!req.body.codigoVerificacion) {
        return res.redirect('/frontend/registro?error=codigo_verificacion_requerido');
      }
    } else {
      return res.redirect('/frontend/registro?error=tipo_usuario_invalido');
    }
    
    // Intentar crear el usuario
    try {
      // Verificar si ya existe un usuario con ese correo
      const usuarioExistente = await Usuario.findOne({ correo: req.body.correo });
      if (usuarioExistente) {
        console.log('Usuario ya existe con este correo:', req.body.correo);
        return res.redirect('/frontend/registro?error=correo_existente');
      }
      
      console.log('Creando nuevo usuario con datos validados');
      
      // Crear usuario directamente con el modelo
      if (req.body.tipoUsuario === 'cliente') {
        // Para clientes, creamos primero el usuario y luego el perfil de cliente
        const nuevoUsuario = new Usuario({
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          correo: req.body.correo,
          contrasenia: await bcrypt.hash(req.body.contrasenia, 10),
          telefono: req.body.telefono,
          fechaNacimiento: req.body.fechaNacimiento,
          genero: req.body.genero,
          tipoUsuario: 'cliente',
          estado: 'activo',
          verificado: true
        });
        
        const usuarioGuardado = await nuevoUsuario.save();
        console.log('Usuario cliente guardado exitosamente:', usuarioGuardado._id);
        
        // Crear perfil de cliente
        const nuevoCliente = new Cliente({
          usuarioId: usuarioGuardado._id,
          objetivo: req.body.objetivo || 'No especificado',
          nivel: req.body.nivel || 'principiante',
          observaciones: req.body.observaciones || ''
        });
        
        await nuevoCliente.save();
        console.log('Perfil de cliente guardado exitosamente');
        
        return res.redirect('/frontend/registro?success=registro_cliente');
      } else if (req.body.tipoUsuario === 'entrenador') {
        // Para entrenadores, usamos el servicio existente que maneja la validación del código
        const usuario = await usuarioService.crearUsuario(req.body);
        console.log('Usuario entrenador registrado exitosamente:', usuario._id);
        return res.redirect('/frontend/registro?success=registro_entrenador');
      } else {
        return res.redirect('/frontend/registro?error=tipo_invalido');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      // Capturar errores específicos
      if (error.code === 11000) {
        return res.redirect('/frontend/registro?error=correo_existente');
      }
      throw error; // Propagar el error para manejarlo en el catch general
    }
  } catch (error) {
    console.error('Error al procesar el registro:', error);
    
    // Manejar errores específicos
    if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
      return res.redirect('/frontend/registro?error=correo_existente');
    } else if (error.message.includes('código de verificación')) {
      return res.redirect('/frontend/registro?error=codigo_verificacion_invalido');
    } else if (error.message.includes('Error al crear el perfil de cliente')) {
      return res.redirect('/frontend/registro?error=error_perfil_cliente');
    } else if (error.message.includes('El campo')) {
      // Error de validación de campo
      const campo = error.message.split('El campo ')[1]?.split(' ')[0];
      if (campo) {
        return res.redirect(`/frontend/registro?error=campo_invalido_${campo}`);
      }
    }
    
    // Error genérico
    return res.redirect('/frontend/registro?error=registro_fallido');
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

    // Obtener información del entrenador si está asignado
    let entrenador = null;
    if (cliente.entrenadorId) {
      entrenador = await Entrenador.findById(cliente.entrenadorId).populate('usuarioId');
      if (entrenador) {
        entrenador = {
          id: entrenador._id,
          nombre: entrenador.usuarioId.nombre,
          apellido: entrenador.usuarioId.apellido,
          correo: entrenador.usuarioId.correo,
          especialidad: entrenador.especialidad || 'Entrenamiento general'
        };
      }
    }

    // Obtener las rutinas asignadas al cliente
    const Rutina = require('../models/Rutina');
    const rutinas = await Rutina.find({ clienteId: cliente._id })
      .populate('entrenadorId')
      .sort({ fechaInicio: -1 });

    console.log(`Se encontraron ${rutinas.length} rutinas asignadas al cliente ${cliente._id}`);
    
    // Obtener las dietas asignadas al cliente
    const Dieta = require('../models/Dieta');
    const dietas = await Dieta.find({ clienteId: cliente._id })
      .populate('entrenadorId')
      .sort({ fechaInicio: -1 });
      
    console.log(`Se encontraron ${dietas.length} dietas asignadas al cliente ${cliente._id}`);

    res.render('clienteDashboard', {
      nombre: cliente.usuarioId.nombre,
      idCliente: cliente._id,
      entrenador: entrenador,
      rutinas: rutinas,
      dietas: dietas
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
    const rutinas = await Rutina.find({ entrenadorId: entrenador._id.toString() })
      .populate('clienteId');
      
    // Obtener las dietas del entrenador
    const Dieta = require('../models/Dieta');
    const dietas = await Dieta.find({ entrenadorId: entrenador._id.toString() })
      .populate('clienteId');
    
    // Obtener los clientes asignados a este entrenador
    const clientes = await Cliente.find({ entrenadorId: entrenador._id })
      .populate('usuarioId', 'nombre apellido correo');
    
    console.log(`Clientes encontrados para el entrenador ${entrenador._id}: ${clientes.length}`);
    
    // Preparar los datos de los clientes para la vista
    const clientesData = clientes.map(cliente => ({
      _id: cliente._id,
      nombre: cliente.usuarioId.nombre,
      apellido: cliente.usuarioId.apellido,
      correo: cliente.usuarioId.correo,
      objetivo: cliente.objetivo || 'No especificado',
      nivel: cliente.nivel || 'Principiante',
      observaciones: cliente.observaciones || ''
    }));
    
    // Renderizar la vista con los datos
    res.render('entrenadorDashboard', {
      nombre: entrenador.usuarioId.nombre,
      idEntrenador: entrenador._id,
      rutinas: rutinas || [], // Pasar las rutinas o un array vacío si no hay
      dietas: dietas || [], // Pasar las dietas o un array vacío si no hay
      clientes: clientesData || [] // Pasar los clientes asignados
    });
  } catch (error) {
    console.error('Error al cargar entrenador:', error);
    res.status(500).send('Error del servidor: ' + error.message);
  }
});

module.exports = router;
