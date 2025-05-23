const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

// Configuración para Ollama
const OLLAMA_MODEL = 'llama3.1:8b';

// Sistema de respuestas inteligentes para fallback cuando Ollama no está disponible
const respuestasInteligentes = {
    // Saludos
    'hola': '¡Hola! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?',
    'buenos dias': 'Buenos días. ¿Listo para un día lleno de energía? ¿En qué puedo ayudarte?',
    'buenas tardes': 'Buenas tardes. ¿Cómo va tu día de entrenamiento? ¿Necesitas alguna recomendación?',
    'buenas noches': 'Buenas noches. Recuerda que un buen descanso es fundamental para la recuperación muscular. ¿En qué puedo ayudarte?',
    'como estas': 'Estoy listo para ayudarte con tus objetivos fitness. ¿Qué necesitas hoy?',
    
    // Preguntas generales
    'quien eres': 'Soy ChatIA, tu asistente de fitness diseñado para ayudarte con tus rutinas de ejercicio, nutrición y bienestar general.',
    'que puedes hacer': 'Puedo ayudarte con recomendaciones de ejercicios, consejos nutricionales, planes de entrenamiento y responder preguntas sobre fitness en general.',
    'ayuda': 'Puedo ayudarte con rutinas de ejercicio, consejos de nutrición, planes de entrenamiento y más. ¿En qué área necesitas asistencia?',
    
    // Rutinas y ejercicios
    'rutina': 'Las rutinas de entrenamiento deben ser personalizadas según tus objetivos. ¿Buscas ganar masa muscular, perder peso o mejorar tu resistencia?',
    'ejercicio': 'Existen muchos tipos de ejercicios. Para resultados óptimos, combina ejercicios cardiovasculares con entrenamiento de fuerza. ¿Te interesa algún tipo en particular?',
    'cardio': 'El entrenamiento cardiovascular es excelente para mejorar la salud del corazón y quemar calorías. Intenta correr, nadar, ciclismo o HIIT para variar tu rutina.',
    'fuerza': 'El entrenamiento de fuerza es fundamental para aumentar masa muscular y fortalecer tus huesos. Recuerda trabajar todos los grupos musculares a lo largo de la semana.',
    'piernas': 'Para un buen entrenamiento de piernas, incluye sentadillas, peso muerto, zancadas y extensiones de pierna. No olvides calentar adecuadamente para evitar lesiones.',
    'brazos': 'Para desarrollar tus brazos, enfócate en ejercicios como curl de bíceps, extensiones de tríceps, press de hombros y fondos. Alterna entre días de alta y baja intensidad.',
    'abdominales': 'Para unos abdominales fuertes, combina ejercicios como planchas, crunches, elevaciones de piernas y rotaciones rusas. Recuerda que la nutrición es clave para ver resultados.',
    'espalda': 'Para fortalecer tu espalda, incluye dominadas, remo, pull-downs y hiperextensiones. Una espalda fuerte mejora tu postura y previene lesiones.',
    'pecho': 'Para desarrollar el pecho, incluye press de banca, aperturas, fondos y press inclinado. Varía los ángulos para trabajar diferentes partes del músculo.',
    'descanso': 'El descanso es tan importante como el entrenamiento. Tus músculos crecen durante el descanso, no durante el ejercicio. Asegúrate de dormir 7-8 horas diarias.',
    'frecuencia': 'Para principiantes, 3-4 sesiones semanales son ideales. Deportistas avanzados pueden entrenar 5-6 días, alternando grupos musculares para permitir la recuperación.',
    
    
    // Nutrición
    'dieta': 'Una buena dieta debe ser equilibrada e incluir proteínas, carbohidratos complejos y grasas saludables. ¿Tienes algún objetivo específico con tu alimentación?',
    'proteina': 'Las proteínas son esenciales para la recuperación y crecimiento muscular. Buenas fuentes incluyen pollo, pescado, huevos, lácteos, legumbres y suplementos como whey protein.',
    'carbohidratos': 'Los carbohidratos son tu principal fuente de energía. Opta por carbohidratos complejos como arroz integral, avena, patatas y legumbres para una liberación sostenida de energía.',
    'grasas': 'Las grasas saludables son esenciales para la producción hormonal y la absorción de vitaminas. Incluye aguacate, frutos secos, aceite de oliva y pescados grasos en tu dieta.',
    'calorias': 'Para perder peso, necesitas un déficit calórico (consumir menos calorías de las que gastas). Para ganar masa muscular, necesitas un superhábit calórico moderado.',
    'agua': 'La hidratación es fundamental para el rendimiento. Bebe al menos 2-3 litros de agua al día, más si entrenas intensamente o hace calor.',
    'comidas': 'Es recomendable hacer 4-6 comidas pequeñas al día para mantener estables los niveles de energía y facilitar la digestión.',
    
    // Objetivos específicos
    'perder peso': 'Para perder peso, combina un déficit calórico moderado (300-500 calorías menos al día) con entrenamiento de fuerza y cardio. La consistencia es clave.',
    'ganar musculo': 'Para ganar músculo, necesitas un superhábit calórico moderado, entrenamiento de fuerza progresivo y suficiente proteína (1.6-2g por kg de peso corporal).',
    'definicion': 'La definición muscular requiere un bajo porcentaje de grasa corporal. Combina un déficit calórico con entrenamiento de fuerza para preservar la masa muscular.',
    'resistencia': 'Para mejorar la resistencia, incrementa gradualmente la duración e intensidad de tus sesiones de cardio. Incluye entrenamiento por intervalos para mejores resultados.',
    'fuerza': 'Para aumentar la fuerza, enfócate en ejercicios compuestos con cargas pesadas (80-90% de tu 1RM) y pocas repeticiones (3-6).',
    'flexibilidad': 'Para mejorar la flexibilidad, incluye sesiones regulares de estiramiento, yoga o pilates. La consistencia es más importante que la intensidad.',
    
    // Lesiones y recuperación
    'lesion': 'Si tienes una lesión, consulta con un profesional médico antes de volver a entrenar. La recuperación adecuada es fundamental para evitar lesiones crónicas.',
    'dolor': 'Es normal sentir algo de dolor muscular después de entrenar (DOMS), pero el dolor agudo o en articulaciones puede indicar una lesión. Consulta con un profesional si persiste.',
    'recuperacion': 'La recuperación incluye descanso adecuado, nutrición, hidratación y técnicas como estiramientos, masajes o baños de contraste.',
    'sobreentrenamiento': 'El sobreentrenamiento puede causar fatiga crónica, bajo rendimiento y mayor riesgo de lesiones. Asegúrate de incluir días de descanso en tu rutina.',
    
    // Respuesta por defecto
    'default': 'Estoy aquí para ayudarte con tus preguntas sobre fitness y entrenamiento. ¿En qué puedo asistirte hoy?'
};

