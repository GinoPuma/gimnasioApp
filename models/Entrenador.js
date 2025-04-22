const mongoose = require("mongoose");

const entrenadorSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
    especialidad: String,
    certificaciones: [String],
    experienciaAnios: Number,
    descripcionPerfil: String
});

module.exports = mongoose.model('Entrenador', entrenadorSchema);