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

// --- 2. GESTIÓN DE NODOS Y USUARIOS (ESTILO PESTAÑAS FLOTANTES) ---
function calcularUptime(msInicio) {
    if (!msInicio) return 'N/A';
    const diff = Date.now() - msInicio;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
}

let botsCache = [];
let totalUsersCache = 0;

async function consultarRadarYUsuarios() {
  const countNodos = document.getElementById('count-nodos');
  const countUsuarios = document.getElementById('count-usuarios');
  const totalUsuariosModal = document.getElementById('total-usuarios-modal');
  const listaNodosModal = document.getElementById('lista-nodos-modal');
  const statusIndicator = document.getElementById('system-status-indicator');
  const statusText = document.getElementById('status-text');
  
  // 1. Obtener Sub-Bots para el modal de nodos
  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const datos = await respuesta.json();
    
    if (datos.success) {
      statusIndicator.classList.add('online');
      statusText.innerText = "SYSTEM ONLINE";
      botsCache = datos.bots || [];
      if (countNodos) countNodos.innerText = botsCache.length;

      if (listaNodosModal) {
        if (botsCache.length === 0) {
          listaNodosModal.innerHTML = '<p style="color: #666; font-size: 13px;">No hay nodos activos en la red.</p>';
        } else {
          listaNodosModal.innerHTML = botsCache.map(b => `
            <div style="background: rgba(0,0,0,0.4); border-left: 2px solid var(--neon-cyan); padding: 10px; border-radius: 0 6px 6px 0;">
              <div style="color: var(--neon-cyan); font-size: 12px; font-family: var(--font-cyber);">+${b.id}</div>
              <div style="color: #ccc; font-size: 13px; margin-top: 2px;">Firma: ${b.firmaWTK || 'SubBot'}</div>
            </div>
          `).join('');
        }
      }
    }
  } catch (error) {
    statusIndicator.classList.remove('online');
    statusText.innerText = "SYSTEM OFFLINE";
  }

  // 2. Obtener Usuarios Registrados
  try {
    const resUser = await fetch(`${API_URL}/api/usuarios_stats`);
    const dataUser = await resUser.json();
    if (dataUser.success) {
      totalUsersCache = dataUser.total || 0;
      if (countUsuarios) countUsuarios.innerText = totalUsersCache;
      if (totalUsuariosModal) totalUsuariosModal.innerText = totalUsersCache;
    }
  } catch (e) {
    if (countUsuarios) countUsuarios.innerText = "0";
  }
}

// Controladores de apertura y cierre de las pestañas modales
const btnVerNodos = document.getElementById('btn-ver-nodos');
const modalNodos = document.getElementById('modal-nodos');
const cerrarModalNodos = document.getElementById('cerrar-modal-nodos');

if (btnVerNodos && modalNodos) {
  btnVerNodos.addEventListener('click', () => modalNodos.style.display = 'flex');
}
if (cerrarModalNodos && modalNodos) {
  cerrarModalNodos.addEventListener('click', () => modalNodos.style.display = 'none');
}

const btnVerUsuarios = document.getElementById('btn-ver-usuarios');
const modalUsuarios = document.getElementById('modal-usuarios');
const cerrarModalUsuarios = document.getElementById('cerrar-modal-usuarios');

if (btnVerUsuarios && modalUsuarios) {
  btnVerUsuarios.addEventListener('click', () => modalUsuarios.style.display = 'flex');
}
if (cerrarModalUsuarios && modalUsuarios) {
  cerrarModalUsuarios.addEventListener('click', () => modalUsuarios.style.display = 'none');
}

// --- 3. TELEMETRÍA DETALLADA DE SUB-BOTS (VISTA NODOS) ---
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

// --- 7. CHAT DIMENSIONAL (MODO HACKER + REACCIONES) ---
const chatBox = document.getElementById('chat-box');
const inputChat = document.getElementById('input-chat');
const btnEnviarChat = document.getElementById('btn-enviar-chat');
let ultimoScroll = true; 

