const express = require('express');
const router = express.Router();
const Rutina = require('../models/Rutina');
router.post('/', async (req, res) => {
  try {
    const rutina = new Rutina(req.body);
    await rutina.save();
    res.status(201).json(rutina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const rutinas = await Rutina.find().populate('clienteId entrenadorId');
  res.json(rutinas);
});

module.exports = router;