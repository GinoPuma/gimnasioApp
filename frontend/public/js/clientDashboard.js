// Efecto de máquina de escribir para el nombre de usuario
document.addEventListener('DOMContentLoaded', function() {
    const usernameElement = document.querySelector('.username');
    const name = usernameElement.textContent;
    usernameElement.textContent = '';
    
    let i = 0;
    const typingEffect = setInterval(() => {
        if (i < name.length) {
            usernameElement.textContent += name.charAt(i);
            i++;
        } else {
            clearInterval(typingEffect);
        }
    }, 100);
    
    // Efecto hover en tarjetas mejorado
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});