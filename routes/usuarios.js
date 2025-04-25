const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController'); 
const {verificarToken} = require('../middlewares/userMiddleware');

router.post('/login', usuarioController.loginUsuario);
router.post('/', usuarioController.crearUsuario); 
router.get('/', usuarioController.obtenerUsuarios); 
router.put('/:id', usuarioController.actualizarUsuario); 
router.delete('/:id', usuarioController.eliminarUsuario); 
router.get('/perfil', verificarToken, async (res, req) => {
    const usuario = await Usuario.findById(req.usuarioId);
    res.json(usuario)
})

module.exports = router;