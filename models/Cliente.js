const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    objetivo: String,
    nivel: String,
    observaciones: String
});

module.exports = mongoose.model('Cliente', clienteSchema);
