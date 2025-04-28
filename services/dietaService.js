const Dieta = require('../models/dieta');

class DietaService {
    async crearDieta(data) {
        return await Dieta.create(data);
    }

    async asignarDieta(dietaId, clienteId) {
        return await Dieta.findByIdAndUpdate(dietaId, { clienteId }, { new: true });
    }

    async obtenerDieta(dietaId) {
        return await Dieta.findById(dietaId).populate('clienteId').populate('entrenadorId');
    }

    async listarDietas() {
        return await Dieta.find().populate('clienteId').populate('entrenadorId');
    }

    async eliminarDieta(dietaId) {
        return await Dieta.findByIdAndDelete(dietaId);
    }
}

module.exports = new DietaService();