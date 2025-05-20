const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');
const Usuario = require('../models/Usuario');
const MessageService = require('../services/messageService');
const messageService = new MessageService();

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    // Verificar si hay una sesión activa con usuario
    console.log('Verificando autenticación:', {
        session: req.session ? 'Existe' : 'No existe',
        usuario: req.session && req.session.usuario ? 'Existe' : 'No existe',
        tipoUsuario: req.session && req.session.usuario ? req.session.usuario.tipoUsuario : 'No disponible'
    });
    
    if (req.session && req.session.usuario) {
        return next();
    }
    
    console.log('Usuario no autenticado, redirigiendo al login');
    res.redirect('/frontend/login');
};

// Ruta para mostrar el chat del cliente
router.get('/cliente/:clienteId', isAuthenticated, async (req, res) => {
    try {
        // Verificar que el usuario está autenticado y es un cliente
        if (!req.session.usuario || req.session.usuario.tipoUsuario !== 'cliente') {
            console.log('Error: Intento de acceso a chat de cliente por un usuario que no es cliente');
            return res.redirect('/frontend/login');
        }
        
        const clienteId = req.params.clienteId;
        
        // Obtener datos del cliente
        const cliente = await Cliente.findById(clienteId).populate('usuarioId');
        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }
        
        // Obtener datos del entrenador asignado
        let entrenador = null;
        if (cliente.entrenadorId) {
            entrenador = await Entrenador.findById(cliente.entrenadorId).populate('usuarioId');
        }
        
        // Obtener mensajes entre cliente y entrenador
        let mensajes = [];
        if (entrenador) {
            mensajes = await messageService.getConversation(
                cliente.usuarioId._id,
                entrenador.usuarioId._id
            );
        }
        
        res.render('chatCliente', {
            cliente,
            entrenador,
            mensajes,
            userId: cliente.usuarioId._id,
            userType: 'cliente'
        });
    } catch (error) {
        console.error('Error al cargar el chat del cliente:', error);
        res.status(500).send('Error al cargar el chat: ' + error.message);
    }
});

// Ruta para mostrar el chat del entrenador
router.get('/entrenador/:entrenadorId/cliente/:clienteId', isAuthenticated, async (req, res) => {
    try {
        // Verificar que el usuario está autenticado y es un entrenador
        if (!req.session.usuario || req.session.usuario.tipoUsuario !== 'entrenador') {
            console.log('Error: Intento de acceso a chat de entrenador por un usuario que no es entrenador');
            return res.redirect('/frontend/login');
        }
        
        const { entrenadorId, clienteId } = req.params;
        
        // Obtener datos del entrenador
        const entrenador = await Entrenador.findById(entrenadorId).populate('usuarioId');
        if (!entrenador) {
            return res.status(404).send('Entrenador no encontrado');
        }
        
        // Obtener datos del cliente
        const cliente = await Cliente.findById(clienteId).populate('usuarioId');
        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }
        
        // Verificar que el cliente esté asignado al entrenador
        if (cliente.entrenadorId.toString() !== entrenadorId) {
            return res.status(403).send('No tienes permiso para chatear con este cliente');
        }
        
        // Obtener mensajes entre entrenador y cliente
        const mensajes = await messageService.getConversation(
            entrenador.usuarioId._id,
            cliente.usuarioId._id
        );
        
        res.render('chatEntrenador', {
            entrenador,
            cliente,
            mensajes,
            userId: entrenador.usuarioId._id,
            userType: 'entrenador'
        });
    } catch (error) {
        console.error('Error al cargar el chat del entrenador:', error);
        res.status(500).send('Error al cargar el chat: ' + error.message);
    }
});

// Ruta para mostrar la lista de clientes para chat (vista del entrenador)
router.get('/entrenador/:entrenadorId', isAuthenticated, async (req, res) => {
    try {
        // Verificar que el usuario está autenticado y es un entrenador
        if (!req.session.usuario || req.session.usuario.tipoUsuario !== 'entrenador') {
            console.log('Error: Intento de acceso a lista de clientes para chat por un usuario que no es entrenador');
            return res.redirect('/frontend/login');
        }
        
        const entrenadorId = req.params.entrenadorId;
        
        // Obtener datos del entrenador
        const entrenador = await Entrenador.findById(entrenadorId).populate('usuarioId');
        if (!entrenador) {
            return res.status(404).send('Entrenador no encontrado');
        }
        
        // Obtener todos los clientes asignados al entrenador
        const clientes = await Cliente.find({ entrenadorId }).populate('usuarioId');
        
        res.render('chatClientesList', {
            entrenador,
            clientes,
            userId: entrenador.usuarioId._id,
            userType: 'entrenador'
        });
    } catch (error) {
        console.error('Error al cargar la lista de clientes para chat:', error);
        res.status(500).send('Error al cargar la lista de clientes: ' + error.message);
    }
});

module.exports = router;
