const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find({});
        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ruta para obtener todos los clientes
router.get('/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find({}).populate('usuarioId');
        res.json({
            success: true,
            count: clientes.length,
            data: clientes
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ruta para obtener todos los entrenadores
router.get('/entrenadores', async (req, res) => {
    try {
        const entrenadores = await Entrenador.find({}).populate('usuarioId');
        res.json({
            success: true,
            count: entrenadores.length,
            data: entrenadores
        });
    } catch (error) {
        console.error('Error al obtener entrenadores:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ruta para verificar el estado de la base de datos
router.get('/status', async (req, res) => {
    try {
        const usuariosCount = await Usuario.countDocuments();
        const clientesCount = await Cliente.countDocuments();
        const entrenadoresCount = await Entrenador.countDocuments();
        
        res.json({
            success: true,
            database: 'conectada',
            counts: {
                usuarios: usuariosCount,
                clientes: clientesCount,
                entrenadores: entrenadoresCount
            }
        });
    } catch (error) {
        console.error('Error al verificar estado de la base de datos:', error);
        res.status(500).json({
            success: false,
            database: 'error',
            error: error.message
        });
    }
});

module.exports = router;
