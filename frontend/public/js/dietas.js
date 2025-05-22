// Funciones para gestionar dietas

// Variable para controlar si ya se está enviando una solicitud
let enviandoDieta = false;

// Función para crear nueva dieta
function crearNuevaDieta(event) {
    // Prevenir comportamiento por defecto del formulario
    event.preventDefault();
    
    // Evitar envíos duplicados
    if (enviandoDieta) {
        console.log('Ya hay una solicitud en proceso');
        return false;
    }
    
    // Marcar como enviando
    enviandoDieta = true;
    
    // Obtener el botón de envío y mostrar indicador de carga
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando...';
    submitBtn.disabled = true;
    
    // Obtener el formulario
    const form = document.getElementById('nuevaDietaForm');
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    
    // Recopilar comidas
    const comidas = [];
    const comidasItems = document.querySelectorAll('.comida-item');
    comidasItems.forEach((item, index) => {
        const tipoComida = item.querySelector('select[name*="tipoComida"]')?.value;
        const descripcionComida = item.querySelector('textarea[name*="descripcion"]')?.value;
        const caloriasEstimadas = item.querySelector('input[name*="caloriasEstimadas"]')?.value || 0;
        
        if (tipoComida && descripcionComida) {
            comidas.push({
                tipoComida: tipoComida,
                descripcion: descripcionComida,
                caloriasEstimadas: parseInt(caloriasEstimadas)
            });
        }
    });
    
    // Crear objeto de datos
    const dietaData = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        fechaInicio: formData.get('fechaInicio'),
        fechaFin: formData.get('fechaFin'),
        entrenadorId: formData.get('entrenadorId'),
        comidas: comidas
    };
    
    // Si se seleccionó un cliente, añadir al objeto de datos
    const clienteId = formData.get('clienteId');
    if (clienteId && clienteId !== '') {
        dietaData.clienteId = clienteId;
    }
    
    console.log('Enviando datos de dieta:', dietaData);
    
    // Enviar datos al servidor
    fetch('/dietas/crear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dietaData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Error al crear la dieta');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dieta creada con éxito:', data);
        
        // Mostrar mensaje de éxito
        mostrarAlerta('Dieta creada con éxito', 'success');
        
        // Limpiar el formulario
        form.reset();
        
        // Limpiar comidas adicionales
        const comidasContainer = document.getElementById('comidasContainer');
        if (comidasContainer) {
            // Mantener solo la primera comida y limpiarla
            const items = comidasContainer.querySelectorAll('.comida-item');
            if (items.length > 0) {
                // Limpiar la primera comida
                const primeraComida = items[0];
                const tipoComidaSelect = primeraComida.querySelector('select[name*="tipoComida"]');
                const descripcionTextarea = primeraComida.querySelector('textarea[name*="descripcion"]');
                const caloriasInput = primeraComida.querySelector('input[name*="caloriasEstimadas"]');
                
                if (tipoComidaSelect) tipoComidaSelect.selectedIndex = 0;
                if (descripcionTextarea) descripcionTextarea.value = '';
                if (caloriasInput) caloriasInput.value = '';
                
                // Eliminar comidas adicionales
                for (let i = 1; i < items.length; i++) {
                    items[i].remove();
                }
            }
        }
        
        // Agregar la nueva dieta a la tabla
        agregarDietaATabla(data);
    })
    .catch(error => {
        console.error('Error al crear dieta:', error);
        mostrarAlerta('Error: ' + error.message, 'danger');
    })
    .finally(() => {
        // Restaurar el botón
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        enviandoDieta = false;
    });
    
    return false;
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    // Crear el elemento de alerta
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Buscar el contenedor donde mostrar la alerta
    const contenedor = document.querySelector('.main-container');
    if (contenedor) {
        // Insertar al principio del contenedor
        contenedor.insertBefore(alertaDiv, contenedor.firstChild);
        
        // Configurar para que desaparezca después de 5 segundos
        setTimeout(() => {
            alertaDiv.classList.remove('show');
            setTimeout(() => alertaDiv.remove(), 300);
        }, 5000);
    }
}

