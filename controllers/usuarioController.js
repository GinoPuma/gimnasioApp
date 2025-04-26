const usuarioService = require('../services/usuarioService');
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

exports.crearUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.crearUsuario(req.body);

        // Verificamos si es cliente o entrenador
        if (usuario.tipoUsuario === 'cliente') {
            await verificarCliente(usuario._id);
        } else if (usuario.tipoUsuario === 'entrenador') {
            await verificarEntrenador(usuario._id);
        }

        res.status(201).json(usuario);
    } catch (err) {
        console.error('Error al crear usuario:', err);
        res.status(400).json({ error: err.message });
    }
};
