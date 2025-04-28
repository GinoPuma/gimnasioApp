const rutinaService = require('../services/rutinaService');

class RutinaController {
    async crearRutina(req, res) {
        try {
            const nuevaRutina = await rutinaService.crearRutina(req.body);
            res.status(201).json(nuevaRutina);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async asignarRutina(req, res) {
        try {
            const { rutinaId, clienteId } = req.body;
            const rutinaActualizada = await rutinaService.asignarRutina(rutinaId, clienteId);
            res.json(rutinaActualizada);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerRutina(req, res) {
        try {
            const rutina = await rutinaService.obtenerRutina(req.params.id);
            res.json(rutina);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async listarRutinas(req, res) {
        try {
            const rutinas = await rutinaService.listarRutinas();
            res.json(rutinas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async eliminarRutina(req, res) {
        try {
            await rutinaService.eliminarRutina(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RutinaController();