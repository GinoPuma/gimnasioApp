const dietaService = require('../services/dietaService');

class DietaController {
    async crearDieta(req, res) {
        try {
            const nuevaDieta = await dietaService.crearDieta(req.body);
            res.status(201).json(nuevaDieta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async asignarDieta(req, res) {
        try {
            const { dietaId, clienteId } = req.body;
            const dietaActualizada = await dietaService.asignarDieta(dietaId, clienteId);
            res.json(dietaActualizada);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerDieta(req, res) {
        try {
            const dieta = await dietaService.obtenerDieta(req.params.id);
            res.json(dieta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async listarDietas(req, res) {
        try {
            const dietas = await dietaService.listarDietas();
            res.json(dietas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async eliminarDieta(req, res) {
        try {
            await dietaService.eliminarDieta(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DietaController();