const usuarioService = require('../services/usuarioService');
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

exports.crearUsuario = async (req, res) => {
    try {
        // Validación básica
        if (!req.body.tipoUsuario || !['cliente', 'entrenador'].includes(req.body.tipoUsuario)) {
            return res.status(400).json({ error: 'Tipo de usuario inválido o no especificado' });
        }

        // Validación específica para entrenadores
        if (req.body.tipoUsuario === 'entrenador' && !req.body.codigoVerificacion) {
            return res.status(400).json({ 
                error: 'Código de verificación requerido', 
                mensaje: 'Para registrarse como entrenador, debe proporcionar un código de verificación válido'
            });
        }

        // Crear usuario con los datos proporcionados
        // No establecemos el estado aquí, ya que el servicio lo manejará según el tipo de usuario
        const usuario = await usuarioService.crearUsuario(req.body);

        // Eliminar información sensible antes de responder
        const usuarioRespuesta = usuario.toObject();
        delete usuarioRespuesta.contrasenia;

        // Preparar mensaje de respuesta según el tipo de usuario
        let mensaje = 'Usuario creado exitosamente';
        if (usuario.tipoUsuario === 'entrenador') {
            mensaje = 'Su registro como entrenador ha sido recibido. Un administrador revisará su solicitud para completar la verificación.';
        } else if (usuario.tipoUsuario === 'cliente') {
            mensaje = 'Bienvenido a GimnasioApp. Su cuenta ha sido activada correctamente.';
        }

        res.status(201).json({
            usuario: usuarioRespuesta,
            mensaje: mensaje
        });
    } catch (err) {
        console.error('Error al crear usuario:', err);
        
        // Manejar errores específicos de verificación
        if (err.message.includes('código de verificación')) {
            return res.status(400).json({ 
                error: 'Error de verificación', 
                mensaje: err.message 
            });
        }
        
        res.status(400).json({ error: err.message });
    }
};