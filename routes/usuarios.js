const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.post('/', async (req,res) => {
    try {
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.status(201).json(usuario);

    } catch (err) {
        res.status(400).json({ error: err.message})    
    }
});

router.get('/', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  });
  
  router.get('/:id', async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  router.put('/:id', async (req, res) => {
    try {
      const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(usuario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  router.delete('/:id', async (req, res) => {
    try {
      const usuario = await Usuario.findByIdAndUpdate(req.params.id, { estado: 'inactivo' }, { new: true });
      res.json({ mensaje: 'Usuario desactivado', usuario });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  module.exports = router;