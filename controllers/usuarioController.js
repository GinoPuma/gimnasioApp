const usuarioService = require('../services/usuarioService');
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

exports.crearUsuario = async (req, res) => {
    try {
        // Validación básica
        if (!req.body.tipoUsuario || !['cliente', 'entrenador'].includes(req.body.tipoUsuario)) {
            return res.status(400).json({ error: 'Tipo de usuario inválido o no especificado' });
        }

        const usuario = await usuarioService.crearUsuario({
            ...req.body,
            estado: 'inactivo' // Establecer estado consistente
        });

        // Eliminar información sensible antes de responder
        const usuarioRespuesta = usuario.toObject();
        delete usuarioRespuesta.contrasenia;

        res.status(201).json(usuarioRespuesta);
    } catch (err) {
        console.error('Error al crear usuario:', err);
        res.status(400).json({ error: err.message });
    }
};