// Función para agregar una dieta a la tabla
function agregarDietaATabla(dieta) {
    console.log('Agregando dieta a tabla:', dieta);
    
    // Obtener la tabla
    const tabla = document.getElementById('dietasTableBody');
    if (!tabla) {
        console.error('No se encontró la tabla de dietas');
        return;
    }
    
    // Crear una nueva fila
    const fila = document.createElement('tr');
    
    // Formatear la fecha
    let fechaFormateada = 'No definida';
    if (dieta.fechaInicio) {
        try {
            fechaFormateada = new Date(dieta.fechaInicio).toLocaleDateString();
        } catch (e) {
            console.error('Error al formatear fecha:', e);
        }
    }
    
    // Formatear la fecha de fin
    let fechaFinFormateada = 'No definida';
    if (dieta.fechaFin) {
        try {
            fechaFinFormateada = new Date(dieta.fechaFin).toLocaleDateString();
        } catch (e) {
            console.error('Error al formatear fecha fin:', e);
        }
    }
    
    // Preparar información de comidas
    let comidasHTML = '<span class="badge bg-secondary">Sin comidas</span>';
    if (dieta.comidas && dieta.comidas.length > 0) {
        const tiposComida = dieta.comidas.map(comida => comida.tipoComida).join(', ');
        comidasHTML = `
            <span class="badge bg-info">${dieta.comidas.length} comidas</span>
            <button class="btn btn-sm btn-outline-info ms-1" data-bs-toggle="tooltip" title="${tiposComida}">
                <i class="fas fa-info-circle"></i>
            </button>
        `;
    }
    
    // Configurar el contenido de la fila
    fila.innerHTML = `
        <td>${dieta.nombre}</td>
        <td>${dieta.descripcion || 'Sin descripción'}</td>
        <td>${fechaFormateada}</td>
        <td>${fechaFinFormateada}</td>
        <td>${comidasHTML}</td>
        <td>
            ${dieta.clienteId && dieta.clienteId.nombre ? 
                `${dieta.clienteId.nombre} ${dieta.clienteId.apellido || ''}` : 
                '<span class="badge bg-warning">No asignada</span>'}
        </td>
        <td>
            <button class="btn btn-sm btn-primary me-2 verDietaBtn" data-dieta-id="${dieta._id}">
                <i class="fas fa-eye me-1"></i>Ver
            </button>
            <button class="btn btn-sm btn-success asignarDietaBtn" data-dieta-id="${dieta._id}" ${dieta.clienteId ? 'disabled' : ''}>
                <i class="fas fa-user-plus me-1"></i>Asignar
            </button>
            <button class="btn btn-sm btn-warning editarDietaBtn" data-dieta-id="${dieta._id}">
                <i class="fas fa-edit me-1"></i>Editar
            </button>
        </td>
    `;
    
    // Insertar la fila al principio de la tabla
    if (tabla.firstChild) {
        tabla.insertBefore(fila, tabla.firstChild);
    } else {
        tabla.appendChild(fila);
    }
    
    console.log('Dieta agregada exitosamente a la tabla');
    
    // Configurar eventos para los botones de la nueva fila
    const verBtn = fila.querySelector('.verDietaBtn');
    if (verBtn) {
        verBtn.addEventListener('click', function() {
            verDetalleDieta(dieta._id);
        });
    }
    
    const asignarBtn = fila.querySelector('.asignarDietaBtn');
    if (asignarBtn) {
        asignarBtn.addEventListener('click', function() {
            mostrarModalAsignarDieta(dieta._id);
        });
    }
    
    const editarBtn = fila.querySelector('.editarDietaBtn');
    if (editarBtn) {
        editarBtn.addEventListener('click', function() {
            editarDieta(dieta._id);
        });
    }
}
function mostrarModalAsignarDieta(dietaId) {
    console.log('Mostrando modal para asignar dieta:', dietaId);
    
    // Obtener los clientes del entrenador
    const entrenadorId = document.querySelector('input[name="entrenadorId"]')?.value;
    if (!entrenadorId) {
        console.error('No se pudo obtener el ID del entrenador');
        mostrarAlerta('Error: No se pudo obtener la información del entrenador', 'danger');
        return;
    }
    
    // Configurar el modal
    document.getElementById('dietaId').value = dietaId;
    document.getElementById('confirmarAsignarDieta').setAttribute('data-dieta-id', dietaId);
    
    // Cargar la lista de clientes si no está ya cargada
    const selectCliente = document.getElementById('clienteParaDieta');
    if (selectCliente.options.length <= 1) {
        selectCliente.innerHTML = '<option value="">Cargando clientes...</option>';
        
        fetch(`/entrenadores/clientes`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los clientes');
                }
                return response.json();
            })
            .then(clientes => {
                if (!clientes || clientes.length === 0) {
                    selectCliente.innerHTML = '<option value="">No tienes clientes asignados</option>';
                    return;
                }
                
                selectCliente.innerHTML = '<option value="">Selecciona un cliente</option>';
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente._id;
                    option.textContent = `${cliente.nombre} ${cliente.apellido}`;
                    selectCliente.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar clientes:', error);
                selectCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
                mostrarAlerta('Error al cargar la lista de clientes', 'danger');
            });
    }
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('asignarDietaModal'));
    modal.show();
}

