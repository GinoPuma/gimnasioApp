const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    correo: { type: String, unique: true },
    contrasenia: String,
    telefono: String,
    fechaNacimiento: Date,
    genero: String,
    tipoUsuario: String,
    fechaRegistro: { type: Date, default: Date.now },
    estado: { type: String, default: "activo" }
})

module.exports = mongoose.model('usuarios', usuarioSchema);