// Respuestas predefinidas para preguntas comunes no relacionadas con fitness
const respuestasGenerales = {
    // Preguntas sobre tiempo
    'cuantos dias tiene la semana': 'La semana tiene 7 días: lunes, martes, miércoles, jueves, viernes, sábado y domingo.',
    'cuantos meses tiene el año': 'El año tiene 12 meses: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre y diciembre.',
    'cuantas horas tiene un dia': 'Un día tiene 24 horas.',
    'cuantos minutos tiene una hora': 'Una hora tiene 60 minutos.',
    'cuantos segundos tiene un minuto': 'Un minuto tiene 60 segundos.',
    
    // Preguntas de matemáticas básicas
    'cuanto es 1 + 1': 'La suma de 1 + 1 es igual a 2.',
    'cuanto es 1 - 1': 'La resta de 1 - 1 es igual a 0.',
    'cuanto es 2 x 2': 'La multiplicación de 2 x 2 es igual a 4.',
    'cuanto es 10 / 2': 'La división de 10 / 2 es igual a 5.',
    
    // Preguntas de geografía
    'cual es la capital de francia': 'La capital de Francia es París.',
    'cual es la capital de españa': 'La capital de España es Madrid.',
    'cual es la capital de italia': 'La capital de Italia es Roma.',
    
    // Preguntas sobre el asistente
    'quien eres': 'Soy ChatIA, tu asistente de fitness diseñado para ayudarte con tus rutinas de ejercicio, nutrición y bienestar general.',
    'como te llamas': 'Me llamo ChatIA, soy tu asistente virtual especializado en fitness y entrenamiento.',
    'que eres': 'Soy un asistente virtual especializado en fitness y nutrición, diseñado para ayudarte a alcanzar tus objetivos de salud y bienestar.',
    'que puedes hacer': 'Puedo ayudarte con recomendaciones de ejercicios, consejos nutricionales, planes de entrenamiento y responder preguntas sobre fitness en general.',
    
    // Saludos y despedidas
    'hola': '¡Hola! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?',
    'buenos dias': 'Buenos días. ¿Listo para un día lleno de energía? ¿En qué puedo ayudarte?',
    'buenas tardes': 'Buenas tardes. ¿Cómo va tu día de entrenamiento? ¿Necesitas alguna recomendación?',
    'buenas noches': 'Buenas noches. Recuerda que un buen descanso es fundamental para la recuperación muscular. ¿En qué puedo ayudarte?',
    'gracias': 'De nada. Estoy aquí para ayudarte con tus objetivos de fitness. ¿Hay algo más en lo que pueda asistirte?',
    'adios': '¡Hasta pronto! Recuerda mantener la constancia en tu entrenamiento. ¡Tú puedes!',
    'chao': '¡Hasta pronto! No olvides mantenerte hidratado y descansar adecuadamente.',
    'hasta luego': '¡Hasta luego! Sigue con tu rutina de ejercicios y alimentación saludable.'
};

