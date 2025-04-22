const Ejercicio = require('../models/Ejercicio');

exports.crearEjercicio = async (req, res) => {
  try {
    const ejercicio = new Ejercicio(req.body);
    await ejercicio.save();
    res.status(201).json(ejercicio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerEjercicios = async (req, res) => {
  try {
    const ejercicios = await Ejercicio.find();
    res.json(ejercicios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
