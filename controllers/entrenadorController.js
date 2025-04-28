const express = require('express');
const EntrenadorService = require('../services/entrenadorService')

exports.obtenerEntrenador = async (req, res) => {
  try {
      const entrenador = await EntrenadorService.obtenerEntrenadorPorUsuario(req.user.id);
      if (!entrenador) {
        return res.status(404).json({ error:'Entrenador no encontrado' })
      }
      res.json(entrenador);
  } catch (err) {
      console.error('Error al obtener los datos del entrenador:', error.message);
      res.status(500).json({ error: 'Error del servidor' });
  }
}


exports.actualizarEntrenador = async (req, res) => {
  try {
      const usuarioId = req.user.id;
      const datosActualizados = req.body;

      const entrenadorActualizado = await EntrenadorService.actualizarEntrenador(usuarioId, datosActualizados);
      
      if(!entrenadorActualizado){
        return res.status(404).json({ error:'Entrenador no encontrado' });
      }

      res.json({ mensaje: 'Datos del entrenador actualizados correctamente'})

  } catch (error) {
      console.error('Error al actualizar los datos del entranador')
      res.status(500).json({ error: 'Error del servidor' });
  }
};