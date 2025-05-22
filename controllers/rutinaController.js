const rutinaService = require('../services/rutinaService');
const Entrenador = require('../models/Entrenador');
const Rutina = require('../models/Rutina');

class RutinaController {
    async obtenerRutinasPorCliente(req, res) {
        try {
            const clienteId = req.params.clienteId;
            console.log('Obteniendo rutinas para el cliente:', clienteId);
            
            const rutinas = await rutinaService.obtenerRutinasPorCliente(clienteId);
            console.log(`Se encontraron ${rutinas.length} rutinas para el cliente ${clienteId}`);
            
            if (req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.json(rutinas);
            }
            
            // Renderizar la vista de rutinas del cliente
            return res.render('rutinasCliente', {
                rutinas: rutinas,
                clienteId: clienteId,
                ...res.locals // Mantener cualquier otra variable local
            });
        } catch (error) {
            console.error('Error al obtener rutinas del cliente:', error);
            
            if (req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            
            return res.status(500).send('Error al obtener rutinas del cliente: ' + error.message);
        }
    }
    
    async listarRutinasDisponiblesParaAsignar(req, res) {
        try {
            const entrenadorId = req.params.entrenadorId;
            console.log('Listando rutinas disponibles para asignar del entrenador:', entrenadorId);
            
            const rutinas = await rutinaService.listarRutinasDisponiblesParaAsignar(entrenadorId);
            console.log(`Se encontraron ${rutinas.length} rutinas disponibles para asignar`);
            
            return res.json(rutinas);
        } catch (error) {
            console.error('Error al listar rutinas disponibles:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    
    async crearRutina(req, res) {
        try {
            // Obtener el ID del entrenador desde el cuerpo de la solicitud
            const entrenadorId = req.body.entrenadorId;
            
            console.log('Datos recibidos para crear rutina:', req.body);
            console.log('ID del entrenador:', entrenadorId);
            
            if (!entrenadorId) {
                console.error('Error: No se proporcionó ID de entrenador');
                return res.status(400).json({ error: 'No se proporcionó ID de entrenador' });
            }
            
            // Crear la rutina
            const nuevaRutina = await rutinaService.crearRutina(req.body);
            console.log('Rutina creada:', nuevaRutina);
            
            // Obtener la rutina completa con todas sus propiedades
            const rutinaCompleta = await rutinaService.obtenerRutinaPorId(nuevaRutina._id);
            console.log('Rutina completa obtenida:', rutinaCompleta._id);
            
            // Devolver la rutina completa como JSON en todos los casos
            return res.status(201).json(rutinaCompleta);
        } catch (error) {
            console.error('Error al crear rutina:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    async asignarRutina(req, res) {
        try {
            console.log('Cuerpo de la solicitud para asignar rutina:', req.body);
            const { rutinaId, clienteId } = req.body;
            
            if (!rutinaId || !clienteId) {
                console.error('Faltan datos requeridos:', { rutinaId, clienteId });
                return res.status(400).json({ error: 'Faltan datos requeridos: rutinaId y clienteId son obligatorios' });
            }
            
            console.log('Asignando rutina:', rutinaId, 'a cliente:', clienteId);
            
            // Verificar que el cliente pertenezca al entrenador que está asignando la rutina
            const Entrenador = require('../models/Entrenador');
            const Cliente = require('../models/Cliente');
            
            // Obtener la rutina para verificar el entrenador
            const rutina = await Rutina.findById(rutinaId);
            if (!rutina) {
                console.error('Rutina no encontrada con ID:', rutinaId);
                return res.status(404).json({ error: 'Rutina no encontrada' });
            }
            
            console.log('Rutina encontrada:', rutina);
            
            // Obtener el cliente para verificar que pertenezca al entrenador
            const cliente = await Cliente.findById(clienteId).populate('usuarioId', 'nombre apellido');
            if (!cliente) {
                console.error('Cliente no encontrado con ID:', clienteId);
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            console.log('Cliente encontrado:', cliente._id, cliente.usuarioId.nombre);
            
            // Verificar que el cliente esté asignado al entrenador que creó la rutina
            if (cliente.entrenadorId && cliente.entrenadorId.toString() !== rutina.entrenadorId.toString()) {
                console.error('Verificación de entrenador fallida:', {
                    entrenadorCliente: cliente.entrenadorId.toString(),
                    entrenadorRutina: rutina.entrenadorId.toString()
                });
                return res.status(403).json({ 
                    error: 'No puedes asignar rutinas a clientes que no están asignados a ti' 
                });
            }
            
            try {
                // Método 1: Actualizar directamente con findByIdAndUpdate
                const rutinaActualizadaDirecta = await Rutina.findByIdAndUpdate(
                    rutinaId,
                    { clienteId: clienteId },
                    { new: true }
                );
                console.log('Rutina actualizada directamente:', rutinaActualizadaDirecta);
                
                // Método 2: Actualizar el objeto y guardar
                rutina.clienteId = clienteId;
                await rutina.save();
                console.log('Rutina guardada con save():', rutina);
                
                // Verificar que la asignación se haya realizado correctamente
                const rutinaVerificacion = await Rutina.findById(rutinaId);
                console.log('Verificación de asignación:', {
                    rutinaId: rutinaVerificacion._id,
                    clienteId: rutinaVerificacion.clienteId
                });
                
                if (!rutinaVerificacion.clienteId || rutinaVerificacion.clienteId.toString() !== clienteId.toString()) {
                    throw new Error('La asignación no se realizó correctamente');
                }
                
                // Preparar respuesta con datos más completos
                const respuesta = {
                    mensaje: `Rutina '${rutina.nombre}' asignada correctamente al cliente ${cliente.usuarioId.nombre} ${cliente.usuarioId.apellido}`,
                    rutina: {
                        id: rutina._id,
                        nombre: rutina.nombre,
                        descripcion: rutina.descripcion,
                        duracionSemanas: rutina.duracionSemanas
                    },
                    cliente: {
                        id: cliente._id,
                        nombre: cliente.usuarioId.nombre,
                        apellido: cliente.usuarioId.apellido
                    },
                    fechaAsignacion: new Date()
                };
                
                // Devolver respuesta JSON
                return res.status(200).json(respuesta);
                
            } catch (updateError) {
                console.error('Error al actualizar la rutina:', updateError);
                return res.status(500).json({ error: updateError.message });
            }
        } catch (error) {
            console.error('Error al asignar rutina:', error);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({ error: error.message });
            }
            
            // Redirigir con mensaje de error
            const entrenadorId = req.query.entrenadorId || req.body.entrenadorId;
            return res.redirect(`/frontend/entrenadores/${entrenadorId || 'dashboard'}?error=${encodeURIComponent('Error al asignar rutina: ' + error.message)}`);
        }
    }

    async obtenerRutina(req, res) {
        try {
            console.log('Obteniendo rutina con ID:', req.params.id);
            const rutina = await rutinaService.obtenerRutina(req.params.id);
            
            if (!rutina) {
                console.log('Rutina no encontrada');
                if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                    return res.status(404).json({ error: 'Rutina no encontrada' });
                }
                return res.redirect('/frontend/entrenadores/dashboard?error=Rutina no encontrada');
            }
            
            console.log('Rutina encontrada:', rutina);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json(rutina);
            }
            
            // Si existe una vista de detalle de rutina, renderizarla
            // De lo contrario, devolver los datos como JSON
            try {
                return res.render('detalleRutina', { rutina });
            } catch (renderError) {
                console.log('Vista no encontrada, devolviendo JSON');
                return res.json(rutina);
            }
        } catch (error) {
            console.error('Error al obtener rutina:', error);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({ error: error.message });
            }
            
            return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al obtener rutina: ' + error.message)}`);
        }
    }

    async listarRutinas(req, res) {
        try {
            let filtro = {};
            
            // Obtener el ID del entrenador desde la URL o el cuerpo de la solicitud
            const entrenadorId = req.query.entrenadorId || req.body.entrenadorId;
            
            if (entrenadorId) {
                filtro.entrenadorId = entrenadorId;
                console.log('Buscando rutinas para entrenador:', entrenadorId);
            }
            
            console.log('Filtro de búsqueda:', JSON.stringify(filtro));
            const rutinas = await rutinaService.listarRutinas(filtro);
            console.log(`Se encontraron ${rutinas.length} rutinas`);
            
            // Para solicitudes AJAX o API, devolver JSON
            if (req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.json(rutinas);
            }
            
            // Para solicitudes normales, renderizar la vista
            return res.render('entrenadorDashboard', {
                rutinas: rutinas,
                ...res.locals // Mantener cualquier otra variable local
            });
        } catch (error) {
            console.error('Error al listar rutinas:', error);
            
            if (req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            
            return res.status(500).send('Error al listar rutinas: ' + error.message);
        }
    }
    
    async actualizarRutina(req, res) {
        try {
            const rutinaId = req.params.id;
            const datosActualizados = req.body;
            
            console.log('Actualizando rutina:', rutinaId, 'con datos:', datosActualizados);
            
            const rutinaActualizada = await rutinaService.actualizarRutina(rutinaId, datosActualizados);
            
            if (!rutinaActualizada) {
                console.log('Rutina no encontrada para actualizar');
                if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                    return res.status(404).json({ error: 'Rutina no encontrada' });
                }
                return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Rutina no encontrada')}`);
            }
            
            console.log('Rutina actualizada:', rutinaActualizada);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json(rutinaActualizada);
            }
            
            // Redirigir a la página de detalle de la rutina o al dashboard
            return res.redirect(`/rutinas/${rutinaId}?mensaje=${encodeURIComponent('Rutina actualizada correctamente')}`);
        } catch (error) {
            console.error('Error al actualizar rutina:', error);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({ error: error.message });
            }
            
            return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al actualizar rutina: ' + error.message)}`);
        }
    }
    
    async agregarEjercicio(req, res) {
        try {
            const { rutinaId, diaSemana, ejercicio } = req.body;
            
            console.log('Agregando ejercicio a rutina:', rutinaId, 'para día:', diaSemana, 'ejercicio:', ejercicio);
            
            const rutinaActualizada = await rutinaService.agregarEjercicioADia(rutinaId, diaSemana, ejercicio);
            console.log('Rutina actualizada con nuevo ejercicio:', rutinaActualizada);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json(rutinaActualizada);
            }
            
            // Redirigir a la página de detalle de la rutina con mensaje de éxito
            return res.redirect(`/rutinas/${rutinaId}?mensaje=${encodeURIComponent('Ejercicio agregado correctamente')}`);
        } catch (error) {
            console.error('Error al agregar ejercicio:', error);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({ error: error.message });
            }
            
            // Redirigir con mensaje de error
            return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al agregar ejercicio: ' + error.message)}`);
        }
    }

    async eliminarRutina(req, res) {
        try {
            const rutinaId = req.params.id;
            console.log('Eliminando rutina con ID:', rutinaId);
            
            await rutinaService.eliminarRutina(rutinaId);
            console.log('Rutina eliminada correctamente');
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(204).send();
            }
            
            // Redirigir al dashboard con mensaje de éxito
            return res.redirect('/frontend/entrenadores/dashboard?mensaje=Rutina eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar rutina:', error);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({ error: error.message });
            }
            
            // Redirigir con mensaje de error
            return res.redirect(`/frontend/entrenadores/dashboard?error=${encodeURIComponent('Error al eliminar rutina: ' + error.message)}`);
        }
    }

    async mostrarFormularioEdicion(req, res) {
        try {
            const rutinaId = req.params.id;
            console.log('Mostrando formulario de edición para rutina:', rutinaId);
            
            // Obtener la rutina a editar
            const rutina = await Rutina.findById(rutinaId);
            
            if (!rutina) {
                console.error('Rutina no encontrada:', rutinaId);
                return res.status(404).send('Rutina no encontrada');
            }
            
            // Obtener el entrenador asociado a la rutina
            const entrenador = await Entrenador.findById(rutina.entrenadorId);
            
            if (!entrenador) {
                console.error('Entrenador no encontrado para la rutina:', rutinaId);
                return res.status(404).send('Entrenador no encontrado');
            }
            
            // Renderizar la vista de edición con los datos de la rutina
            return res.render('editarRutina', { 
                rutina,
                entrenador,
                idEntrenador: entrenador._id
            });
        } catch (error) {
            console.error('Error al mostrar formulario de edición:', error);
            return res.status(500).send('Error al cargar el formulario de edición: ' + error.message);
        }
    }
}



module.exports = new RutinaController();