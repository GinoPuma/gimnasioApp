const mongoose = require('mongoose');

const dietaSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
    entrenadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrenador' },
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