// Lista de palabras clave relacionadas con fitness para determinar si usar Ollama
const palabrasClaveFitness = [
    'ejercicio', 'rutina', 'entrenamiento', 'musculo', 'peso', 'dieta', 'nutricion', 'proteina',
    'cardio', 'fuerza', 'flexibilidad', 'estiramiento', 'calentamiento', 'recuperacion',
    'abdominales', 'piernas', 'brazos', 'espalda', 'pecho', 'hombros', 'gluteos', 'core',
    'calorias', 'grasa', 'adelgazar', 'tonificar', 'hipertrofia', 'definicion', 'volumen',
    'suplementos', 'vitaminas', 'minerales', 'hidratacion', 'descanso', 'dormir', 'lesion',
    'gimnasio', 'pesas', 'mancuernas', 'barra', 'maquina', 'banda', 'resistencia', 'repeticion',
    'serie', 'set', 'descanso', 'frecuencia', 'intensidad', 'volumen', 'progresion', 'sobrecarga',
    'aerobico', 'anaerobico', 'hiit', 'tabata', 'crossfit', 'yoga', 'pilates', 'calistenia',
    'correr', 'nadar', 'ciclismo', 'bicicleta', 'caminar', 'saltar', 'boxeo', 'artes marciales'
];

// Función para determinar si una pregunta está relacionada con fitness
function esPreguntaFitness(prompt) {
    const promptLower = prompt.toLowerCase();
    
    // Verificar si contiene alguna palabra clave de fitness
    return palabrasClaveFitness.some(palabra => promptLower.includes(palabra));
}

