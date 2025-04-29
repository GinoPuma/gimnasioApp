const rutinaService = require('../services/rutinaService');
const Entrenador = require('../models/Entrenador');
const Rutina = require('../models/Rutina');

class RutinaController {
    async crearRutina(req, res) {
        try {
            // Verificar si la solicitud es JSON
            const isJsonRequest = req.is('application/json');
            
            // Obtener el ID del entrenador desde el cuerpo de la solicitud
            const entrenadorId = req.body.entrenadorId;
            
            console.log('Datos recibidos para crear rutina:', req.body);
            console.log('ID del entrenador:', entrenadorId);
            console.log('¿Es solicitud JSON?', isJsonRequest);
            
            if (!entrenadorId) {
                console.error('Error: No se proporcionó ID de entrenador');
                
                if (isJsonRequest) {
                    return res.status(400).json({ error: 'No se proporcionó ID de entrenador' });
                }
                
                return res.redirect('/frontend/login?error=No se proporcionó ID de entrenador');
            }
            
            const nuevaRutina = await rutinaService.crearRutina(req.body);
            console.log('Rutina creada:', nuevaRutina);
            
            // Si es una solicitud AJAX o JSON, devolver JSON
            if (isJsonRequest || req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.status(201).json(nuevaRutina);
            }
            
            // Para solicitudes normales, redirigir al dashboard
            // Buscar el usuario asociado al entrenador para redirigir correctamente
            const Entrenador = require('../models/Entrenador');
            const entrenador = await Entrenador.findById(entrenadorId);
            
            if (entrenador && entrenador.usuarioId) {
                // Redirigir usando el ID de usuario, no el ID de entrenador
                return res.redirect(`/frontend/entrenadores/${entrenador.usuarioId}`);
            } else {
                // Si no se encuentra el entrenador, redirigir a la página de inicio
                return res.redirect('/?mensaje=Rutina creada correctamente');
            }
        } catch (error) {
            console.error('Error al crear rutina:', error);
            
            // Si es una solicitud AJAX o JSON, devolver error en formato JSON
            if (req.is('application/json') || req.xhr || req.get('Accept')?.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            
            // Para solicitudes normales, redirigir con mensaje de error
            return res.redirect(`/?error=${encodeURIComponent('Error al crear rutina: ' + error.message)}`);
        }
    }

    async asignarRutina(req, res) {
        try {
            const { rutinaId, clienteId } = req.body;
            console.log('Asignando rutina:', rutinaId, 'a cliente:', clienteId);
            
            const rutinaActualizada = await rutinaService.asignarRutina(rutinaId, clienteId);
            console.log('Rutina actualizada:', rutinaActualizada);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json(rutinaActualizada);
            }
            
            // Redirigir al dashboard con mensaje de éxito
            const entrenadorId = req.query.entrenadorId || req.body.entrenadorId;
            return res.redirect(`/frontend/entrenadores/${entrenadorId || 'dashboard'}?mensaje=Rutina asignada correctamente`);
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