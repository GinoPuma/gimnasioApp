const clienteService = require('../services/clienteService');

exports.obtenerCliente = async (req, res) => {
    try {
        const cliente = await clienteService.obtenerClientePorUsuario(req.params.usuarioId);
        if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearCliente = async (req, res) => {
  try {
      const { usuarioId, objetivo, nivel, observaciones } = req.body;
      
      if (!usuarioId) return res.status(400).json({ mensaje: 'El usuarioId es obligatorio' });

      const nuevoCliente = await clienteService.crearCliente(usuarioId, { objetivo, nivel, observaciones });
      res.status(201).json(nuevoCliente);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.obtenerClientes = async (req, res) => {
    try {
        const cliente = await clienteService.obtenerAllCliente();
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
