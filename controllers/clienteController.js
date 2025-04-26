const Cliente = require('../models/Cliente');

// Mostrar Dashboard del Cliente
exports.mostrarDashboard = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id).populate('usuarioId');

        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }

        const usuario = cliente.usuarioId;
        if (!usuario) {
            return res.status(404).send('Usuario asociado no encontrado');
        }

        // Renderizar la vista y pasar los datos necesarios
        res.render('clienteDashboard', {
            nombre: usuario.nombre,
            idCliente: cliente._id
        });
    } catch (error) {
        console.error('Error al mostrar el dashboard:', error);
        res.status(500).send('Error en el servidor');
    }
};
