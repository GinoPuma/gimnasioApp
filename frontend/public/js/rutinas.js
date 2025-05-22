// Funciones para gestionar rutinas

// Variable para controlar si ya se está enviando una solicitud
let enviandoRutina = false;

// Función para crear nueva rutina
function crearNuevaRutina(event) {
    // Prevenir comportamiento por defecto del formulario
    event.preventDefault();
    
    // Evitar envíos duplicados
    if (enviandoRutina) {
        console.log('Ya hay una solicitud en proceso');
        return false;
    }
    
    // Marcar como enviando
    enviandoRutina = true;
    
    // Obtener el botón de envío y mostrar indicador de carga
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando...';
    submitBtn.disabled = true;
    
    // Obtener el formulario
    const form = document.getElementById('nuevaRutinaForm');
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    
    // Obtener los días de la semana seleccionados
    const diasSemana = [];
    form.querySelectorAll('input[name="diasSemana[]"]:checked').forEach(checkbox => {
        diasSemana.push(checkbox.value);
    });
    
    // Crear objeto de datos
    const rutinaData = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        duracionSemanas: formData.get('duracionSemanas'),
        fechaInicio: formData.get('fechaInicio'),
        estado: formData.get('estado'),
        entrenadorId: formData.get('entrenadorId'),
        diasSemana: diasSemana
    };
    
    console.log('Enviando datos de rutina:', rutinaData);
    
    // Enviar datos al servidor
    fetch('/rutinas/crear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rutinaData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Error al crear la rutina');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Rutina creada con éxito:', data);
        
        // Mostrar mensaje de éxito
        mostrarAlerta('Rutina creada con éxito', 'success');
        
        // Limpiar el formulario
        form.reset();
        
        // Agregar la nueva rutina a la tabla
        agregarRutinaATabla(data);
    })
    .catch(error => {
        console.error('Error al crear rutina:', error);
        mostrarAlerta('Error: ' + error.message, 'danger');
    })
    .finally(() => {
        // Restaurar el botón
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        enviandoRutina = false;
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

// Función para agregar una rutina a la tabla
function agregarRutinaATabla(rutina) {
    console.log('Agregando rutina a tabla:', rutina);
    
    // Obtener la tabla
    const tabla = document.getElementById('rutinasTableBody');
    if (!tabla) {
        console.error('No se encontró la tabla de rutinas');
        return;
    }
    
    // Crear una nueva fila
    const fila = document.createElement('tr');
    
    // Formatear la fecha
    let fechaFormateada = 'No definida';
    if (rutina.fechaInicio) {
        try {
            fechaFormateada = new Date(rutina.fechaInicio).toLocaleDateString();
        } catch (e) {
            console.error('Error al formatear fecha:', e);
        }
    }
    
    // Determinar la clase de la insignia según el estado
    let badgeClass = 'badge-secondary';
    if (rutina.estado === 'Activa') {
        badgeClass = 'badge-success';
    } else if (rutina.estado === 'Inactiva') {
        badgeClass = 'badge-warning';
    }
    
    // Configurar el contenido de la fila
    fila.innerHTML = `
        <td>${rutina.nombre}</td>
        <td>${rutina.descripcion || 'Sin descripción'}</td>
        <td>${rutina.duracionSemanas} semanas</td>
        <td>${fechaFormateada}</td>
        <td>
            <span class="badge badge-custom ${badgeClass}">
                ${rutina.estado}
            </span>
        </td>
        <td>
            <a href="/rutinas/${rutina._id}" class="btn btn-sm btn-primary me-2 verRutinaBtn">Ver</a>
            <a href="/rutinas/${rutina._id}/asignar/${rutina.entrenadorId}" class="btn btn-sm btn-success">Asignar</a>
            <a href="/rutinas/${rutina._id}/editar" class="btn btn-sm btn-warning editarRutinaBtn">Editar</a>
        </td>
    `;
    
    // Insertar la fila al principio de la tabla
    if (tabla.firstChild) {
        tabla.insertBefore(fila, tabla.firstChild);
    } else {
        tabla.appendChild(fila);
    }
    
    console.log('Rutina agregada exitosamente a la tabla');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el formulario de nueva rutina
    const formNuevaRutina = document.getElementById('nuevaRutinaForm');
    if (formNuevaRutina) {
        formNuevaRutina.addEventListener('submit', crearNuevaRutina);
    }
});
