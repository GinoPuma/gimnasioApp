const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/clientes', require('./routes/cliente'));
app.use('/api/entrenadores', require('./routes/entrenadores'));
app.use('/api/ejercicios', require('./routes/ejercicios'));
app.use('/api/rutinas', require('./routes/rutinas'));
app.use('/api/progresos', require('./routes/progreso'));
app.use('/api/dietas', require('./routes/dietas'));
app.use('/api/mensajes', require('./routes/mensajes'));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.error("Error conectando a MongoDB:", err));

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`)
});
