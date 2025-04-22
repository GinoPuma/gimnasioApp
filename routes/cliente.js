const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

router.post('/', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const clientes = await Cliente.find().populate('usuarioId');
  res.json(clientes);
});

module.exports = router;
