// Mostrar/ocultar campos según tipo de usuario
$(document).ready(function() {
    $('#tipoUsuario').change(function() {
        const selected = $(this).val();
        
        $('.user-type-section').hide();
        
        if (selected === 'cliente') {
            $('#camposCliente').show();
        } else if (selected === 'entrenador') {
            $('#camposEntrenador').show();
        }
    });
    
    // Navegación entre pestañas
    $('.next-btn').click(function() {
        const nextTab = $(this).data('next');
        $(`#${nextTab}-tab`).tab('show');
        
        // Validar campos antes de avanzar
        if (nextTab === 'type') {
            const currentTab = $(this).closest('.tab-pane');
            let isValid = true;
            
            currentTab.find('[required]').each(function() {
                if (!$(this).val()) {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            
            if (!isValid) {
                alert('Por favor complete todos los campos requeridos');
                return false;
            }
        }
    });
    
    $('.prev-btn').click(function() {
        const prevTab = $(this).data('prev');
        $(`#${prevTab}-tab`).tab('show');
    });
});

// Alternar visibilidad de contraseña
function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Validación en tiempo real
$(document).on('input', '[required]', function() {
    if ($(this).val()) {
        $(this).removeClass('is-invalid');
    } else {
        $(this).addClass('is-invalid');
    }
});