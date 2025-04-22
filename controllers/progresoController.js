const ProgresoFisico = require('../models/ProgresoFisico');

exports.registrarProgreso = async (req, res) => {
  try {
    const progreso = new ProgresoFisico(req.body);
    await progreso.save();
    res.status(201).json(progreso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerProgresos = async (req, res) => {
  try {
    const progresos = await ProgresoFisico.find().populate('clienteId');
    res.json(progresos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
