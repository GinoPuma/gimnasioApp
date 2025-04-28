const Dieta = require('../models/Dieta');

const crearDieta = async (data) => {
    return await Dieta.create(data);
};

const asignarDieta = async (dietaId, clienteId) => {
    return await Dieta.findByIdAndUpdate(dietaId, { clienteId }, { new: true });
};

const obtenerDieta = async (dietaId) => {
    return await Dieta.findById(dietaId).populate('clienteId').populate('entrenadorId');
};

const listarDietas = async () => {
    return await Dieta.find().populate('clienteId').populate('entrenadorId');
};

const eliminarDieta = async (dietaId) => {
    return await Dieta.findByIdAndDelete(dietaId);
};

module.exports = { crearDieta, asignarDieta, obtenerDieta, listarDietas, eliminarDieta };