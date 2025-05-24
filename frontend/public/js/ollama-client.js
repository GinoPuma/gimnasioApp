/**
 * Cliente JavaScript para conectarse directamente a la API de Ollama
 */
class OllamaClient {
    constructor(options = {}) {
        this.host = options.host || 'localhost';
        this.port = options.port || 11434;
        this.model = options.model || 'gimnasio-app';
        this.fallbackModel = options.fallbackModel || 'llama3.1:8b';
        this.baseUrl = `http://${this.host}:${this.port}/api`;
    }

    /**
     * Genera una respuesta usando el modelo de Ollama
     * @param {string} prompt - El prompt para generar la respuesta
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<string>} - La respuesta generada
     */
    async generateResponse(prompt, options = {}) {
        const requestData = {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.9,
                num_predict: options.num_predict || 512
            }
        };

        try {
            console.log(`Consultando a Ollama (${this.model})...`);
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta de Ollama: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.response) {
                console.log('Respuesta de Ollama recibida correctamente');
                return data.response;
            } else {
                throw new Error('Formato de respuesta de Ollama inválido');
            }
        } catch (error) {
            console.error('Error al consultar Ollama:', error);
            
            // Intentar con el modelo de respaldo si el principal falla
            if (this.model !== this.fallbackModel) {
                console.log(`Intentando con modelo de respaldo: ${this.fallbackModel}`);
                
                try {
                    const fallbackRequestData = {
                        model: this.fallbackModel,
                        prompt: prompt,
                        stream: false
                    };
                    
                    const fallbackResponse = await fetch(`${this.baseUrl}/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(fallbackRequestData)
                    });
                    
                    if (!fallbackResponse.ok) {
                        throw new Error(`Error en la respuesta del modelo de respaldo: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
                    }
                    
                    const fallbackData = await fallbackResponse.json();
                    
                    if (fallbackData.response) {
                        console.log('Respuesta del modelo de respaldo recibida correctamente');
                        return fallbackData.response;
                    } else {
                        throw new Error('Formato de respuesta del modelo de respaldo inválido');
                    }
                } catch (fallbackError) {
                    console.error('Error al consultar el modelo de respaldo:', fallbackError);
                    throw error; // Lanzar el error original
                }
            }
            
            throw error;
        }
    }

    /**
     * Verifica si Ollama está disponible
     * @returns {Promise<boolean>} - true si Ollama está disponible, false en caso contrario
     */
    async checkAvailability() {
        try {
            const requestData = {
                model: this.model,
                prompt: "Hola",
                stream: false
            };
            
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error al verificar disponibilidad de Ollama:', error);
            return false;
        }
    }
}

// Exportar la clase para usarla en otros archivos
window.OllamaClient = OllamaClient;
