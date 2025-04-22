const express = require('express');
const router = express.Router();
const Entrenador = require('../models/Entrenador');

router.post('/', async (req, res) => {
  try {
    const entrenador = new Entrenador(req.body);
    await entrenador.save();
    res.status(201).json(entrenador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const entrenadores = await Entrenador.find().populate('usuarioId');
  res.json(entrenadores);
});

module.exports = router;