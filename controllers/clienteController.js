const express = require('express');
const ClienteService = require('../services/clienteService')

exports.obtenerCliente = async (req, res) => {
    try {
        const cliente = await ClienteService.obtenerClientePorUsuario(req.user.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Error al obtener los datos del cliente:', error.message);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.actualizarCliente = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const datosActualizados = req.body;

        const clienteActualizado = await ClienteService.actualizarCliente(usuarioId, datosActualizados);

        if(!clienteActualizado){
            return res.status(404).json({ error:'Cliente no encontrado' })
        }
        res.json({ mensaje: 'Datos del cliente actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos del cliente:', error.message);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

