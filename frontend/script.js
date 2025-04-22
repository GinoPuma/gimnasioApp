const API_URL = 'http://localhost:3000/api/usuarios';

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Error al registrar');
    form.reset();
    cargarUsuarios();
  } catch (err) {
    alert(err.message);
  }
});

async function cargarUsuarios() {
  const res = await fetch(API_URL);
  const usuarios = await res.json();

  const lista = document.getElementById('listaUsuarios');
  lista.innerHTML = '';

  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${usuario.nombre} ${usuario.apellido} (${usuario.estado}) 
      <button onclick="desactivarUsuario('${usuario._id}')">Desactivar</button>
    `;
    lista.appendChild(li);
  });
}

async function desactivarUsuario(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  cargarUsuarios();
}

cargarUsuarios();
