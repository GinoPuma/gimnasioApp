const express = require('express');
const router = express.Router();
const ProgresoFisico = require('../models/ProgresoFisico');

router.post('/', async (req, res) => {
  try {
    const progreso = new ProgresoFisico(req.body);
    await progreso.save();
    res.status(201).json(progreso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const progresos = await ProgresoFisico.find().populate('clienteId');
  res.json(progresos);
});

module.exports = router;
