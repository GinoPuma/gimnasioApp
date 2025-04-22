const Dieta = require('../models/Dieta');

exports.crearDieta = async (req, res) => {
  try {
    const dieta = new Dieta(req.body);
    await dieta.save();
    res.status(201).json(dieta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerDietas = async (req, res) => {
  try {
    const dietas = await Dieta.find().populate('clienteId entrenadorId');
    res.json(dietas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};