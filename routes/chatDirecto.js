const express = require('express');
const router = express.Router();

// Ruta para el chat directo
router.get('/:idCliente', (req, res) => {
    const idCliente = req.params.idCliente;
    
    // Verificar si el usuario está autenticado
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    
    // Renderizar la vista del chat directo
    res.render('chat-directo', { 
        idCliente: idCliente,
        titulo: 'Chat del Gimnasio'
    });
});

module.exports = router;
