const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsuarioService {
    constructor() {}

    async crearUsuario(datosUsuario) {
        console.log('Datos recibidos para crear usuario',  datosUsuario)
        if (!datosUsuario.contrasenia) throw new Error('La contraseña es obligatoria');

        datosUsuario.contrasenia = await bcrypt.hash(datosUsuario.contrasenia, 10);
        const usuario = new Usuario(datosUsuario);
        const usuarioGuardado = await usuario.save();

        if (usuarioGuardado.tipoUsuario === 'cliente'){
            const datosCliente = {
                objetivo: datosUsuario.objetivo,
                nivel: datosUsuario.nivel,
                observaciones: datosUsuario.observaciones
            };
            await Cliente.create({ usuarioId: usuarioGuardado._id, ...datosCliente})
        }
        console.log('Usuario creado:', usuarioGuardado)
        return usuarioGuardado;
    }

    async loginUsuario(correo, contrasenia) {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) throw new Error('Usuario no encontrado');

        const esValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
        if (!esValida) throw new Error('Contraseña incorrecta');

        const token = jwt.sign({ id: usuario._id }, 'claveSecreta', { expiresIn: '1h' });
        return { mensaje: 'Login exitoso', token };
    }

    async obtenerUsuarios() {
        return await Usuario.find();
    }

    async actualizarUsuario(id, datosActualizados) {
        const usuario = await Usuario.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        return await Usuario.findByIdAndUpdate(id, datosActualizados, { new: true });
    }

    async eliminarUsuario(id) {
        const usuario = await Usuario.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        return await Usuario.findByIdAndUpdate(id, { estado: 'inactivo' }, { new: true });
    }

    async obtenerPerfil(id) {
        return await Usuario.findById(id);
    }
}

module.exports = new UsuarioService();
