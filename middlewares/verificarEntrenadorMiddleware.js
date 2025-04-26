const Entrenador = require('../models/Entrenador');

exports.verificarEntrenador = async (req, res, next) => {
    try {
        if (req.body.tipoUsuario !== 'entrenador') return next();

        const entrenadorExistente = await Entrenador.findOne({ usuarioId: req.usuarioId });
        if (entrenadorExistente) return next();

        const nuevoEntrenador = new Entrenador({
            usuarioId: req.usuarioId,
            especialidad: req.body.especialidad || '',
            certificaciones: req.body.certificaciones || [],
            experienciaAnios: req.body.experienciaAnios || 0,
            descripcionPerfil: req.body.descripcionPerfil || ''
        });
        await nuevoEntrenador.save();

        console.log('✅ Entrenador registrado automáticamente con datos.');
        next();
    } catch (error) {
        console.error('❌ Error al registrar entrenador:', error);
        next(error);
    }
};
