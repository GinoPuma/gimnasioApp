const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    objetivo: String,
    nivel: String,
    obsrvaciones: String
});

module.exports = mongoose.model('Cliente', clienteSchema);