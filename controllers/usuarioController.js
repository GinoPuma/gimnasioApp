const usuarioService = require('../services/usuarioService');
const clienteService = require('../services/clienteService')
const {verificarCliente} = require('../middlewares/verificarClienteMiddlewars')

exports.crearUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.crearUsuario(req.body);
        req.usuarioId = usuario._id
        verificarCliente(req,res,next);
        res.status(201).json(usuario);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.loginUsuario = async (req, res) => {
    try {
        const { correo, contrasenia } = req.body;
        const resultado = await usuarioService.loginUsuario(correo, contrasenia);
        res.json(resultado);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioService.obtenerUsuarios();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const usuarioActualizado = await usuarioService.actualizarUsuario(req.params.id, req.body);
        res.json(usuarioActualizado);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.eliminarUsuario(req.params.id);
        res.json({ mensaje: 'Usuario desactivado', usuario });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.obtenerPerfil = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerPerfil(req.usuarioId);
        res.json(usuario);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};