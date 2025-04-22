const express = require('express');
const router = express.Router();
const Dieta = require('../models/Dieta');

router.post('/', async (req, res) => {
  try {
    const dieta = new Dieta(req.body);
    await dieta.save();
    res.status(201).json(dieta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const dietas = await Dieta.find().populate('clienteId entrenadorId');
  res.json(dietas);
});

module.exports = router;