// Función para consultar a Ollama directamente usando el comando en la terminal
function consultarOllamaDirecto(prompt) {
    return new Promise((resolve, reject) => {
        // Esta función ahora solo se usa para preguntas de fitness
        // La verificación de preguntas generales ya se hace en procesarMensaje
        
        // Escapar comillas en el prompt para evitar problemas en la línea de comandos
        const promptEscapado = prompt.replace(/"/g, '\\"');
        
        // Comando para ejecutar Ollama con un tiempo máximo de ejecución
        const comando = `ollama run ${OLLAMA_MODEL} "${promptEscapado}"`;
        
        console.log('Ejecutando Ollama directamente...');
        console.log(`Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
        
        // Aumentar significativamente el timeout para dar tiempo a Ollama
        // 30 segundos es un buen equilibrio entre esperar lo suficiente y no demasiado
        exec(comando, { timeout: 30000, windowsHide: true, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error al ejecutar Ollama:', error);
                return reject(error);
            }
            
            if (stderr) {
                console.warn('Advertencia de Ollama:', stderr);
            }
            
            // Procesar la respuesta
            const respuesta = stdout.trim();
            
            // Verificar si la respuesta es válida
            if (!respuesta || respuesta.length < 2) {
                console.error('Respuesta de Ollama vacía o demasiado corta');
                return reject(new Error('Respuesta de Ollama inválida'));
            }
            
            console.log('Respuesta de Ollama recibida correctamente');
            console.log(`Longitud de la respuesta: ${respuesta.length} caracteres`);
            
            resolve(respuesta);
        });
    });
}

// Función para obtener una respuesta inteligente basada en palabras clave (fallback)
function obtenerRespuestaInteligente(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    
    // Buscar coincidencias en el mensaje
    let mejorCoincidencia = null;
    let longitudMejorCoincidencia = 0;
    
    for (const [clave, valor] of Object.entries(respuestasInteligentes)) {
        if (clave === 'default') continue; // Ignorar la respuesta por defecto en esta búsqueda
        
        if (mensajeLower.includes(clave)) {
            // Si encontramos una coincidencia más larga, la usamos
            if (clave.length > longitudMejorCoincidencia) {
                mejorCoincidencia = valor;
                longitudMejorCoincidencia = clave.length;
            }
        }
    }
    
    // Si encontramos una coincidencia, la devolvemos
    if (mejorCoincidencia) {
        return mejorCoincidencia;
    }
    
    // Si no hay coincidencias, devolvemos la respuesta por defecto
    return respuestasInteligentes.default;
}

// Función para verificar si Ollama está disponible ejecutando un comando simple
async function verificarOllama() {
    return new Promise((resolve) => {
        console.log('Verificando disponibilidad de Ollama...');
        
        // Comando para verificar si Ollama está disponible
        const comando = `ollama list`;
        
        // Ejecutar el comando con un timeout corto
        exec(comando, { timeout: 5000, windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error al verificar Ollama:', error);
                resolve(false);
                return;
            }
            
            // Verificar si el modelo que necesitamos está disponible
            if (stdout.includes(OLLAMA_MODEL)) {
                console.log(`Modelo ${OLLAMA_MODEL} disponible en Ollama`);
                resolve(true);
            } else {
                console.log(`Modelo ${OLLAMA_MODEL} no encontrado en Ollama. Modelos disponibles:`);
                console.log(stdout);
                resolve(false);
            }
        });
    });
}

// Función principal para procesar un mensaje
async function procesarMensaje(mensaje, clienteId) {
    try {
        console.log(`[ChatIA] Cliente ${clienteId || 'anónimo'}: ${mensaje}`);
        
        // Primero intentamos usar Ollama para cualquier pregunta
        console.log('Intentando usar Ollama para la pregunta...');
        try {
            const respuesta = await consultarOllamaDirecto(mensaje);
            console.log('[ChatIA] Respuesta de Ollama:', respuesta.substring(0, 100) + (respuesta.length > 100 ? '...' : ''));
            return respuesta;
        } catch (error) {
            console.error('Error al usar Ollama, usando sistema de respuestas inteligentes:', error.message);
            
            // Si Ollama falla, intentamos con respuestas predefinidas
            const mensajeLower = mensaje.toLowerCase();
            
            // Primero verificamos si hay una respuesta predefinida general
            for (const [clave, valor] of Object.entries(respuestasGenerales)) {
                if (mensajeLower.includes(clave)) {
                    console.log('Usando respuesta predefinida para pregunta general');
                    console.log('[ChatIA] Respuesta predefinida:', valor);
                    return valor;
                }
            }
            
            // Si no hay respuesta predefinida, usamos el sistema de respuestas inteligentes
            console.log('Usando sistema de respuestas inteligentes como fallback');
            const respuestaInteligente = obtenerRespuestaInteligente(mensaje);
            console.log('[ChatIA] Respuesta inteligente:', respuestaInteligente);
            return respuestaInteligente;
        }
    } catch (error) {
        console.error('Error general en procesarMensaje:', error);
        return 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.';
    }
}

// Endpoint para verificar el estado de Ollama
router.get('/status', async (req, res) => {
    try {
        // Verificar si Ollama está disponible
        const ollamaDisponible = await verificarOllama();
        
        if (ollamaDisponible) {
            return res.json({
                status: 'ok',
                message: 'Ollama está funcionando correctamente',
                model: OLLAMA_MODEL,
                modo: 'ollama'
            });
        } else {
            // Si Ollama no está disponible, verificar el sistema de respuestas inteligentes
            const numRespuestas = Object.keys(respuestasInteligentes).length;
            
            if (numRespuestas > 10) {
                return res.status(503).json({
                    status: 'warning',
                    message: 'Ollama no está disponible, usando sistema de respuestas predefinidas',
                    respuestas_disponibles: numRespuestas,
                    modo: 'respuestas_inteligentes'
                });
            } else {
                return res.status(503).json({
                    status: 'error',
                    message: 'Ollama no está disponible y el sistema de respuestas no tiene suficientes entradas',
                    respuestas_disponibles: numRespuestas
                });
            }
        }
    } catch (error) {
        console.error('Error al verificar el estado de ChatIA:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al verificar el estado de ChatIA',
            error: error.message
        });
    }
});

// Endpoint principal para mensajes - usa Ollama directamente
router.post('/mensaje', async (req, res) => {
    try {
        // Extraer el mensaje del cuerpo de la solicitud
        const { mensaje, clienteId } = req.body;
        
        if (!mensaje) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }
        
        const respuesta = await procesarMensaje(mensaje, clienteId);
        console.log(`[ChatIA] Respuesta final: ${respuesta.substring(0, 100)}${respuesta.length > 100 ? '...' : ''}`);
        
        return res.json({
            respuesta,
            modo: 'ollama_directo'
        });
    } catch (error) {
        console.error('Error general en el procesamiento del mensaje:', error);
        res.status(500).json({ 
            error: 'Error al procesar la solicitud',
            detalle: error.message
        });
    }
});

// Endpoint de fallback (usa respuestas inteligentes directamente)
router.post('/fallback', (req, res) => {
    try {
        const { mensaje, clienteId } = req.body;
        
        if (!mensaje) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }
        
        // Obtener respuesta inteligente
        const respuesta = obtenerRespuestaInteligente(mensaje);
        console.log(`[ChatIA] Respuesta fallback: ${respuesta}`);
        
        res.json({ 
            respuesta,
            modo: 'respuestas_inteligentes'
        });
    } catch (error) {
        console.error('Error en el fallback:', error);
        res.status(500).json({ 
            error: 'Error en el servicio de respaldo',
            detalle: error.message
        });
    }
});

module.exports = router;
