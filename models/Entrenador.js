const mongoose = require("mongoose");

const entrenadorSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },  // Cambié 'Usuario' por 'usuarios'
    especialidad: String,
    certificaciones: [String],
    experienciaAnios: Number,
    descripcionPerfil: String
});

module.exports = mongoose.model('entrenadores', entrenadorSchema);
