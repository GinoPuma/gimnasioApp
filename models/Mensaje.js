const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    remitenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    destinatarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    mensaje: String,
    fechaEnvio: { type: Date, default: Date.now },
    leido: { type: Boolean, default: false }
});
  
module.exports = mongoose.model('mensajes', mensajeSchema);