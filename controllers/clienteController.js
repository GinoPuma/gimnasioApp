const Cliente = require('../models/Cliente');

exports.crearCliente = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().populate('usuarioId');
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
