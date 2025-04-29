const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Entrenador = require('../models/Entrenador');
const CodigoVerificacion = require('../models/CodigoVerificacion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsuarioService {
    constructor() {}

    async crearUsuario(datosUsuario) {
        console.log('Datos recibidos para crear usuario', datosUsuario);
        if (!datosUsuario.contrasenia) throw new Error('La contraseña es obligatoria');

        // Verificar código de verificación para entrenadores
        if (datosUsuario.tipoUsuario === 'entrenador') {
            if (!datosUsuario.codigoVerificacion) {
                throw new Error('El código de verificación es obligatorio para registrarse como entrenador');
            }

            try {
                // Buscar el código de verificación en la base de datos
                const codigoVerificacion = await CodigoVerificacion.findOne({
                    codigo: datosUsuario.codigoVerificacion,
                    tipoUsuario: 'entrenador',
                    estado: 'activo'
                });

                if (!codigoVerificacion) {
                    throw new Error('Código de verificación inválido o ya utilizado');
                }

                // Verificar si el código ha expirado
                if (new Date() > new Date(codigoVerificacion.fechaExpiracion)) {
                    codigoVerificacion.estado = 'expirado';
                    await codigoVerificacion.save();
                    throw new Error('El código de verificación ha expirado');
                }
            } catch (error) {
                console.error('Error al verificar código:', error);
                throw error;
            }
        }

        // Encriptar contraseña
        datosUsuario.contrasenia = await bcrypt.hash(datosUsuario.contrasenia, 10);
        
        // Establecer estado inicial según tipo de usuario
        if (datosUsuario.tipoUsuario === 'entrenador') {
            datosUsuario.estado = 'pendiente'; // Los entrenadores requieren verificación adicional
        } else {
            datosUsuario.estado = 'activo'; // Los clientes se activan inmediatamente
        }
        
        // Crear el usuario
        const usuario = new Usuario(datosUsuario);
        const usuarioGuardado = await usuario.save();

        // Crear perfil de cliente si es necesario
        if (usuarioGuardado.tipoUsuario === 'cliente') {
            const datosCliente = {
                objetivo: datosUsuario.objetivo,
                nivel: datosUsuario.nivel,
                observaciones: datosUsuario.observaciones
            };
            await Cliente.create({ usuarioId: usuarioGuardado._id, ...datosCliente });
        }

        // Crear perfil de entrenador si es necesario
        if (usuarioGuardado.tipoUsuario === 'entrenador') {
            const datosEntrenador = {
                especialidad: datosUsuario.especialidad,
                certificaciones: datosUsuario.certificaciones ? datosUsuario.certificaciones.split(',').map(c => c.trim()) : [],
                experienciaAnios: datosUsuario.experienciaAnios,
                descripcionPerfil: datosUsuario.descripcionPerfil,
                codigoVerificacion: datosUsuario.codigoVerificacion,
                estado: 'pendiente'
            };
            await Entrenador.create({ usuarioId: usuarioGuardado._id, ...datosEntrenador });
            
            // Marcar el código como usado
            if (datosUsuario.codigoVerificacion) {
                const codigoVerificacion = await CodigoVerificacion.findOne({ 
                    codigo: datosUsuario.codigoVerificacion,
                    tipoUsuario: 'entrenador'
                });
                
                if (codigoVerificacion) {
                    codigoVerificacion.estado = 'usado';
                    codigoVerificacion.usadoPor = usuarioGuardado._id;
                    codigoVerificacion.fechaUso = new Date();
                    await codigoVerificacion.save();
                }
            }
        }
        
        console.log('Usuario creado:', usuarioGuardado);
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
