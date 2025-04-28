const Entrenador = require('../models/Entrenador');

class EntrenadorService {
    async crearEntrenador(usuarioId, datosEntrenador){
        return await Entrenador.create({ usuarioId, ...datosEntrenador});
    }

    async obtenerEntrenadorPorUsuario(usuarioId) {
        return await Entrenador.findOne({ usuarioId }).populate('usuarioId');
    }

    async obtenerAllEntrenador(){
        return await Entrenador.find();
    }

    async actualizarEntrenador(usuarioId, datosActualizados){
        return await Cliente.findOneAndUpdate(
            { usuarioId },
            { $set: datosActualizados },
            { new: true, runValidators: true }
        );
    }
}

module.exports = new EntrenadorService()