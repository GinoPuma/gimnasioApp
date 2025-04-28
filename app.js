const express = require('express');
const connection = require('./database/connection');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar el modelo o servicio de ejercicios
const ejercicioService = require('./services/ejercicioService'); // Asegúrate que exista este archivo

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());  // Para procesar datos JSON
app.use(express.urlencoded({ extended: true }));  // Para procesar datos de formularios (x-www-form-urlencoded)

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
    const entrenadorId = req.params.id;
    try {
        // Aquí iría tu lógica para obtener los datos del entrenador desde la base de datos
        // Si usas un modelo de base de datos, podrías hacer algo como:
        // const entrenador = await Entrenador.findById(entrenadorId);

        // Simulamos que ya tenemos los datos del entrenador
        const entrenador = {
            id: entrenadorId,
            nombre: 'Juan Pérez',  // Esto lo sacarías de la base de datos
            especialidad: 'Entrenador de fuerza', // Datos de ejemplo
        };

        res.render('mientrenador', { entrenador });  // Pasamos los datos a la vista
    } catch (error) {
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
app.use('/api/rutinas', require('./routes/rutinas'));
app.use('/api/progresos', require('./routes/progreso'));
app.use('/api/dietas', require('./routes/dietas'));
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/frontend', require('./routes/frontend'));

// Puerto de escucha
app.listen(3000, () => {
    console.log('Aplicación ejecutándose en http://localhost:3000');
});
