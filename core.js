const API_URL = 'https://panel.curvainfinitacentral.com';

// --- 1. LÓGICA DE NAVEGACIÓN ENTRE VISTAS ---
const menuItems = document.querySelectorAll('.sidebar-menu-item');
const vistas = document.querySelectorAll('.vista-seccion');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('activo'));
    item.classList.add('activo');

    const target = item.getAttribute('data-target');
    vistas.forEach(vista => {
      vista.style.display = 'none';
    });
    
    const vistaActiva = document.getElementById(`view-${target}`);
    if (vistaActiva) {
      vistaActiva.style.display = 'block';
    }

    if (target === 'subbots') {
      cargarSubBotsDetallados();
    }
  });
});

// --- 2. RADAR Y ESTADO DEL NÚCLEO ---
async function consultarRadar() {
  const countSpan = document.getElementById('dimensiones-count');
  const estadoTexto = document.getElementById('estado-texto');
  const radarDiv = document.getElementById('radar-datos');
  
  if (!countSpan || !estadoTexto) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const datos = await respuesta.json();
    
    if (datos.success) {
      estadoTexto.innerText = "CONECTADO AL MULTIVERSO";
      estadoTexto.style.color = "#00ffcc";
      countSpan.innerText = datos.totalActivos;
      
      if (radarDiv) {
        if (datos.totalActivos === 0) {
          radarDiv.innerHTML = '<p style="color: #888;">No hay Sub-Bots activos en este momento.</p>';
        } else {
          radarDiv.innerHTML = `<p style="color: #00ffcc;">Detectadas ${datos.totalActivos} firmas activas.</p>`;
        }
      }
    }
  } catch (error) {
    estadoTexto.innerText = "ERROR DE CONEXIÓN CON EL NÚCLEO";
    estadoTexto.style.color = "#ff4444";
    if (radarDiv) {
      radarDiv.innerHTML = '<p style="color: #ff4444;">No se pudo contactar al servidor de Termux.</p>';
    }
  }
}

// --- 3. TELEMETRÍA DETALLADA (COMANDOS, ERRORES, RAM POR USUARIO) ---
function calcularUptime(msInicio) {
    if (!msInicio) return 'N/A';
    const diff = Date.now() - msInicio;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
}

async function cargarSubBotsDetallados() {
  const contenedor = document.getElementById('contenedor-subbots-detallado');
  if (!contenedor) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const resultado = await respuesta.json();

    const bots = resultado.bots || [];

    if (bots.length === 0) {
      contenedor.innerHTML = '<p style="color: #888;">No hay Sub-Bots activos registrados en este momento.</p>';
      return;
    }

    let html = '';
    bots.forEach(bot => {
      const comandos = bot.stats?.comandosUsados || bot.comandosExitosos || 0;
      const errores = bot.stats?.errores || bot.erroresTotal || 0;
      const ultimoError = bot.ultimoComandoFallido || bot.errorComando || 'Ninguno';
      const ramUso = bot.ram || bot.ramUsage || 'N/A';
      const uptimeTxt = calcularUptime(bot.uptime);

      html += `
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 255, 204, 0.2); border-radius: 12px; padding: 20px; box-sizing: border-box; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="color: #00ffcc; font-weight: bold; font-size: 16px;">🤖 Usuario: ${bot.id || bot.usuario || 'Desconocido'}</span>
            <span style="background: rgba(0, 255, 204, 0.1); color: #00ffcc; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-family: monospace;">RAM: ${ramUso}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 14px; color: #ccc;">
            <div>⏱️ Uptime: <strong style="color: #fff;">${uptimeTxt}</strong></div>
            <div>📊 Comandos usados: <strong style="color: #fff;">${comandos}</strong></div>
            <div>⚠️ Errores totales: <strong style="color: ${errores > 0 ? '#ff4444' : '#00ffcc'};">${errores}</strong></div>
            <div style="grid-column: 1 / -1;">❌ Último comando fallido: <code style="color: #ff8888; background: rgba(255,0,0,0.1); padding: 2px 6px; border-radius: 4px;">${ultimoError}</code></div>
          </div>
        </div>
      `;
    });

    contenedor.innerHTML = html;

  } catch (error) {
    contenedor.innerHTML = '<p style="color: #ff4444;">Error al sincronizar la telemetría con el servidor de Termux.</p>';
  }
}

// --- 4. INYECTOR DE CÓDIGO (PAIRING CODE) ---
const btnGenerar = document.getElementById('btn-generar');
if (btnGenerar) {
  btnGenerar.addEventListener('click', async () => {
    const inputTelefono = document.getElementById('input-telefono');
    const telefono = inputTelefono ? inputTelefono.value.trim().replace(/\D/g, '') : '';

    if (!telefono) {
      alert('Por favor ingresa un número de teléfono válido.');
      return;
    }

    btnGenerar.innerText = 'GENERANDO...';
    btnGenerar.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/generar_codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: telefono })
      });
      const resultado = await res.json();

      if (resultado.success) {
        alert('Solicitud de pairing code enviada al núcleo con éxito.');
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
