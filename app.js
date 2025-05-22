const express = require('express');
const connection = require('./database/connection');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Importar el modelo o servicio de ejercicios
const ejercicioService = require('./services/ejercicioService'); // Asegúrate que exista este archivo

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());  // Para procesar datos JSON
app.use(express.urlencoded({ extended: true }));  // Para procesar datos de formularios (x-www-form-urlencoded)

// Configuración de sesiones mejorada
app.use(session({
    secret: 'gimnasioAppSecretKey',
    resave: false,
    saveUninitialized: false, // Cambiado a false para evitar crear sesiones vacías
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Solo seguro en producción
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        httpOnly: true // Previene acceso desde JavaScript del cliente
    }
}));

// Importar middleware de autenticación
const { cargarDatosUsuario } = require('./middlewares/authMiddleware');

// Middleware para cargar datos del usuario en cada solicitud
app.use(cargarDatosUsuario);

// Middleware para registrar todas las solicitudes (logging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware para pasar datos de sesión a las vistas (de la rama remota)
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Configuración de vistas con EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// Servir archivos estáticos (CSS, imágenes, JS de frontend)
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Rutas de las vistas
app.get('/', (req, res) => {
    res.render('login'); 
});

// Ruta para Dietas
app.get('/dietas/:id/dietas', async (req, res) => {
    const entrenadorId = req.params.id;
    try {
        // Aquí iría tu lógica para obtener las dietas asociadas al entrenador desde la base de datos
        // Simulamos que tenemos las dietas del entrenador
        const dietas = [
            { nombre: 'Dieta A', descripcion: 'Descripción de la dieta A' },
            { nombre: 'Dieta B', descripcion: 'Descripción de la dieta B' }
        ];

        res.render('dietas', { dietas, entrenadorId });  // Pasa las dietas a la vista
    } catch (error) {
        res.status(500).send('Error cargando las dietas: ' + error.message);
    }
});

// Ruta para el perfil del entrenador
app.get('/mientrenador/:id/entrenador', async (req, res) => {
    const clienteId = req.params.id;
    try {
        // Importar los modelos necesarios
        const Cliente = require('./models/Cliente');
        const Entrenador = require('./models/Entrenador');
        const Usuario = require('./models/Usuario');
        
        // Buscar el cliente para obtener el ID del entrenador asignado
        const cliente = await Cliente.findById(clienteId);
        
        if (!cliente || !cliente.entrenadorId) {
            return res.status(404).send('No tienes un entrenador asignado. Por favor selecciona un entrenador primero.');
        }
        
        // Buscar el entrenador con sus datos de usuario
        const entrenador = await Entrenador.findById(cliente.entrenadorId).populate('usuarioId');
        
        if (!entrenador) {
            return res.status(404).send('Entrenador no encontrado');
        }
        
        // Buscar los clientes asignados a este entrenador
        const clientesDelEntrenador = await Cliente.find({ entrenadorId: entrenador._id })
            .populate('usuarioId', 'nombre apellido');
            
        // Buscar las rutinas creadas por este entrenador
        const Rutina = require('./models/Rutina');
        const rutinasDelEntrenador = await Rutina.find({ entrenadorId: entrenador._id })
            .populate('clienteId', 'usuarioId')
            .populate({
                path: 'clienteId',
                populate: {
                    path: 'usuarioId',
                    select: 'nombre apellido'
                }
            });
        
        // Preparar los datos del entrenador para la vista
        const datosEntrenador = {
            id: entrenador._id,
            nombre: entrenador.usuarioId.nombre,
            apellido: entrenador.usuarioId.apellido,
            especialidad: entrenador.especialidad || 'Entrenamiento general',
            descripcion: entrenador.descripcionPerfil || 'Entrenador profesional',
            correo: entrenador.usuarioId.correo,
            experiencia: entrenador.experienciaAnios ? `${entrenador.experienciaAnios} años de experiencia` : 'Experiencia profesional',
            certificaciones: entrenador.certificaciones || [],
            fechaAsignacion: cliente.fechaAsignacionEntrenador
        };
        
        // Preparar los datos de los clientes para la vista
        const clientesData = clientesDelEntrenador.map(cliente => ({
            nombre: cliente.usuarioId.nombre,
            apellido: cliente.usuarioId.apellido,
            objetivo: cliente.objetivo || 'No especificado'
        }));
        
        // Preparar los datos de las rutinas para la vista
        const rutinasData = rutinasDelEntrenador.map(rutina => ({
            nombre: rutina.nombre,
            descripcion: rutina.descripcion,
            duracion: rutina.duracionSemanas,
            clienteNombre: rutina.clienteId && rutina.clienteId.usuarioId ? `${rutina.clienteId.usuarioId.nombre} ${rutina.clienteId.usuarioId.apellido}` : 'Cliente'
        }));

        res.render('mientrenador', { 
            entrenador: datosEntrenador,
            clientes: clientesData,
            rutinas: rutinasData
        });
    } catch (error) {
        console.error('Error cargando el perfil del entrenador:', error);
        res.status(500).send('Error cargando el perfil del entrenador: ' + error.message);
    }
});