async function cargarChat() {
  if (!chatBox) return;
  try {
    const res = await fetch(`${API_URL}/api/chat`);
    const mensajes = await res.json();
    
    const estaAbajo = chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 10;

    chatBox.innerHTML = mensajes.map(m => {
      let reaccionesHtml = '';
      if (m.reacciones) {
        reaccionesHtml = Object.entries(m.reacciones).map(([emoji, count]) => 
          `<span style="background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); border-radius: 10px; padding: 2px 6px; font-size: 10px; margin-right: 4px; cursor: pointer; color: var(--neon-cyan);" onclick="reaccionar('${m.id}', '${emoji}')">${emoji} ${count}</span>`
        ).join('');
      }

      if (m.rol === 'creador') {
        return `
          <div style="align-self: flex-end; max-width: 85%; background: rgba(161, 0, 255, 0.1); border: 1px solid rgba(161, 0, 255, 0.8); border-radius: 12px 12px 0 12px; padding: 10px 14px; box-shadow: 0 0 15px rgba(161, 0, 255, 0.3); position: relative;">
            <div style="font-size: 11px; color: #d78eff; font-weight: bold; margin-bottom: 4px; font-family: var(--font-cyber); letter-spacing: 1px;">👑 THE CREADOR <span style="color: rgba(255,255,255,0.4); font-weight: normal; font-size: 9px; float: right; margin-top: 1px;">${m.time}</span></div>
            <div style="color: #fff; font-size: 14px; line-height: 1.4; text-shadow: 0 0 5px rgba(255,255,255,0.3);">${m.texto}</div>
            <div style="margin-top: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
              ${reaccionesHtml}
              <button onclick="menuReacciones('${m.id}')" style="background: transparent; border: 1px dashed rgba(215,142,255,0.4); color: #d78eff; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="align-self: flex-start; max-width: 85%; background: rgba(0, 245, 255, 0.05); border: 1px solid rgba(0, 245, 255, 0.2); border-radius: 12px 12px 12px 0; padding: 10px 14px; position: relative;">
            <div style="font-size: 11px; color: rgba(0, 245, 255, 0.8); margin-bottom: 4px; font-family: var(--font-cyber);">ANÓNIMO <span style="color: rgba(255,255,255,0.3); font-size: 9px; float: right; margin-top: 1px;">${m.time}</span></div>
            <div style="color: #ccc; font-size: 14px; line-height: 1.4;">${m.texto}</div>
            <div style="margin-top: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
              ${reaccionesHtml}
              <button onclick="menuReacciones('${m.id}')" style="background: transparent; border: 1px dashed rgba(0,245,255,0.4); color: var(--neon-cyan); border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
            </div>
          </div>
        `;
      }
    }).join('');
    
    if (mensajes.length === 0) {
      chatBox.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; margin-top: auto; margin-bottom: auto;">La sala está vacía. Sé el primero en hablar.</p>';
    }

    if (estaAbajo || ultimoScroll) {
      chatBox.scrollTop = chatBox.scrollHeight;
      ultimoScroll = false;
    }
  } catch(e) {}
}

window.reaccionar = async function(idMsg, emoji) {
  try {
    await fetch(`${API_URL}/api/chat/reaccionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(idMsg), emoji })
    });
    cargarChat();
  } catch(e) {}
};

window.menuReacciones = function(idMsg) {
  const emojis = ['🚀', '🔥', '💀', '❤️', '😂', '⚡'];
  const seleccion = prompt(`Elige una reacción:\n${emojis.join('  ')}\n\nEscribe el emoji:`);
  if (seleccion && emojis.includes(seleccion.trim())) {
    window.reaccionar(idMsg, seleccion.trim());
  }
};

if (btnEnviarChat && inputChat) {
  btnEnviarChat.addEventListener('click', async () => {
    let texto = inputChat.value.trim();
    if (!texto) return;

    let rol = "user";
    let password = "";

    if (texto.startsWith('/rick ')) {
      texto = texto.replace('/rick ', '');
      password = prompt('🔐 PROTOCOLO DIOS:\nIngresa la contraseña maestra de Termux para hablar como el Creador:');
      if (password === null) return; 
      rol = "creador";
    }

    inputChat.value = '';
    btnEnviarChat.disabled = true;
    
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, rol, password })
      });
      
      if (res.status === 403) {
        alert("❌ ACCESO DENEGADO: La contraseña es incorrecta. Infiltrado detectado.");
      } else {
        ultimoScroll = true; 
        await cargarChat();
      }
    } catch(e) {
      alert("Error de conexión al Enviar.");
    } finally {
      btnEnviarChat.disabled = false;
      inputChat.focus();
    }
  });
  
  inputChat.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnEnviarChat.click();
  });

  cargarChat();
  setInterval(cargarChat, 3000);
}

// Inicializar y consultar el estado de nodos y usuarios
consultarRadarYUsuarios();
setInterval(consultarRadarYUsuarios, 5000);
          
