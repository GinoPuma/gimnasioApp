const mongoose = require('mongoose');

const dietaSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientes' },
    entrenadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'entrenadores' },
    nombre: String,
    descripcion: String,
    fechaInicio: Date,
    fechaFin: Date,
    comidas: [
      {
        tipoComida: String,
        descripcion: String,
        caloriasEstimadas: Number
      }
    ]
});
  
module.exports = mongoose.model('dietas', dietaSchema);