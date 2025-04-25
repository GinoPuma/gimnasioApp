const Cliente = require('../models/Cliente');

exports.verificarCliente = async (req, res, next) => {
    try {
        if (req.body.tipoUsuario !== 'cliente') return next(); // No es cliente, continuar sin crear nada

        const clienteExistente = await Cliente.findOne({ usuarioId: req.usuarioId });
        if (clienteExistente) return next(); // Si ya está registrado como cliente, no lo duplicamos

        const nuevoCliente = new Cliente({ usuarioId: req.usuarioId });
        await nuevoCliente.save();

        console.log('Cliente registrado automáticamente');
        next();
    } catch (error) {
        console.error('Error al registrar cliente:', error);
        next(error);
    }
};