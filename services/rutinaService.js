const Rutina = require('../models/Rutina');

class RutinaService {
    async crearRutina(data) {
        return await Rutina.create(data);
    }

    async asignarRutina(rutinaId, clienteId) {
        return await Rutina.findByIdAndUpdate(rutinaId, { clienteId }, { new: true });
    }

    async obtenerRutina(rutinaId) {
        return await Rutina.findById(rutinaId).populate('clienteId').populate('entrenadorId');
    }

    async listarRutinas() {
        return await Rutina.find().populate('clienteId').populate('entrenadorId');
    }

    async eliminarRutina(rutinaId) {
        return await Rutina.findByIdAndDelete(rutinaId);
    }
}

module.exports = new RutinaService();