const express = require('express');
const router = express.Router();
const Ejercicio = require('../models/Ejercicio');
router.post('/', async (req, res) => {
  try {
    const ejercicio = new Ejercicio(req.body);
    await ejercicio.save();
    res.status(201).json(ejercicio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const ejercicios = await Ejercicio.find();
  res.json(ejercicios);
});

module.exports = router;