// Ruta corregida para ejercicios
app.get('/ejercicios', async (req, res) => {
    try {
        const ejercicios = await ejercicioService.listarEjercicios(); // Obtener todos los ejercicios
        res.render('ejercicios', { ejercicios, clienteId: req.user ? req.user.id : 'Invitado' });
    } catch (error) {
        res.status(500).send('Error cargando ejercicios: ' + error.message);
    }
});

// Rutas de la API
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/clientes', require('./routes/cliente'));
app.use('/api/entrenadores', require('./routes/entrenadores'));
app.use('/api/ejercicios', require('./routes/ejercicios'));

// Ruta para asignar dietas directamente (método alternativo)
app.post('/dietas/asignar-directo', async (req, res) => {
  try {
    const { dietaId, clienteId } = req.body;
    console.log('Solicitud de asignación directa de dieta recibida:', { dietaId, clienteId });
    
    if (!dietaId || !clienteId) {
      console.error('Faltan datos requeridos:', { dietaId, clienteId });
      return res.status(400).send('Faltan datos requeridos: dietaId y clienteId son obligatorios');
    }
    
    // Importar los modelos necesarios
    const Dieta = require('./models/Dieta');
    const Cliente = require('./models/Cliente');
    
    // Verificar que la dieta exista
    const dieta = await Dieta.findById(dietaId);
    if (!dieta) {
      console.error('Dieta no encontrada con ID:', dietaId);
      return res.status(404).send('Dieta no encontrada');
    }
    
    // Verificar que el cliente exista
    const cliente = await Cliente.findById(clienteId).populate('usuarioId');
    if (!cliente) {
      console.error('Cliente no encontrado con ID:', clienteId);
      return res.status(404).send('Cliente no encontrado');
    }
    
    // Actualizar la dieta con el clienteId usando findByIdAndUpdate
    const dietaActualizada = await Dieta.findByIdAndUpdate(
      dietaId,
      { clienteId: clienteId },
      { new: true }
    );
    
    // Verificar que la actualización se haya realizado correctamente
    if (!dietaActualizada || !dietaActualizada.clienteId) {
      throw new Error('No se pudo actualizar la dieta');
    }
    
    console.log('Dieta asignada correctamente:', {
      dietaId: dietaActualizada._id,
      dietaName: dietaActualizada.nombre,
      clienteId: dietaActualizada.clienteId,
      clienteName: cliente.usuarioId ? (cliente.usuarioId.nombre + ' ' + (cliente.usuarioId.apellido || '')) : 'Cliente sin nombre'
    });
    
    // Redirigir al dashboard del entrenador con mensaje de éxito
    const nombreCliente = cliente.usuarioId ? (cliente.usuarioId.nombre + ' ' + (cliente.usuarioId.apellido || '')) : 'Cliente seleccionado';
    return res.redirect(`/frontend/entrenadores/dashboard?mensaje=${encodeURIComponent('Dieta asignada correctamente a ' + nombreCliente)}`);
  } catch (error) {
    console.error('Error al asignar dieta directamente:', error);
    return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al asignar dieta: ' + error.message)}`);
  }
});