// Función para asignar dieta a cliente
function asignarDietaACliente() {
    // Evitar envíos duplicados
    if (asignandoDieta) {
        console.log('Ya hay una solicitud de asignación en proceso');
        return false;
    }
    
    // Obtener datos del formulario
    const dietaId = document.getElementById('dietaId').value;
    const clienteId = document.getElementById('clienteParaDieta').value;
    
    // Validar datos
    if (!dietaId) {
        mostrarAlerta('Error: No se ha seleccionado una dieta', 'danger');
        return;
    }
    
    if (!clienteId) {
        mostrarAlerta('Error: Debe seleccionar un cliente', 'danger');
        return;
    }
    
    // Marcar como enviando
    asignandoDieta = true;
    
    // Cambiar el estado del botón
    const btnConfirmar = document.getElementById('confirmarAsignarDieta');
    const originalBtnText = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Asignando...';
    btnConfirmar.disabled = true;
    
    // Enviar datos al servidor
    fetch(`/dietas/${dietaId}/asignar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clienteId })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Error al asignar la dieta');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dieta asignada con éxito:', data);
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('asignarDietaModal'));
        modal.hide();
        
        // Mostrar mensaje de éxito
        mostrarAlerta('Dieta asignada con éxito', 'success');
        
        // Actualizar la tabla de dietas
        actualizarTablaDietas();
    })
    .catch(error => {
        console.error('Error al asignar dieta:', error);
        mostrarAlerta('Error: ' + error.message, 'danger');
    })
    .finally(() => {
        // Restaurar el botón
        btnConfirmar.innerHTML = originalBtnText;
        btnConfirmar.disabled = false;
        asignandoDieta = false;
    });
}

// Función para actualizar la tabla de dietas
function actualizarTablaDietas() {
    const entrenadorId = document.querySelector('input[name="entrenadorId"]').value;
    
    fetch(`/dietas?entrenadorId=${entrenadorId}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener las dietas');
        }
        return response.json();
    })
    .then(dietas => {
        const tabla = document.getElementById('dietasTableBody');
        if (!tabla) {
            console.error('No se encontró la tabla de dietas');
            return;
        }
        
        // Limpiar la tabla
        tabla.innerHTML = '';
        
        // Si no hay dietas, mostrar mensaje
        if (!dietas || dietas.length === 0) {
            tabla.innerHTML = '<tr><td colspan="5" class="text-center">No hay planes nutricionales disponibles</td></tr>';
            return;
        }
        
        // Agregar cada dieta a la tabla
        dietas.forEach(dieta => {
            agregarDietaATabla(dieta);
        });
    })
    .catch(error => {
        console.error('Error al actualizar tabla de dietas:', error);
        mostrarAlerta('Error: ' + error.message, 'danger');
    });
}

