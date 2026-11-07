// --- RICK OS V2.0 : CYBERPUNK MULTIVERSE EDITION ---
// By THEADRIANOMX
const API_URL = 'https://panel.curvainfinitacentral.com';

// --- 1. NAVEGACIÓN Y VISTAS ---
const menuItems = document.querySelectorAll('.nav-item');
const vistas = document.querySelectorAll('.vista-seccion');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('activo'));
    item.classList.add('activo');

    const target = item.getAttribute('data-target');
    vistas.forEach(vista => vista.style.display = 'none');
    
    const vistaActiva = document.getElementById(`view-${target}`);
    if (vistaActiva) vistaActiva.style.display = 'block';

    if (target === 'subbots') cargarSubBotsDetallados();
  });
});

// --- 2. RADAR Y STATUS GLOBAL ---
async function consultarRadar() {
  const radarDiv = document.getElementById('radar-datos');
  const statusIndicator = document.getElementById('system-status-indicator');
  const statusText = document.getElementById('status-text');
  
  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const datos = await respuesta.json();
    
    if (datos.success) {
      statusIndicator.classList.add('online');
      statusText.innerText = "SYSTEM ONLINE";
      
      if (radarDiv) {
        if (datos.totalActivos === 0) {
          radarDiv.innerHTML = `<p style="color: var(--elec-turq); font-family: var(--font-cyber);">[ 0 ] DIMENSIONES ACTIVAS</p>`;
        } else {
          radarDiv.innerHTML = `
            <p style="color: var(--rad-green); font-family: var(--font-cyber); font-size: 1.2rem;">
              [ ${datos.totalActivos} ] FIRMAS DETECTADAS EN LA RED
            </p>`;
        }
      }
    }
  } catch (error) {
    statusIndicator.classList.remove('online');
    statusText.innerText = "SYSTEM OFFLINE";
    
    if (radarDiv) {
      radarDiv.innerHTML = '<p style="color: var(--inter-red); font-family: var(--font-cyber);">ERROR: NO SE PUDO ESTABLECER ENLACE CON TERMUX.</p>';
    }
  }
}

// --- 3. TELEMETRÍA DETALLADA DE SUB-BOTS ---
function calcularUptime(msInicio) {
    if (!msInicio) return 'N/A';
    const diff = Date.now() - msInicio;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
}

async function cargarSubBotsDetallados() {
  const contenedor = document.getElementById('contenedor-subbots-detallado');
  if (!contenedor) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const resultado = await respuesta.json();
    const bots = resultado.bots || [];

    if (bots.length === 0) {
      contenedor.innerHTML = '<p style="color: #666;">No hay Sub-Bots registrados en la matriz.</p>';
      return;
    }

    let html = '';
    bots.forEach(bot => {
      const comandos = bot.stats?.comandosUsados || bot.comandosExitosos || 0;
      const errores = bot.stats?.errores || bot.erroresTotal || 0;
      const ultimoError = bot.ultimoComandoFallido || bot.errorComando || 'Ninguno';
      const ramUso = bot.ram || bot.ramUsage || 'N/A';
      
      html += `
        <div style="background: rgba(0,0,0,0.5); border-left: 3px solid var(--neon-cyan); padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--neon-cyan); font-family: var(--font-cyber);">NODO: ${bot.id || bot.usuario || 'Desc.'}</span>
            <span style="color: var(--elec-turq); font-size: 12px; border: 1px solid var(--elec-turq); padding: 2px 6px; border-radius: 4px;">RAM: ${ramUso}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; color: #aaa;">
            <div>⏱️ Uptime: <span style="color:#fff">${calcularUptime(bot.uptime)}</span></div>
            <div>📊 Cmds: <span style="color:#fff">${comandos}</span></div>
            <div>⚠️ Errores: <span style="color:${errores > 0 ? 'var(--inter-red)' : 'var(--rad-green)'}">${errores}</span></div>
            <div style="grid-column: 1 / -1;">❌ Fallo: <span style="color:var(--inter-red)">${ultimoError}</span></div>
          </div>
        </div>
      `;
    });
    contenedor.innerHTML = html;
  } catch (error) {
    contenedor.innerHTML = '<p style="color: var(--inter-red);">Error crítico de lectura.</p>';
  }
}

