const express = require('express');
const connection = require('./database/connection');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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
app.get('/', (req, res) => {
    res.render('login');  // Renderiza la vista de login (login.ejs)
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
app.use('/', require('./routes/login'));

app.use('/frontend', require('./routes/frontend'));

// Puerto de escucha
app.listen(3000, () => {
    console.log('Aplicación ejecutándose en http://localhost:3000');
});
