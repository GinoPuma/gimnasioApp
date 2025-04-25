const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsuarioService {
    constructor() {}

    // **Crear usuario**
    async crearUsuario(datosUsuario) {
        if (!datosUsuario.contrasenia) throw new Error('La contraseña es obligatoria');

        datosUsuario.contrasenia = await bcrypt.hash(datosUsuario.contrasenia, 10);
        const usuario = new Usuario(datosUsuario);
        return await usuario.save();
    }

    // **Login de usuario**
    async loginUsuario(correo, contrasenia) {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) throw new Error('Usuario no encontrado');

        const esValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
        if (!esValida) throw new Error('Contraseña incorrecta');

        const token = jwt.sign({ id: usuario._id }, 'claveSecreta', { expiresIn: '1h' });
        return { mensaje: 'Login exitoso', token };
    }

    // **Obtener todos los usuarios**
    async obtenerUsuarios() {
        return await Usuario.find();
    }

    // **Actualizar usuario**
    async actualizarUsuario(id, datosActualizados) {
        const usuario = await Usuario.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        return await Usuario.findByIdAndUpdate(id, datosActualizados, { new: true });
    }

    // **Eliminar usuario (Soft Delete)**
    async eliminarUsuario(id) {
        const usuario = await Usuario.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        return await Usuario.findByIdAndUpdate(id, { estado: 'inactivo' }, { new: true });
    }

    // **Obtener perfil de usuario**
    async obtenerPerfil(id) {
        return await Usuario.findById(id);
    }
}

module.exports = new UsuarioService();