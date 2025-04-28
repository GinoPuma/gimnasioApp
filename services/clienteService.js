const Cliente = require('../models/Cliente');

class ClienteService {
    async crearCliente(usuarioId, datosCliente) {
        return await Cliente.create({ usuarioId, ...datosCliente });
    }

    async obtenerClientePorUsuario(usuarioId) {
        return await Cliente.findOne({ usuarioId }).populate('usuarioId');
    }

    async obtenerAllCliente() {
        return await Cliente.find();
    }

    async actualizarCliente(usuarioId, datosActualizados){
        return await Cliente.findOneAndUpdate(
            { usuarioId },
            { $set: datosActualizados },
            { new: true, runValidators: true }
        );
    }
}

module.exports = new ClienteService();