// Ruta para asignar rutinas directamente (método alternativo)
app.post('/rutinas/asignar-directo', async (req, res) => {
  try {
    const { rutinaId, clienteId } = req.body;
    console.log('Solicitud de asignación directa recibida:', { rutinaId, clienteId });
    
    if (!rutinaId || !clienteId) {
      console.error('Faltan datos requeridos:', { rutinaId, clienteId });
      return res.status(400).send('Faltan datos requeridos: rutinaId y clienteId son obligatorios');
    }
    
    // Importar los modelos necesarios
    const Rutina = require('./models/Rutina');
    const Cliente = require('./models/Cliente');
    
    // Verificar que la rutina exista
    const rutina = await Rutina.findById(rutinaId);
    if (!rutina) {
      console.error('Rutina no encontrada con ID:', rutinaId);
      return res.status(404).send('Rutina no encontrada');
    }
    
    // Verificar que el cliente exista
    const cliente = await Cliente.findById(clienteId).populate('usuarioId');
    if (!cliente) {
      console.error('Cliente no encontrado con ID:', clienteId);
      return res.status(404).send('Cliente no encontrado');
    }
    
    // Actualizar la rutina con el clienteId
    rutina.clienteId = clienteId;
    await rutina.save();
    
    console.log('Rutina asignada correctamente:', {
      rutinaId: rutina._id,
      rutinaName: rutina.nombre,
      clienteId: rutina.clienteId,
      clienteName: cliente.usuarioId.nombre + ' ' + cliente.usuarioId.apellido
    });
    
    // Redirigir al dashboard del entrenador con mensaje de éxito
    return res.redirect(`/frontend/entrenadores/dashboard?mensaje=${encodeURIComponent('Rutina asignada correctamente a ' + cliente.usuarioId.nombre + ' ' + cliente.usuarioId.apellido)}`);
  } catch (error) {
    console.error('Error al asignar rutina directamente:', error);
    return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al asignar rutina: ' + error.message)}`);
  }
});

// Ruta para las dietas del cliente
app.get('/clientes/:clienteId/dietas', async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    console.log('Obteniendo dietas para el cliente:', clienteId);
    
    // Importar los modelos necesarios
    const Dieta = require('./models/Dieta');
    const Cliente = require('./models/Cliente');
    
    // Verificar que el cliente exista
    const cliente = await Cliente.findById(clienteId).populate('usuarioId');
    if (!cliente) {
      console.error('Cliente no encontrado con ID:', clienteId);
      return res.status(404).send('Cliente no encontrado');
    }
    
    console.log('Cliente encontrado:', cliente._id, cliente.usuarioId.nombre);
    
    // Verificar todas las dietas en la base de datos que tengan este clienteId
    console.log('Buscando dietas con clienteId:', clienteId);
    
    // Obtener las dietas asignadas al cliente
    const dietas = await Dieta.find({ clienteId })
      .populate('entrenadorId')
      .sort({ fechaInicio: -1 });
    
    console.log(`Se encontraron ${dietas.length} dietas para el cliente ${clienteId}`);
    
    // Mostrar detalles de las dietas encontradas para depuración
    if (dietas.length > 0) {
      dietas.forEach((dieta, index) => {
        console.log(`Dieta ${index + 1}:`, {
          id: dieta._id,
          nombre: dieta.nombre,
          clienteId: dieta.clienteId,
          entrenadorId: dieta.entrenadorId
        });
      });
    } else {
      console.log('No se encontraron dietas asignadas a este cliente');
    }
    
    // Renderizar la vista con las dietas del cliente
    res.render('clienteDietas', {
      cliente,
      dietas,
      titulo: 'Mis Planes Nutricionales',
      mensaje: req.query.mensaje,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error al obtener dietas del cliente:', error);
    res.status(500).send('Error al obtener dietas: ' + error.message);
  }
});

