// Tu túnel activo
const API_URL = 'https://panel.curvainfinitacentral.com';

// --- 1. LÓGICA DE NAVEGACIÓN ENTRE VISTAS ---
const menuItems = document.querySelectorAll('.sidebar-menu-item');
const vistas = document.querySelectorAll('.vista-seccion');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remover clase activo de todas las opciones del menú
    menuItems.forEach(i => i.classList.remove('activo'));
    item.classList.add('activo');

    // Obtener la vista de destino
    const target = item.getAttribute('data-target');
    
    // Ocultar todas las vistas y mostrar solo la seleccionada
    vistas.forEach(vista => {
      vista.style.display = 'none';
    });
    
    const vistaActiva = document.getElementById(`view-${target}`);
    if (vistaActiva) {
      vistaActiva.style.display = 'block';
    }
  });
});

// --- 2. RADAR Y ESTADO DEL NÚCLEO ---
async function consultarRadar() {
  const radarDiv = document.getElementById('radar-datos');
  const countSpan = document.getElementById('dimensiones-count');
  const estadoTexto = document.getElementById('estado-texto');
  
  if (!radarDiv || !countSpan || !estadoTexto) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const datos = await respuesta.json();
    
    if (datos.success) {
      estadoTexto.innerText = "CONECTADO AL MULTIVERSO";
      estadoTexto.style.color = "#00ffcc";
      countSpan.innerText = datos.totalActivos;
      
      if (datos.totalActivos === 0) {
        radarDiv.innerHTML = '<p style="color: #888;">No hay Sub-Bots activos en este momento.</p>';
      } else {
        radarDiv.innerHTML = `<p style="color: #00ffcc;">Detectadas ${datos.totalActivos} firmas activas.</p>`;
      }
    }
  } catch (error) {
    estadoTexto.innerText = "ERROR DE CONEXIÓN CON EL NÚCLEO";
    estadoTexto.style.color = "#ff4444";
    radarDiv.innerHTML = '<p style="color: #ff4444;">No se pudo contactar al servidor de Termux.</p>';
  }
}

// --- 3. INYECTOR DE CÓDIGO (PAIRING CODE) ---
const btnGenerar = document.getElementById('btn-generar');
if (btnGenerar) {
  btnGenerar.addEventListener('click', async () => {
    const inputTelefono = document.getElementById('input-telefono');
    const telefono = inputTelefono ? inputTelefono.value.trim() : '';

    if (!telefono) {
      alert('Por favor ingresa un número de teléfono válido.');
      return;
    }

    btnGenerar.innerText = 'GENERANDO...';
    btnGenerar.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: telefono })
      });
      const resultado = await res.json();

      if (resultado.success) {
        alert(`Código generado con éxito: ${resultado.code || 'Revisa tu consola'}`);
      } else {
        alert('Error al generar el código en el núcleo.');
      }
    } catch (err) {
      alert('No se pudo conectar con el servidor para generar el código.');
    } finally {
      btnGenerar.innerText = 'GENERAR PAIRING CODE';
      btnGenerar.disabled = false;
    }
  });
}

// Iniciar radar al cargar y refrescar cada 5 segundos
consultarRadar();
setInterval(consultarRadar, 5000);
