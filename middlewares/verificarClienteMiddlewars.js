const Cliente = require('../models/Cliente');

exports.verificarCliente = async (req, res, next) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session || !req.session.usuario) {
            console.log('No hay sesión de usuario activa');
            return res.redirect('/frontend/login?error=sesion_requerida');
        }

        // Obtener el ID del usuario de la sesión
        const usuarioId = req.session.usuario._id;
        console.log('Verificando cliente para usuario:', usuarioId);

        // Buscar el cliente asociado al usuario
        const clienteExistente = await Cliente.findOne({ usuarioId });
        
        if (!clienteExistente) {
            console.error('No se encontró el perfil de cliente para el usuario:', usuarioId);
            return res.redirect('/frontend/login?error=perfil_no_encontrado');
        }

        // Agregar el cliente a la solicitud para uso posterior
        req.cliente = clienteExistente;
        req.user = { id: usuarioId, tipoUsuario: 'cliente' };
        
        console.log('Cliente verificado correctamente:', clienteExistente._id);
        next();
    } catch (error) {
        console.error('Error al verificar cliente:', error);
        res.status(500).send('Error del servidor al verificar el perfil de cliente');
    }
};