// Ruta para las rutinas del cliente
app.get('/clientes/:clienteId/rutinas', async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    console.log('Obteniendo rutinas para el cliente:', clienteId);
    
    // Importar los modelos necesarios
    const Rutina = require('./models/Rutina');
    const Cliente = require('./models/Cliente');
    
    // Verificar que el cliente exista
    const cliente = await Cliente.findById(clienteId).populate('usuarioId');
    if (!cliente) {
      console.error('Cliente no encontrado con ID:', clienteId);
      return res.status(404).send('Cliente no encontrado');
    }
    
    console.log('Cliente encontrado:', cliente._id, cliente.usuarioId.nombre);
    
    // Verificar todas las rutinas en la base de datos que tengan este clienteId
    console.log('Buscando rutinas con clienteId:', clienteId);
    
    // Obtener las rutinas asignadas al cliente
    const rutinas = await Rutina.find({ clienteId })
      .populate('entrenadorId')
      .sort({ fechaInicio: -1 });
    
    console.log(`Se encontraron ${rutinas.length} rutinas para el cliente ${clienteId}`);
    
    // Mostrar detalles de las rutinas encontradas para depuración
    if (rutinas.length > 0) {
      rutinas.forEach((rutina, index) => {
        console.log(`Rutina ${index + 1}:`, {
          id: rutina._id,
          nombre: rutina.nombre,
          clienteId: rutina.clienteId,
          entrenadorId: rutina.entrenadorId
        });
      });
    } else {
      console.log('No se encontraron rutinas asignadas a este cliente');
      
      // Buscar si hay rutinas que deberían estar asignadas a este cliente
      const todasLasRutinas = await Rutina.find({});
      console.log(`Total de rutinas en la base de datos: ${todasLasRutinas.length}`);
      
      // Verificar si alguna rutina tiene este clienteId como string en lugar de ObjectId
      const rutinasConClienteIdString = todasLasRutinas.filter(r => 
        r.clienteId && r.clienteId.toString() === clienteId.toString());
      
      if (rutinasConClienteIdString.length > 0) {
        console.log('Se encontraron rutinas con clienteId como string:', rutinasConClienteIdString.length);
      }
    }
    
    // Renderizar la vista de rutinas del cliente
    return res.render('rutinasCliente', {
      rutinas: rutinas,
      clienteId: clienteId,
      nombreCliente: cliente.usuarioId.nombre + ' ' + cliente.usuarioId.apellido
    });
  } catch (error) {
    console.error('Error al obtener rutinas del cliente:', error);
    return res.status(500).send('Error al obtener rutinas del cliente: ' + error.message);
  }
});

app.use('/api/rutinas', require('./routes/rutinas'));
app.use('/api/progresos', require('./routes/progreso'));
app.use('/api/dietas', require('./routes/dietas'));
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/api', require('./routes/api')); // Nueva ruta para verificar la base de datos
app.use('/frontend', require('./routes/frontend'));

// Ruta para manejar las rutinas en la interfaz de usuario
app.use('/rutinas', require('./routes/rutinas'));

// Ruta para manejar los planes nutricionales
app.use('/dietas', require('./routes/dietas'));

// Ruta para manejar los entrenadores
app.use('/entrenadores', require('./routes/entrenadores'));

// Rutas para el panel de administración
app.use('/admin', require('./routes/admin'));

// Rutas para el chat
app.use('/chat', require('./routes/chat'));

// Configuración de Socket.IO
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Configurar Socket.IO
// Nota: Asegúrate de crear el archivo socket.js si aún no existe
try {
    require('./socket')(io);
} catch (error) {
    console.error('Error al cargar el módulo de socket:', error.message);
    console.log('Asegúrate de crear el archivo socket.js en la raíz del proyecto');
}

// Puerto de escucha
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Aplicación ejecutándose en http://localhost:${PORT}`);
});