// Función para ver el detalle de una dieta
function verDetalleDieta(dietaId) {
    fetch(`/dietas/${dietaId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener la dieta');
        }
        return response.json();
    })
    .then(dieta => {
        // Actualizar el modal con los datos de la dieta
        document.getElementById('dietaDetalleNombre').textContent = dieta.nombre;
        document.getElementById('dietaDetalleDescripcion').textContent = dieta.descripcion || 'Sin descripción';
        
        // Formatear fechas
        let fechaInicio = 'No definida';
        let fechaFin = 'No definida';
        
        if (dieta.fechaInicio) {
            fechaInicio = new Date(dieta.fechaInicio).toLocaleDateString();
        }
        
        if (dieta.fechaFin) {
            fechaFin = new Date(dieta.fechaFin).toLocaleDateString();
        }
        
        document.getElementById('dietaDetalleFechaInicio').textContent = fechaInicio;
        document.getElementById('dietaDetalleFechaFin').textContent = fechaFin;
        
        // Cliente asignado
        const clienteElement = document.getElementById('dietaDetalleCliente');
        if (dieta.clienteId && dieta.clienteId.nombre) {
            clienteElement.textContent = `${dieta.clienteId.nombre} ${dieta.clienteId.apellido || ''}`;
        } else {
            clienteElement.innerHTML = '<span class="badge bg-warning">No asignada</span>';
        }
        
        // Comidas
        const comidasContainer = document.getElementById('dietaDetalleComidas');
        comidasContainer.innerHTML = '';
        
        if (dieta.comidas && dieta.comidas.length > 0) {
            dieta.comidas.forEach(comida => {
                const comidaElement = document.createElement('div');
                comidaElement.className = 'comida-detalle mb-3 p-3 border rounded';
                comidaElement.innerHTML = `
                    <h6 class="mb-2">${comida.tipoComida}</h6>
                    <p class="mb-1"><strong>Descripción:</strong> ${comida.descripcion}</p>
                    <p class="mb-0"><strong>Calorías estimadas:</strong> ${comida.caloriasEstimadas || 'No especificadas'}</p>
                `;
                comidasContainer.appendChild(comidaElement);
            });
        } else {
            comidasContainer.innerHTML = '<p class="text-center">No hay comidas definidas</p>';
        }
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('verDietaModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error al obtener detalle de dieta:', error);
        mostrarAlerta('Error: ' + error.message, 'danger');
    });
}

// Función para agregar una nueva comida al formulario
function agregarNuevaComida() {
    const comidasContainer = document.getElementById('comidasContainer');
    const comidaItems = comidasContainer.querySelectorAll('.comida-item');
    const nuevoIndice = comidaItems.length;
    
    const nuevaComida = document.createElement('div');
    nuevaComida.className = 'comida-item card mb-3';
    nuevaComida.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="comida-numero">Comida #${nuevoIndice + 1}</span>
                <button type="button" class="btn btn-sm btn-outline-danger eliminar-comida">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-2">
                <label class="form-label">Tipo de Comida</label>
                <select class="form-select" name="comidas[${nuevoIndice}][tipoComida]">
                    <option value="Desayuno">Desayuno</option>
                    <option value="Almuerzo">Almuerzo</option>
                    <option value="Cena">Cena</option>
                    <option value="Merienda">Merienda</option>
                    <option value="Snack">Snack</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" name="comidas[${nuevoIndice}][descripcion]" rows="2" placeholder="Detalle de alimentos y cantidades"></textarea>
            </div>
            <div class="mb-2">
                <label class="form-label">Calorías Estimadas</label>
                <input type="number" class="form-control" name="comidas[${nuevoIndice}][caloriasEstimadas]" placeholder="Ej: 500">
            </div>
        </div>
    `;
    
    comidasContainer.appendChild(nuevaComida);
    
    // Agregar evento para eliminar la comida
    const btnEliminar = nuevaComida.querySelector('.eliminar-comida');
    btnEliminar.addEventListener('click', function() {
        nuevaComida.remove();
        actualizarNumerosComidas();
    });
}

// Función para actualizar los números de las comidas
function actualizarNumerosComidas() {
    const comidaItems = document.querySelectorAll('.comida-item');
    comidaItems.forEach((item, index) => {
        const numeroElement = item.querySelector('.comida-numero');
        if (numeroElement) {
            numeroElement.textContent = `Comida #${index + 1}`;
        }
    });
}

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón para agregar comidas
    const btnAgregarComida = document.getElementById('agregarComida');
    if (btnAgregarComida) {
        btnAgregarComida.addEventListener('click', agregarNuevaComida);
    }
    
    // Configurar el botón para asignar dieta
    const btnAsignarDieta = document.getElementById('confirmarAsignarDieta');
    if (btnAsignarDieta) {
        btnAsignarDieta.addEventListener('click', asignarDietaACliente);
    }
    
    // Configurar eventos para los botones de ver, asignar y editar dietas
    document.querySelectorAll('.verDietaBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dietaId = this.getAttribute('data-dieta-id');
            verDetalleDieta(dietaId);
        });
    });
    
    document.querySelectorAll('.asignarDietaBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dietaId = this.getAttribute('data-dieta-id');
            mostrarModalAsignarDieta(dietaId);
        });
    });
    
    document.querySelectorAll('.editarDietaBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dietaId = this.getAttribute('data-dieta-id');
            editarDieta(dietaId);
        });
    });
});
