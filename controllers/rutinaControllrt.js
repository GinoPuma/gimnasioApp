const Rutina = require('../models/Rutina');

exports.crearRutina = async (req, res) => {
  try {
    const rutina = new Rutina(req.body);
    await rutina.save();
    res.status(201).json(rutina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerRutinas = async (req, res) => {
  try {
    const rutinas = await Rutina.find().populate('clienteId entrenadorId');
    res.json(rutinas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};