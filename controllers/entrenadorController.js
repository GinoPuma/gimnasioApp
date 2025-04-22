const Entrenador = require('../models/Entrenador');

exports.crearEntrenador = async (req, res) => {
  try {
    const entrenador = new Entrenador(req.body);
    await entrenador.save();
    res.status(201).json(entrenador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.find().populate('usuarioId');
    res.json(entrenadores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};