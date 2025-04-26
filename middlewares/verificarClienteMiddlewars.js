const Cliente = require('../models/Cliente');

exports.verificarCliente = async (req, res, next) => {
    try {
        if (req.body.tipoUsuario !== 'cliente') return next();

        const clienteExistente = await Cliente.findOne({ usuarioId: req.usuarioId });
        if (clienteExistente) return next();

        const nuevoCliente = new Cliente({
            usuarioId: req.usuarioId,
            objetivo: req.body.objetivo || '',       // Si viene vacío, guarda string vacío
            nivel: req.body.nivel || '',
            observaciones: req.body.observaciones || ''
        });
        await nuevoCliente.save();

        console.log('✅ Cliente registrado automáticamente con datos.');
        next();
    } catch (error) {
        console.error('❌ Error al registrar cliente:', error);
        next(error);
    }
};