// --- 4. INYECTOR DE CÓDIGO (PAIRING CODE) ---
const btnGenerar = document.getElementById('btn-generar');
if (btnGenerar) {
  btnGenerar.addEventListener('click', async () => {
    const input = document.getElementById('input-telefono');
    const telefono = input ? input.value.trim().replace(/\D/g, '') : '';

    if (!telefono) return alert('DATO INVÁLIDO: Ingresa un número numérico.');

    const box = document.getElementById('codigo_generado');
    const texto = document.getElementById('pairing_text');
    
    if (box) box.style.display = "block";
    if (texto) texto.innerText = "[ SINTONIZANDO ]";

    btnGenerar.innerText = 'PROCESANDO...';
    btnGenerar.disabled = true;

    try {
      const resInicio = await fetch(`${API_URL}/api/generar_codigo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: telefono })
      });
      const resultado = await resInicio.json();

      if (!resultado.success) throw new Error("Rechazado");

      let intentos = 0;
      const intervalo = setInterval(async () => {
        intentos++;
        try {
          const resCod = await fetch(`${API_URL}/api/leer_codigo`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: telefono })
          });
          const dataCod = await resCod.json();
          
          if (dataCod.success && dataCod.codigo) {
            if (texto) texto.innerText = dataCod.codigo;
            clearInterval(intervalo);
            btnGenerar.innerText = 'INICIAR SECUENCIA';
            btnGenerar.disabled = false;
          }
        } catch(e) {}

        if (intentos > 15) {
          clearInterval(intervalo);
          if (texto && texto.innerText === "[ SINTONIZANDO ]") texto.innerText = "TIMEOUT";
          btnGenerar.innerText = 'REINTENTAR SECUENCIA';
          btnGenerar.disabled = false;
        }
      }, 2000);

    } catch (err) {
      if (texto) texto.innerText = "ERROR DE ENLACE";
      btnGenerar.innerText = 'INICIAR SECUENCIA';
      btnGenerar.disabled = false;
    }
  });
}

// --- 5. INTERACCIONES DEL DIRECTORIO DE COMANDOS ---
const buscador = document.getElementById('buscador-cmd');
if(buscador) {
  buscador.addEventListener('input', (e) => {
    const filtro = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.cmd-item');
    items.forEach(item => {
      const texto = item.innerText.toLowerCase();
      item.style.display = texto.includes(filtro) ? 'flex' : 'none';
    });
  });
}

const copyBtns = document.querySelectorAll('.cmd-copy');
copyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.getAttribute('data-cmd');
    navigator.clipboard.writeText(cmd);
    const textoOriginal = btn.innerText;
    btn.innerText = "COPIADO";
    btn.style.color = "var(--rad-green)";
    btn.style.borderColor = "var(--rad-green)";
    setTimeout(() => {
      btn.innerText = textoOriginal;
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 1500);
  });
});

// --- 6. AUTENTICACIÓN SECURE / ACCESO AL PANEL PRIVADO ---
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    const inputLogin = document.getElementById('input-login');
    const numero = inputLogin ? inputLogin.value.trim().replace(/\D/g, '') : '';

    if (!numero) {
      alert('DATO INVÁLIDO: Ingresa un número.');
      return;
    }

    btnLogin.innerText = 'VERIFICANDO CREDENCIALES...';
    btnLogin.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/solicitar_acceso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: numero })
      });
      const data = await res.json();

      if (data.success) {
        alert('🚀 SOLICITUD ACEPTADA\nSi el número tiene un nodo activo, hemos enviado tu enlace de acceso seguro (con tu token) directamente a tu chat privado de WhatsApp.');
        inputLogin.value = '';
      } else {
        alert('Error en el enlace de seguridad.');
      }
    } catch (err) {
      alert('NO HAY CONEXIÓN CON EL NÚCLEO.');
    } finally {
      btnLogin.innerText = 'SOLICITAR LLAVE DE ACCESO';
      btnLogin.disabled = false;
    }
  });
}

// Inicializar
consultarRadar();
setInterval(consultarRadar, 5000);
